// Parser for SEE Legal (dbnm_seelegal.html)
// Extracts news and publications from the static HTML dump
const cheerio = require('cheerio');
const fs = require('fs');

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
        tags: [],
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
        tags: [],
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
