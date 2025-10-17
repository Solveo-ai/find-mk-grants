// Parser for DevelopmentAid tenders using Puppeteer
// Loads https://www.developmentaid.org/tenders/search?locations=272 and extracts tender data
const puppeteer = require('puppeteer');

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

async function parseDevelopmentAid(source) {
  const url = 'https://www.developmentaid.org/tenders/search?locations=272';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait for the tender list container to appear
  await page.waitForSelector('.tender-list__item, .tender-list__row, .tender-list__table', { timeout: 30000 });

  // Try to extract tender rows (adjust selectors as needed)
  const tenders = await page.$$eval('.tender-list__item, .tender-list__row', rows => rows.map(row => {
    // Title
    const titleEl = row.querySelector('.tender-list__title, .tender-title, h3, a');
    const title = titleEl ? titleEl.innerText.trim() : '';
    // URL
    let url = '';
    if (titleEl && titleEl.tagName === 'A') url = titleEl.href;
    else {
      const a = row.querySelector('a[href*="/tenders/view/"]');
      if (a) url = a.href;
    }
    // Description/snippet
    const descEl = row.querySelector('.tender-list__description, .tender-description, .tender-list__snippet');
    const description = descEl ? descEl.innerText.trim() : '';
    // Deadline
    let deadline = '';
    const deadlineEl = row.querySelector('.tender-list__deadline, .tender-deadline, .tender-list__date, .tender-list__closing-date');
    if (deadlineEl) deadline = deadlineEl.innerText.trim();
    // Amount/currency
    let amount = null, currency = null;
    const amountEl = row.querySelector('.tender-list__amount, .tender-amount, .tender-list__budget');
    if (amountEl) {
      const amtText = amountEl.innerText.match(/([\d,.]+)\s*([A-Z]{3})?/);
      if (amtText) {
        amount = parseFloat(amtText[1].replace(/,/g, ''));
        currency = amtText[2] || null;
      }
    }
    // Tags (sector/category)
    const tags = Array.from(row.querySelectorAll('.tender-list__category, .tender-category, .tender-list__sector')).map(e => e.innerText.trim()).filter(Boolean);
    return { title, description, url, deadline, amount, currency, tags };
  }));

  await browser.close();
  // Compose grant objects
  const crypto = require('crypto');
  const grants = tenders.filter(t => t.title && t.url).map(t => {
    // Try to parse deadline to ISO if possible (e.g. 14 Oct 2025)
    let deadlineISO = null;
    if (t.deadline) {
      const m = t.deadline.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
      if (m) {
        const months = {
          jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
          jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
        };
        const month = months[m[2].slice(0,3).toLowerCase()] || '01';
        deadlineISO = `${m[3]}-${month}-${m[1].padStart(2, '0')}T23:59:59Z`;
      }
    }
    // Extract meaningful keywords
    const extractedTags = extractKeywords(t.title, t.description, source.url);
    // Combine existing tags with extracted ones, remove duplicates
    const allTags = [...new Set([...(t.tags || []), ...extractedTags])];

    const hash = crypto.createHash('sha256');
    hash.update(t.title + (t.deadline || '') + (t.url || ''));
    const content_hash = hash.digest('hex');
    return {
      title: t.title,
      description: t.description,
      deadline: deadlineISO,
      source_id: source.id,
      source_url: source.url,
      url: t.url,
      amount: t.amount,
      currency: t.currency,
      type: 'tenders',
      tags: allTags,
      content_hash,
      raw_html: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  return grants;
}

module.exports = { parseDevelopmentAid };