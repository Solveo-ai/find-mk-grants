const fs = require('fs');
const path = require('path');

// Mock DOMParser for Node.js
const { JSDOM } = require('jsdom');
const dom = new JSDOM();
global.DOMParser = dom.window.DOMParser;

function testTenderImpulseParser(html, source) {
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
}

function testTendersOnTimeParser(html, source) {
  console.log('testTendersOnTimeParser called with HTML length:', html.length);
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const grants = [];

  console.log('Document parsed, looking for .listingbox.mt10 elements...');
  // Look for tender listings - use correct selectors for the actual HTML structure
  const listingBoxes = document.querySelectorAll('.listingbox.mt10');
  console.log(`Found ${listingBoxes.length} listing boxes`);

  for (const box of listingBoxes) {
    const titleEl = box.querySelector('a[href]');
    const title = titleEl?.textContent?.trim();
    const url = titleEl?.getAttribute('href');

    console.log(`Box found, title: "${title}", url: "${url}"`);

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
}

function testEbrdGeffParser(html, source) {
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

function testParser(parserName, parserFn, sourceUrl, htmlFilePath) {
  try {
    console.log(`\n=== Testing ${parserName} parser for ${sourceUrl} ===`);

    const html = fs.readFileSync(htmlFilePath, 'utf8');
    const source = { url: sourceUrl };

    const grants = parserFn(html, source);

    console.log(`Found ${grants.length} grants:`);
    grants.forEach((grant, index) => {
      console.log(`${index + 1}. ${grant.title}`);
      console.log(`   URL: ${grant.url}`);
      console.log(`   Type: ${grant.type}`);
      if (grant.deadline) console.log(`   Deadline: ${grant.deadline}`);
      console.log('');
    });

    return grants.length;
  } catch (error) {
    console.error(`Error testing ${parserName} parser for ${sourceUrl}:`, error.message);
    return 0;
  }
}

function main() {
  const testCases = [
    {
      name: 'TenderImpulse',
      parser: testTenderImpulseParser,
      url: 'https://tenderimpulse.com',
      file: 'html_dumps/tenderimpulse.html'
    },
    {
      name: 'TendersOnTime',
      parser: testTendersOnTimeParser,
      url: 'https://tendersontime.com',
      file: 'html_dumps/tendersontime.html'
    },
    {
      name: 'EBRD GEFF',
      parser: testEbrdGeffParser,
      url: 'https://ebrdgeff.com',
      file: 'html_dumps2/ebrdgeff_country36.html'
    }
  ];

  let totalGrants = 0;

  for (const testCase of testCases) {
    if (fs.existsSync(testCase.file)) {
      const count = testParser(testCase.name, testCase.parser, testCase.url, testCase.file);
      totalGrants += count;
    } else {
      console.log(`HTML file not found: ${testCase.file}`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total grants found: ${totalGrants}`);
}

main();