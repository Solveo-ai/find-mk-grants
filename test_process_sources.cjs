const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Import our parser function (we'll need to adapt it for Node.js)
function parseGrants(html, source) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const hostname = new URL(source.url).hostname.replace('www.', '');

  // Use domain-specific parsers
  const parsers = {
    'tenderimpulse.com': (html, source) => {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const grants = [];

      // Look for tender listings - use correct selectors for the actual HTML structure
      const tenderBoxes = document.querySelectorAll('.list-box.background-grey');
      for (const box of tenderBoxes) {
        const titleEl = box.querySelector('h2 a');
        const title = titleEl?.textContent?.trim();
        const url = titleEl?.getAttribute('href');

        // Extract deadline from the box - look for "Deadline :" text
        let deadline;
        const deadlineEls = box.querySelectorAll('p.list-sector');
        for (const el of deadlineEls) {
          const text = el.textContent?.trim();
          if (text && text.includes('Deadline :')) {
            const deadlineText = text.replace('Deadline :', '').trim();
            // Parse date like "11 Aug 2025"
            const dateMatch = deadlineText.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
            if (dateMatch) {
              const [, day, month, year] = dateMatch;
              const monthMap = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
              };
              deadline = `${year}-${monthMap[month]}-${day.padStart(2, '0')}T00:00:00.000Z`;
            }
            break;
          }
        }

        if (title && url && title.length > 10) {
          grants.push({
            title,
            url: url.startsWith('http') ? url : new URL(url, source.url).href,
            description: 'Macedonia tender opportunity',
            deadline,
            type: 'tenders',
            tags: ['macedonia', 'procurement']
          });
        }
      }

      return grants;
    },

    'tendersontime.com': (html, source) => {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const grants = [];

      // Look for tender listings - use correct selectors for the actual HTML structure
      const listingBoxes = document.querySelectorAll('.listingbox.mt10');
      for (const box of listingBoxes) {
        const titleEl = box.querySelector('a[href]');
        const title = titleEl?.textContent?.trim();
        const url = titleEl?.getAttribute('href');

        // Extract deadline from the box - look for deadline in p.list-data strong
        let deadline;
        const deadlineEl = box.querySelector('p.list-data strong');
        const deadlineText = deadlineEl?.textContent?.trim();
        if (deadlineText) {
          // Parse date like "24 Oct 2025"
          const dateMatch = deadlineText.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
          if (dateMatch) {
            const [, day, month, year] = dateMatch;
            const monthMap = {
              'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
              'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };
            deadline = `${year}-${monthMap[month]}-${day.padStart(2, '0')}T00:00:00.000Z`;
          }
        }

        if (title && url && title.length > 10) {
          grants.push({
            title,
            url: url.startsWith('http') ? url : new URL(url, source.url).href,
            description: 'Tender opportunity from Macedonia',
            deadline,
            type: 'tenders',
            tags: ['macedonia', 'tenders']
          });
        }
      }

      return grants;
    },

    'ebrdgeff.com': (html, source) => {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const grants = [];

      // Look for news posts and case studies that contain funding opportunities
      const newsPosts = document.querySelectorAll('.news-post');
      for (const post of newsPosts) {
        const linkEl = post.querySelector('a[href]');
        const titleEl = post.querySelector('h2');
        const title = titleEl?.textContent?.trim();
        const url = linkEl?.getAttribute('href');

        // Extract date
        let deadline;
        const dateEl = post.querySelector('.date');
        const dateText = dateEl?.textContent?.trim();
        if (dateText) {
          // Parse date like "18 Feb 2022"
          const dateMatch = dateText.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
          if (dateMatch) {
            const [, day, month, year] = dateMatch;
            const monthMap = {
              'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
              'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };
            deadline = `${year}-${monthMap[month]}-${day.padStart(2, '0')}T00:00:00.000Z`;
          }
        }

        if (title && url && title.length > 10) {
          grants.push({
            title,
            url: url.startsWith('http') ? url : new URL(url, source.url).href,
            description: 'EBRD Green Economy Financing Facility opportunity',
            deadline,
            type: 'loans',
            tags: ['ebrd', 'green-finance', 'sustainable']
          });
        }
      }

      return grants;
    }
  };

  const parser = parsers[hostname];
  if (parser) {
    return parser(html, source);
  }

  return [];
}

async function testProcessSources() {
  const htmlDumpDirs = ['html_dumps', 'html_dumps2'];
  const results = {};

  for (const dir of htmlDumpDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);
    console.log(`\n=== Processing ${dir} ===`);

    for (const file of files) {
      if (!file.endsWith('.html')) continue;

      const filePath = path.join(dir, file);
      const html = fs.readFileSync(filePath, 'utf8');

      // Extract source URL from filename or content
      let sourceUrl = '';
      if (file.includes('tenderimpulse')) {
        sourceUrl = 'https://tenderimpulse.com';
      } else if (file.includes('tendersontime')) {
        sourceUrl = 'https://tendersontime.com';
      } else if (file.includes('ebrdgeff')) {
        sourceUrl = 'https://ebrdgeff.com';
      } else {
        // Try to extract from HTML content
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          const title = titleMatch[1].toLowerCase();
          if (title.includes('tenderimpulse')) sourceUrl = 'https://tenderimpulse.com';
          else if (title.includes('tendersontime')) sourceUrl = 'https://tendersontime.com';
          else if (title.includes('ebrd') || title.includes('geff')) sourceUrl = 'https://ebrdgeff.com';
        }
      }

      if (!sourceUrl) continue;

      const source = { url: sourceUrl };
      const grants = parseGrants(html, source);

      if (grants.length > 0) {
        results[sourceUrl] = (results[sourceUrl] || 0) + grants.length;
        console.log(`${file}: ${grants.length} grants found`);
      }
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log('Grants found per source:');
  for (const [source, count] of Object.entries(results)) {
    console.log(`${source}: ${count} grants`);
  }

  const totalGrants = Object.values(results).reduce((sum, count) => sum + count, 0);
  console.log(`\nTotal grants found: ${totalGrants}`);

  return results;
}

testProcessSources().catch(console.error);