// Parser for SEE Legal (dbnm_seelegal.html)
// Extracts news and publications from the static HTML dump
const cheerio = require('cheerio');
const fs = require('fs');

// Enhanced keyword extraction function for Macedonian content
function extractKeywords(title, description = '', source = '') {
  const fullText = `${title} ${description}`.toLowerCase();
  const keywords = [];

  // Macedonian stop words to filter out
  const stopWords = [
    'и', 'во', 'на', 'за', 'со', 'од', 'до', 'по', 'при', 'преку', 'како', 'да', 'не', 'се', 'го', 'ја', 'ги', 'е', 'има', 'имаат', 'беше', 'биде', 'бидат'
  ];

  // Extract meaningful words from title and description
  const words = fullText.split(/\s+/).filter(word => {
    // Remove punctuation and numbers
    const cleanWord = word.replace(/[^\p{L}]/gu, '');
    // Keep words that are 3+ characters, not stop words, and meaningful
    return cleanWord.length >= 3 && !stopWords.includes(cleanWord.toLowerCase());
  });

  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    const cleanWord = word.replace(/[^\p{L}]/gu, '').toLowerCase();
    if (cleanWord) {
      wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
    }
  });

  // Get most frequent meaningful words
  const sortedWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .map(([word]) => word);

  // Add the most relevant words from the content
  const contentKeywords = sortedWords.slice(0, 3);

  // Add some contextual keywords based on common grant terms
  const contextualKeywords = [];

  // Check for funding types
  if (fullText.includes('грант') || fullText.includes('финансирање')) {
    contextualKeywords.push('грант');
  }
  if (fullText.includes('тендер') || fullText.includes('набавка') || fullText.includes('конкурс')) {
    contextualKeywords.push('тендер');
  }
  if (fullText.includes('кредит') || fullText.includes('заем')) {
    contextualKeywords.push('кредит');
  }

  // Check for target audiences
  if (fullText.includes('млади') || fullText.includes('студент')) {
    contextualKeywords.push('млади');
  }
  if (fullText.includes('претпријатија') || fullText.includes('компани')) {
    contextualKeywords.push('претприемништво');
  }
  if (fullText.includes('нво') || fullText.includes('организации')) {
    contextualKeywords.push('нво');
  }

  // Combine content keywords with contextual ones
  const allKeywords = [...contentKeywords, ...contextualKeywords];

  // Remove duplicates and limit to 5 keywords
  return [...new Set(allKeywords)].slice(0, 5);
}

function parseSeeLegal(html, source) {
  const $ = cheerio.load(html);
  const grants = [];

  // --- News Section ---
  // Find news cards in the homepage (Latest News and Releases)
  $('.fwpl-layout.el-news-home .fwpl-result').each((i, el) => {
    const title = $(el).find('.fwpl-item.el-uew8g a').text().trim();
    const url = $(el).find('.fwpl-item.el-uew8g a').attr('href') || '';
    const dateRaw = $(el).find('.fwpl-item.el-hrfz8f').text().trim();
    const description = '';
    // Try to parse date (e.g. September 24, 2025)
    let deadline = null;
    const dateMatch = dateRaw.match(/(\w+) (\d{1,2}), (\d{4})/);
    if (dateMatch) {
      const [_, month, day, year] = dateMatch;
      const months = {
        january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
        july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
      };
      const monthNum = months[month.toLowerCase()] || '01';
      deadline = `${year}-${monthNum}-${day.padStart(2, '0')}T23:59:59Z`;
    }
    if (title && url) {
      // Extract meaningful keywords
      const extractedTags = extractKeywords(title, description, source.url);

      grants.push({
        title,
        description,
        deadline,
        source_id: source.id,
        source_url: source.url,
        url,
        amount: null,
        currency: null,
        type: 'news',
        tags: extractedTags,
        content_hash: require('crypto').createHash('sha256').update(title + url + (deadline || '')).digest('hex'),
        raw_html: $.html(el),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  });

  // --- Publications Section ---
  // Find publications in the homepage (Latest SEE Legal Publications)
  $('.joint-publicaitons-section .slide-entry').each((i, el) => {
    const title = $(el).find('h3.slide-entry-title a').text().trim();
    const url = $(el).find('h3.slide-entry-title a').attr('href') || '';
    const dateRaw = $(el).find('time.slide-meta-time').text().trim();
    const description = '';
    // Try to parse date (e.g. May 27, 2025)
    let deadline = null;
    const dateMatch = dateRaw.match(/(\w+) (\d{1,2}), (\d{4})/);
    if (dateMatch) {
      const [_, month, day, year] = dateMatch;
      const months = {
        january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
        july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
      };
      const monthNum = months[month.toLowerCase()] || '01';
      deadline = `${year}-${monthNum}-${day.padStart(2, '0')}T23:59:59Z`;
    }
    if (title && url) {
      // Extract meaningful keywords
      const extractedTags = extractKeywords(title, description, source.url);

      grants.push({
        title,
        description,
        deadline,
        source_id: source.id,
        source_url: source.url,
        url,
        amount: null,
        currency: null,
        type: 'publication',
        tags: extractedTags,
        content_hash: require('crypto').createHash('sha256').update(title + url + (deadline || '')).digest('hex'),
        raw_html: $.html(el),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  });

  return grants;
}

module.exports = { parseSeeLegal };
