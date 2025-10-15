// Scraper for Euro-Access EU funding opportunities
// Scrapes list page, extracts detail URLs, scrapes each detail page,
// translates to Macedonian, and generates SQL dump for Supabase

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const crypto = require('crypto');

// Translation function using Google Translate API
async function translateToMacedonian(text) {
  if (!text || text.trim() === '') return text;

  try {
    // Using a free translation service - you may need to replace with your preferred API
    const axios = require('axios');
    const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
      params: {
        client: 'gtx',
        sl: 'en',
        tl: 'mk',
        dt: 't',
        q: text.substring(0, 1000) // Limit text length
      }
    });

    if (response.data && response.data[0] && response.data[0][0] && response.data[0][0][0]) {
      return response.data[0][0][0];
    }
  } catch (error) {
    console.warn('Translation failed, using original text:', error.message);
  }

  return text; // Fallback to original text
}

// Parse date from Euro-Access format (e.g., "27.01.2026 17:00")
function parseDeadline(deadlineText) {
  if (!deadlineText) return null;
  const match = deadlineText.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
  if (match) {
    const [, day, month, year, hour, minute] = match;
    return `${year}-${month}-${day}T${hour}:${minute}:00Z`;
  }
  return null;
}

// Extract data from list page
async function scrapeListPage(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EuroAccessScraper/1.0)'
      }
    });

    const $ = cheerio.load(response.data);
    const calls = [];

    $('#calls-overview tbody tr').each((index, element) => {
      const $row = $(element);
      const program = $row.find('td.title').text().trim();
      const $link = $row.find('td a');
      const title = $link.attr('title') || $link.text().trim();
      const detailUrl = $link.attr('href');
      const deadlineText = $row.find('td').last().text().trim();

      if (detailUrl && title) {
        calls.push({
          program,
          title,
          detailUrl: detailUrl.startsWith('http') ? detailUrl : `https://www.euro-access.eu${detailUrl}`,
          deadlineText
        });
      }
    });

    return calls;
  } catch (error) {
    console.error('Error scraping list page:', error.message);
    return [];
  }
}

// Extract data from detail page
async function scrapeDetailPage(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EuroAccessScraper/1.0)'
      }
    });

    const $ = cheerio.load(response.data);
    const data = {};

    // Call key data section
    const keyDataSection = $('#calldata .subtable').first();
    keyDataSection.find('.tr').each((index, element) => {
      const $tr = $(element);
      const title = $tr.find('.title').text().trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const value = $tr.find('.td').last().text().trim();
      if (title && value) {
        data[title] = value;
      }
    });

    // Extract deadline from the deadline section
    const deadlineSection = $('.tr.deadline');
    if (deadlineSection.length > 0) {
      // Get all p elements in the deadline section
      const deadlineParagraphs = deadlineSection.find('p');
      let deadlineText = '';
      
      deadlineParagraphs.each((i, el) => {
        const text = $(el).text().trim();
        if (text.includes('Deadline')) {
          deadlineText = text.replace('Deadline', '').trim();
        }
      });
      
      if (deadlineText) {
        data.deadlines = `Deadline ${deadlineText}`;
      } else {
        // Fallback: get the entire deadline section text
        const fullDeadlineText = deadlineSection.text().trim();
        data.deadlines = fullDeadlineText;
      }
    }

    // Call content section
    const contentSection = $('#calldata .subtable').eq(1);
    contentSection.find('.tr').each((index, element) => {
      const $tr = $(element);
      const title = $tr.find('.title').text().trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const $value = $tr.find('.td');
      let value = $value.text().trim();
      // Handle readmore content
      if ($value.find('.readmore').length) {
        value = $value.find('.readmorewrap').text().trim();
      }
      if (title && value) {
        data[title] = value;
      }
    });

    // Eligibility Criteria section
    const eligibilitySection = $('#calldata .subtable').eq(2);
    eligibilitySection.find('.tr').each((index, element) => {
      const $tr = $(element);
      const title = $tr.find('.title').text().trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const value = $tr.find('.td').text().trim();
      if (title && value) {
        data[title] = value;
      }
    });

    // Additional information section
    const additionalSection = $('#calldata .subtable').eq(3);
    additionalSection.find('.tr').each((index, element) => {
      const $tr = $(element);
      const title = $tr.find('.title').text().trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const $value = $tr.find('.td');
      let value = $value.text().trim();
      // Handle topics
      if (title === 'topics') {
        value = $value.find('.topics').text().trim();
      }
      // Handle UN SDGs
      if (title === 'un_sustainable_development_goals__un_sdgs_') {
        // Extract detailed SDG information
        const sdgText = $value.find('img').attr('title') || $value.text().trim();
        value = sdgText;
      }
      if (title && value) {
        data[title] = value;
      }
    });

    // Look for additional fields that might be in different sections
    // Funding rate, EU contribution, project duration, etc.
    $('#calldata .tr').each((index, element) => {
      const $tr = $(element);
      const title = $tr.find('.title').text().trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const value = $tr.find('.td').last().text().trim();

      // Extract additional fields
      if (title.includes('funding_rate') || title === 'funding_rate') {
        data.funding_rate = value;
      }
      if (title.includes('estimated_eu_contribution') || title === 'estimated_eu_contribution_per_project') {
        data.estimated_eu_contribution_per_project = value;
      }
      if (title.includes('project_duration') || title === 'project_duration') {
        data.project_duration = value;
      }
      if (title.includes('relevance_for_eu_macro') || title === 'relevance_for_eu_macro_region') {
        data.relevance_for_eu_macro_region = value;
      }
      if (title.includes('other_eligibility') || title === 'other_eligibility_criteria') {
        data.other_eligibility_criteria = value;
      }
      if (title.includes('call_documents') || title === 'call_documents') {
        data.call_documents = value;
      }
    });

    // Try to extract from the entire page for fields that might be in different locations
    const pageText = $('body').text();

    // Extract funding rate (e.g., "70%")
    const fundingRateMatch = pageText.match(/(?:Funding rate|Funding)\s*[:.\s]*(\d+)%/i);
    if (fundingRateMatch && !data.funding_rate) {
      data.funding_rate = fundingRateMatch[1] + '%';
    }

    // Extract EU contribution with more patterns (e.g., "max. € 2,500,000.00", "EUR 500,000")
    const euContributionPatterns = [
      /(?:max\.?\s*)?€\s*[\d,]+(?:\.\d+)?/i,
      /EUR\s*[\d,]+(?:\.\d+)?/i,
      /euro\s*[\d,]+(?:\.\d+)?/i,
      /estimated\s+eu\s+contribution[^€\d]*€?\s*[\d,]+(?:\.\d+)?/i
    ];
    
    for (const pattern of euContributionPatterns) {
      const match = pageText.match(pattern);
      if (match && !data.estimated_eu_contribution_per_project) {
        data.estimated_eu_contribution_per_project = match[0].trim();
        break;
      }
    }

    // Extract project duration with more patterns
    const durationPatterns = [
      /max\.?\s*(\d+)\s*months?/i,
      /duration[^:]*:\s*(\d+)\s*months?/i,
      /(\d+)\s*months?\s*duration/i,
      /project\s+duration[^:]*(\d+)\s*months?/i
    ];
    
    for (const pattern of durationPatterns) {
      const match = pageText.match(pattern);
      if (match && !data.project_duration) {
        data.project_duration = match[1] + ' months';
        break;
      }
    }

    // Look for budget information in specific sections
    $('#calldata .tr').each((index, element) => {
      const $tr = $(element);
      const title = $tr.find('.title').text().trim().toLowerCase();
      const value = $tr.find('.td').text().trim();

      if (title.includes('contribution') || title.includes('budget')) {
        if (!data.estimated_eu_contribution_per_project) {
          data.estimated_eu_contribution_per_project = value;
        }
      }
      if (title.includes('rate') || title.includes('funding')) {
        if (!data.funding_rate && value.includes('%')) {
          data.funding_rate = value;
        }
      }
    });

    return data;
  } catch (error) {
    console.error('Error scraping detail page:', error.message);
    return {};
  }
}

// Generate SQL INSERT statement
function generateSQLInsert(callData, sourceId) {
  const {
    funding_program,
    call_number,
    deadlines,
    link_to_the_call,
    link_to_the_submission,
    short_description,
    call_objectives,
    regions__countries_for_funding,
    eligible_entities,
    mandatory_partnership,
    project_partnership,
    topics,
    un_sustainable_development_goals__un_sdgs_,
    additional_information,
    contact,
    funding_rate,
    estimated_eu_contribution_per_project,
    project_duration,
    relevance_for_eu_macro_region,
    other_eligibility_criteria,
    call_documents
  } = callData;

  // Parse deadline
  let deadline = null;
  if (deadlines) {
    const match = deadlines.match(/Deadline\s*(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})/);
    if (match) {
      deadline = parseDeadline(match[1]);
    }
  }

  // Calculate days left
  let daysLeft = null;
  if (deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Create content hash
  const hash = crypto.createHash('sha256');
  hash.update(`${callData.title || ''}${callData.detailUrl || ''}${deadline || ''}`);
  const contentHash = hash.digest('hex');

  // Translate title and description to Macedonian
  const titleMk = callData.title; // Will be translated
  const descriptionMk = short_description; // Will be translated

  const sql = `INSERT INTO euro_access_grants (
    source_id,
    source_url,
    title,
    title_mk,
    description,
    description_mk,
    deadline,
    days_left,
    url,
    type,
    tags,
    content_hash,
    raw_html,
    created_at,
    updated_at,
    funding_program,
    call_number,
    call_objectives,
    regions_countries_for_funding,
    eligible_entities,
    mandatory_partnership,
    project_partnership,
    topics,
    un_sdgs,
    additional_information,
    contact,
    funding_rate,
    estimated_eu_contribution_per_project,
    project_duration,
    relevance_for_eu_macro_region,
    other_eligibility_criteria,
    call_documents
  ) VALUES (
    '${sourceId}',
    'https://www.euro-access.eu/en/calls',
    '${(callData.title || '').replace(/'/g, "''")}',
    '${(titleMk || '').replace(/'/g, "''")}',
    '${(short_description || '').replace(/'/g, "''")}',
    '${(descriptionMk || '').replace(/'/g, "''")}',
    ${deadline ? `'${deadline}'` : 'NULL'},
    ${daysLeft !== null ? daysLeft : 'NULL'},
    '${callData.detailUrl || ''}',
    'grants',
    '{"eu-funding", "erasmus"}',
    '${contentHash}',
    '',
    NOW(),
    NOW(),
    '${(funding_program || '').replace(/'/g, "''")}',
    '${(call_number || '').replace(/'/g, "''")}',
    '${(call_objectives || '').replace(/'/g, "''")}',
    '${(regions__countries_for_funding || '').replace(/'/g, "''")}',
    '${(eligible_entities || '').replace(/'/g, "''")}',
    '${(mandatory_partnership || '').replace(/'/g, "''")}',
    '${(project_partnership || '').replace(/'/g, "''")}',
    '${(topics || '').replace(/'/g, "''")}',
    '${(un_sustainable_development_goals__un_sdgs_ || '').replace(/'/g, "''")}',
    '${(additional_information || '').replace(/'/g, "''")}',
    '${(contact || '').replace(/'/g, "''")}',
    '${(funding_rate || '').replace(/'/g, "''")}',
    '${(estimated_eu_contribution_per_project || '').replace(/'/g, "''")}',
    '${(project_duration || '').replace(/'/g, "''")}',
    '${(relevance_for_eu_macro_region || '').replace(/'/g, "''")}',
    '${(other_eligibility_criteria || '').replace(/'/g, "''")}',
    '${(call_documents || '').replace(/'/g, "''")}'
  ) ON CONFLICT (content_hash) DO NOTHING;\n`;

  return sql;
}

// Main scraper function
async function scrapeEuroAccess() {
  const listUrl = 'https://www.euro-access.eu/en/calls?keyword=&submit=&sent=search';
  const sourceId = 'euro-access'; // Matches the ID in the euro_access_sources table

  console.log('Scraping Euro-Access list page...');
  const calls = await scrapeListPage(listUrl);

  console.log(`Found ${calls.length} calls. Scraping details...`);

  const sqlStatements = [];

  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    console.log(`Scraping call ${i + 1}/${calls.length}: ${call.title}`);

    const detailData = await scrapeDetailPage(call.detailUrl);

    // Merge list data with detail data
    const fullData = { ...call, ...detailData };

    // Translate relevant fields
    if (fullData.title) {
      fullData.title_mk = await translateToMacedonian(fullData.title);
    }
    if (fullData.short_description) {
      fullData.description_mk = await translateToMacedonian(fullData.short_description);
    }

    const sql = generateSQLInsert(fullData, sourceId);
    sqlStatements.push(sql);

    // Add delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Write to file
  const sqlDump = sqlStatements.join('\n');
  fs.writeFileSync('euro_access_grants.sql', sqlDump);

  console.log(`Generated SQL dump with ${sqlStatements.length} INSERT statements.`);
}

// Run the scraper
if (require.main === module) {
  scrapeEuroAccess().catch(console.error);
}

module.exports = { scrapeEuroAccess, scrapeListPage, scrapeDetailPage };