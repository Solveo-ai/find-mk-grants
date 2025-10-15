// Test script for Euro-Access scraper using local HTML files
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Import functions directly
function parseDeadline(deadlineText) {
  if (!deadlineText) return null;
  const match = deadlineText.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
  if (match) {
    const [, day, month, year, hour, minute] = match;
    return `${year}-${month}-${day}T${hour}:${minute}:00Z`;
  }
  return null;
}

function scrapeListPageLocal(html) {
  const $ = cheerio.load(html);
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
}

function scrapeDetailPageLocal(html) {
  const $ = cheerio.load(html);
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
    if (title && value) {
      data[title] = value;
    }
  });

  return data;
}

function generateSQLInsert(callData, sourceId) {
  const crypto = require('crypto');

  // Parse deadline
  let deadline = null;
  if (callData.deadlines) {
    const match = callData.deadlines.match(/Deadline\s*(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})/);
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
    contact
  ) VALUES (
    '${sourceId}',
    'https://www.euro-access.eu/en/calls',
    '${(callData.title || '').replace(/'/g, "''")}',
    '${(callData.title || '').replace(/'/g, "''")}', -- Placeholder for Macedonian translation
    '${(callData.short_description || '').replace(/'/g, "''")}',
    '${(callData.short_description || '').replace(/'/g, "''")}', -- Placeholder for Macedonian translation
    ${deadline ? `'${deadline}'` : 'NULL'},
    ${daysLeft !== null ? daysLeft : 'NULL'},
    '${callData.detailUrl || ''}',
    'grants',
    '["eu-funding", "erasmus"]',
    '${contentHash}',
    '',
    NOW(),
    NOW(),
    '${(callData.funding_program || '').replace(/'/g, "''")}',
    '${(callData.call_number || '').replace(/'/g, "''")}',
    '${(callData.call_objectives || '').replace(/'/g, "''")}',
    '${(callData.regions__countries_for_funding || '').replace(/'/g, "''")}',
    '${(callData.eligible_entities || '').replace(/'/g, "''")}',
    '${(callData.mandatory_partnership || '').replace(/'/g, "''")}',
    '${(callData.project_partnership || '').replace(/'/g, "''")}',
    '${(callData.topics || '').replace(/'/g, "''")}',
    '${(callData.un_sustainable_development_goals__un_sdgs_ || '').replace(/'/g, "''")}',
    '${(callData.additional_information || '').replace(/'/g, "''")}',
    '${(callData.contact || '').replace(/'/g, "''")}'
  ) ON CONFLICT (content_hash) DO NOTHING;\n`;

  return sql;
}

// Test with local HTML files
function testWithLocalFiles() {
  try {
    // Read local HTML files
    const listHtml = fs.readFileSync(path.join(__dirname, '..', 'SearchForFunding.html'), 'utf8');
    const detailHtml = fs.readFileSync(path.join(__dirname, '..', 'ErasmusCharterForHigherEducation.html'), 'utf8');

    console.log('Testing list page parsing...');
    const calls = scrapeListPageLocal(listHtml);
    console.log(`Found ${calls.length} calls from list page`);

    if (calls.length > 0) {
      console.log('First call:', calls[0]);

      console.log('Testing detail page parsing...');
      const detailData = scrapeDetailPageLocal(detailHtml);
      console.log('Detail data keys:', Object.keys(detailData));

      // Merge data
      const fullData = { ...calls[0], ...detailData };
      console.log('Full data sample:', {
        title: fullData.title,
        funding_program: fullData.funding_program,
        call_number: fullData.call_number,
        short_description: fullData.short_description?.substring(0, 100) + '...'
      });

      // Generate SQL
      const sql = generateSQLInsert(fullData, 'Euro-Access');
      console.log('Generated SQL (first 500 chars):', sql.substring(0, 500) + '...');

      // Write to file
      fs.writeFileSync('test_euro_access.sql', sql);
      console.log('SQL written to test_euro_access.sql');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test
testWithLocalFiles();