const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const crypto = require('crypto');
require('dotenv').config();

// Debug environment variables
console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '[REDACTED]' : 'undefined');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not defined in environment variables');
}
if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY is not defined in environment variables');
}

// Validate URL format
const urlPattern = /^https?:\/\/.+\.supabase\.co$/;
if (!urlPattern.test(process.env.SUPABASE_URL)) {
  throw new Error(`Invalid SUPABASE_URL format: ${process.env.SUPABASE_URL}. Expected format: https://your-project.supabase.co`);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function aggregateOpportunities() {
  try {
    // Get all grant sources
    const { data: sources, error } = await supabase
      .from('grant_sources')
      .select('*');

    if (error) throw error;
    if (!sources) {
      console.log('No sources found.');
      return;
    }
    console.log('Sources to process:', sources.length);

    for (const source of sources) {
      try {
        console.log(`Fetching from source: ${source.url}`);
        let html = null;
        let grants = [];
        // --- Custom logic for CFCD IPA II/III iframe URLs ---
        if (source.url.includes('cfcd.finance.gov.mk/tenders/publicTender/home')) {
          // IPA II: Scrape the table of tenders from the iframe
          const browser = await puppeteer.launch({ headless: true });
          const page = await browser.newPage();
          await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 60000 });
          // Wait for the table to load
          await page.waitForSelector('table', { timeout: 20000 });
          // Extract rows
          const rows = await page.$$eval('table tbody tr', trs => trs.map(tr => {
            const tds = Array.from(tr.querySelectorAll('td'));
            // Example: [ref, title, deadline, ...]
            const title = tds[1]?.innerText.trim() || '';
            const url = tds[1]?.querySelector('a')?.href || '';
            const deadline = tds[2]?.innerText.trim() || '';
            return { title, url, deadline, raw: tr.innerHTML };
          }));
          // Compose grants
          for (const row of rows) {
            if (!row.title) continue;
            // Try to parse deadline to ISO
            let deadlineISO = null;
            if (row.deadline) {
              // Expecting format: dd.mm.yyyy
              const m = row.deadline.match(/(\d{2})\.(\d{2})\.(\d{4})/);
              if (m) deadlineISO = `${m[3]}-${m[2]}-${m[1]}T23:59:59Z`;
            }
            // Compose hash
            const hash = crypto.createHash('sha256');
            hash.update(row.title + (row.deadline || '') + (row.url || ''));
            const content_hash = hash.digest('hex');
            grants.push({
              title: row.title,
              description: '',
              deadline: deadlineISO,
              source_id: source.id,
              source_url: source.url,
              url: row.url,
              amount: null,
              currency: null,
              type: 'tenders',
              tags: ['ИПА II'],
              content_hash,
              raw_html: row.raw,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
          await browser.close();
        } else if (source.url.includes('cfcd.trinitymedia.mk/client/public/dashboard')) {
          // IPA III: Scrape the dashboard for tenders (structure may differ)
          const browser = await puppeteer.launch({ headless: true });
          const page = await browser.newPage();
          await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 60000 });
          // Wait for a table or card list to load
          await page.waitForSelector('table, .card, .opportunity', { timeout: 20000 });
          // Try to extract from table rows first
          let rows = await page.$$eval('table tbody tr', trs => trs.map(tr => {
            const tds = Array.from(tr.querySelectorAll('td'));
            const title = tds[1]?.innerText.trim() || '';
            const url = tds[1]?.querySelector('a')?.href || '';
            const deadline = tds[2]?.innerText.trim() || '';
            return { title, url, deadline, raw: tr.innerHTML };
          }));
          // If no table, try cards (adjust selector as needed)
          if (!rows.length) {
            rows = await page.$$eval('.card, .opportunity', cards => cards.map(card => {
              const title = card.querySelector('h2, .title')?.innerText.trim() || '';
              const url = card.querySelector('a')?.href || '';
              const deadline = card.querySelector('.deadline, .date')?.innerText.trim() || '';
              const description = card.querySelector('.desc, .description')?.innerText.trim() || '';
              return { title, url, deadline, description, raw: card.innerHTML };
            }));
          }
          for (const row of rows) {
            if (!row.title) continue;
            let deadlineISO = null;
            if (row.deadline) {
              const m = row.deadline.match(/(\d{2})\.(\d{2})\.(\d{4})/);
              if (m) deadlineISO = `${m[3]}-${m[2]}-${m[1]}T23:59:59Z`;
            }
            const hash = crypto.createHash('sha256');
            hash.update(row.title + (row.deadline || '') + (row.url || ''));
            const content_hash = hash.digest('hex');
            grants.push({
              title: row.title,
              description: row.description || '',
              deadline: deadlineISO,
              source_id: source.id,
              source_url: source.url,
              url: row.url,
              amount: null,
              currency: null,
              type: 'tenders',
              tags: ['ИПА III'],
              content_hash,
              raw_html: row.raw,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
          await browser.close();
        } else if (source.url.includes('slvesnik.com.mk/tenderi.nspx')) {
          // ...existing code for slvesnik...
          const browser = await puppeteer.launch({ headless: true });
          const page = await browser.newPage();
          await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 60000 });
          await page.waitForSelector('iframe#iframe-tenderi', { timeout: 20000 });
          const iframeElement = await page.$('iframe#iframe-tenderi');
          const url = require('url');
          const iframeSrc = await page.evaluate(el => el.getAttribute('src'), iframeElement);
          const iframeUrl = url.resolve(source.url, iframeSrc);
          console.log('Resolved iframe URL:', iframeUrl);
          const iframePage = await browser.newPage();
          await iframePage.goto(iframeUrl, { waitUntil: 'networkidle2', timeout: 60000 });
          html = await iframePage.content();
          const fs = require('fs');
          fs.writeFileSync('slvesnik_tenders_iframe.html', html);
          console.log('Saved iframe HTML to slvesnik_tenders_iframe.html');
          await browser.close();
          grants = parseGrants(html, source);
        } else if (source.url.includes('seelegal.org')) {
          // SEE Legal is news/publications, not funding opportunities
          grants = [];
        } else if (source.url.includes('developmentaid.org')) {
          // Use Puppeteer to scrape DevelopmentAid tenders
          const { parseDevelopmentAid } = require('./parsers/developmentaid');
          grants = await parseDevelopmentAid(source);
        } else if (source.url.includes('ceedhub.mk')) {
          // Use static HTML dump for CEED Hub
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'ceed_hub_skopje.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('biznisangeli.mk')) {
          // Use static HTML dump for Business Angels
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'biznis_angeli.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('e-nabavki.gov.mk')) {
          // Use static HTML dump for E-Nabavki
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'e_nabavki.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('tenderi.mk')) {
          // Use static HTML dump for Tenderi.mk
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'tenderi_mk.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('tendersontime.com')) {
          // Use static HTML dump for Tenders on Time
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'tendersontime.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('tenderimpulse.com')) {
          // Use static HTML dump for Tender Impulse
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'tenderimpulse.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('redi-ngo.eu')) {
          // Use static HTML dump for REDI NGO
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'redi_ngo.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('sc-ventures.com')) {
          // Use static HTML dump for SC Ventures
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'sc_ventures.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('seavusaccelerator.com')) {
          // Use static HTML dump for Seavus Accelerator
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'seavus_accelerator.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('yes.org.mk')) {
          // Use static HTML dump for YES Incubator
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'yes_incubator.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('impactventures.mk')) {
          // Use static HTML dump for Impact Ventures
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'impact_ventures.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('economy.gov.mk')) {
          // Use static HTML dump for Ministry of Economy
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'min_economy.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('mon.gov.mk')) {
          // Use static HTML dump for Ministry of Education
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'mon.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('11.vc')) {
          // Use static HTML dump for 11.VC
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'eleven_vc.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('eu-startups.com')) {
          // Use static HTML dump for EU Startups
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'eu_startups.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('ec.europa.eu')) {
          // Use static HTML dump for EU Funding/Tenders
          const fs = require('fs');
          const path = require('path');
          let html;
          if (source.url.includes('horizon')) {
            html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'horizon_europe_nmk.html'), 'utf8');
          } else if (source.url.includes('funding-tenders')) {
            html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'eu_funding_tenders_portal.html'), 'utf8');
          } else {
            html = '';
          }
          grants = parseGrants(html, source);
        } else if (source.url.includes('eeas.europa.eu')) {
          // Use static HTML dump for EU Delegation Grants
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'eu_delegation_grants.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('eib.org')) {
          // Use static HTML dump for EIB Loans
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'eib_loans.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('ebrdgeff.com')) {
          // Use static HTML dump for EBRD GEFF
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'ebrd_geff.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('eitfood.eu')) {
          // Use static HTML dump for EIT Food
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'eit_food_blog.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('na.org.mk')) {
          // Use static HTML dump for Erasmus NA
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'erasmus_na.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('linkedin.com/company/zephyr-angels')) {
          // Use static HTML dump for Zephyr Angels
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'zefyr_angels.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('cfcd.finance.gov.mk')) {
          // Use static HTML dump for CFCD Finance
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps', 'cfcd_finance.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('webalkans.eu')) {
          // Use static HTML dump for Webalkans opportunities
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps2', 'webalkans_opportunities.html'), 'utf8');
          grants = parseGrants(html, source);
        } else if (source.url.includes('giz.de')) {
          // Use static HTML dump for GIZ tenders
          const fs = require('fs');
          const path = require('path');
          const html = fs.readFileSync(path.join(__dirname, '..', 'html_dumps2', 'giz_tenders.html'), 'utf8');
          grants = parseGrants(html, source);
        } else {
          // Use Axios for static/API sources
          const response = await axios.get(source.url);
          html = response.data;
          grants = parseGrants(html, source);
        }
        console.log(`Parsed ${grants.length} grants from ${source.url}`);
        for (const grant of grants) {
          console.log('Inserting grant:', grant.title);
          const { data, error } = await supabase
            .from('grants')
            .upsert(grant, { onConflict: 'content_hash' });
          if (error) {
            console.error('Insert error:', error.message);
          } else {
            console.log('Insert result:', data);
          }
        }
      } catch (err) {
        console.error(`Error fetching from ${source.url}:`, err.message);
      }
    }
    console.log('Aggregation completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Aggregation error:', error);
    process.exit(1);
  }
}

function parseGrants(data, source) {
  // SEE Legal static HTML parser
  if (source.url && source.url.includes('seelegal.org')) {
    const { parseSeeLegal } = require('./parsers/seelegal');
    return parseSeeLegal(data, source);
  }
  // Custom parser for https://www.slvesnik.com.mk/tenderi.nspx#
  if (source.url && source.url.includes('slvesnik.com.mk/tenderi.nspx')) {
    const $ = cheerio.load(data);
    const grants = [];
    $('#institution-notices-grid tbody tr').each((i, el) => {
      const tds = $(el).find('td');
      if (tds.length < 7) return;
      const numberA = $(tds[0]).find('a');
      const number = numberA.text().trim();
      const url = numberA.attr('href');
      const fullUrl = url ? 'https://e-nabavki.gov.mk' + url : '';
      const authority = $(tds[1]).text().trim();
      const subject = $(tds[2]).text().trim();
      const contractType = $(tds[3]).text().trim();
      const procedureType = $(tds[4]).text().trim().replace(/<[^>]*>/g, '');
      const publishDate = $(tds[5]).text().trim();
      const deadlineRaw = $(tds[6]).text().trim();
      const title = `${number}: ${subject}`;
      const description = `Договорен орган: ${authority}, Вид на договорот: ${contractType}, Вид на постапка: ${procedureType}`;
      let deadline = null;
      if (deadlineRaw) {
        const m = deadlineRaw.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
        if (m) {
          deadline = `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00Z`;
        }
      }
      const hash = crypto.createHash('sha256');
      hash.update(title + fullUrl + deadlineRaw);
      const content_hash = hash.digest('hex');
      grants.push({
        title,
        description,
        deadline,
        source_id: source.id,
        source_url: source.url,
        url: fullUrl,
        amount: null,
        currency: null,
        type: 'tenders',
        tags: ['slvesnik', contractType, procedureType],
        content_hash,
        raw_html: $.html(el),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
    return grants;
  }

  // Custom parser for https://www.biddetail.com/macedonia-tenders (static HTML dump)
  if (source.url && source.url.includes('biddetail.com/macedonia-tenders')) {
    const $ = cheerio.load(data);
    const grants = [];
    $('.tender_row').each((i, el) => {
      // Title and URL
      const titleA = $(el).find('h2 a');
      const title = titleA.text().trim() || $(el).find('h2').text().trim();
      let url = titleA.attr('href') || '';
      if (url && !url.startsWith('http')) {
        url = 'https://www.biddetail.com' + url;
      }
      // Description
      const description = $(el).find('.workDesc').text().trim();
      // Deadline
      const deadlineRaw = $(el).find('li.dd').text().trim();
      // Try to parse deadline (e.g. 14 Oct 2025)
      let deadline = null;
      const deadlineMatch = deadlineRaw.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
      if (deadlineMatch) {
        const [_, day, monthStr, year] = deadlineMatch;
        // Convert month name to number
        const months = {
          jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
          jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
        };
        const month = months[monthStr.slice(0,3).toLowerCase()] || '01';
        deadline = `${year}-${month}-${day.padStart(2, '0')}T23:59:59Z`;
      }
      // Amount
      let amount = null;
      let currency = null;
      const priceText = $(el).find('li.price').text().replace(/[^\d.,]/g, '').replace(/,/g, '');
      if (priceText && priceText.toLowerCase() !== 'referdocument') {
        amount = parseFloat(priceText);
        currency = 'USD'; // Assume USD if $ icon, adjust if needed
      }
      // Tags (location, etc.)
      const tags = [];
      const location = $(el).find('li.state').text().trim();
      if (location) tags.push(location);
      // Unique hash
      const hash = crypto.createHash('sha256');
      hash.update(title + description + (deadline || '') + url);
      const content_hash = hash.digest('hex');
      // Compose grant object
      if (title && url) {
        grants.push({
          title,
          description,
          deadline,
          source_id: source.id,
          source_url: source.url,
          url,
          amount,
          currency,
          type: 'tenders',
          tags,
          content_hash,
          raw_html: $.html(el),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });
    return grants;
  }

  // Custom parser for CEED Hub Skopje
  if (source.url && source.url.includes('ceedhub.mk')) {
    const $ = cheerio.load(data);
    const grants = [];
    // Look for the investment readiness program
    const programHeading = $('h2.elementor-heading-title').filter((i, el) => $(el).text().includes('INVESTMENT READINESS PROGRAM'));
    if (programHeading.length > 0) {
      const title = 'Програма за подготвеност за инвестиции на CEED Hub 2025-2026';
      const descriptionEl = programHeading.closest('.elementor-element').next().find('.elementor-text-editor p');
      const description = descriptionEl.text().trim();
      const hash = crypto.createHash('sha256');
      hash.update(title + description + source.url);
      const content_hash = hash.digest('hex');
      grants.push({
        title,
        description,
        deadline: null,
        source_id: source.id,
        source_url: source.url,
        url: source.url,
        amount: null,
        currency: null,
        type: 'grants',
        tags: ['инвестиции', 'стартап', 'програма'],
        content_hash,
        raw_html: $.html(programHeading.closest('.elementor-element')),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    return grants;
  }

  // Custom parser for Webalkans opportunities
  if (source.url && source.url.includes('webalkans.eu')) {
    const $ = cheerio.load(data);
    const grants = [];
    $('.umb-card').each((i, card) => {
      const title_en = $(card).find('.umb-card__title').text().trim();
      const desc_en = $(card).find('.umb-card__desc').text().trim();
      const deadlineText = $(card).find('.umb-card__footer .left').text().trim();
      let deadline = null;
      if (deadlineText) {
        const dateMatch = deadlineText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          deadline = new Date(`${year}-${month}-${day}T23:59:59Z`).toISOString();
        }
      }
      const countries_en = $(card).find('.umb-card__flags img').map((j, img) => $(img).attr('alt')).get().join(', ');
      const type_badge_en = $(card).find('.umb-card__badge').text().trim();
      const link = $(card).find('.umb-card__footer a').attr('href');
      // Translate title to Macedonian
      let title_mk = title_en;
      if (title_en === 'Funding to Attend DigiQ Networking Events') title_mk = 'Финансирање за учество на DigiQ мрежни настани';
      else if (title_en === 'Cross-Border Cooperation Programme Montenegro-Albania for 2021-2027') title_mk = 'Програма за прекугранична соработка Црна Гора-Албанија за 2021-2027';
      else if (title_en === 'AI Challenge 2025') title_mk = 'AI Предизвик 2025';
      else if (title_en === 'Cross-border programme 2021-2027 Albania and Kosovo') title_mk = 'Прекугранична програма 2021-2027 Албанија и Косово';
      else if (title_en === 'Small Grants for Media Content Production in Kosovo') title_mk = 'Мали грантови за производство на медиумски содржини во Косово';
      else if (title_en === 'Strategic Innovation Open Call') title_mk = 'Стратешки иновации - Отворен повик';
      // Translate description to Macedonian
      let desc_mk = desc_en;
      if (desc_en.includes('Apply for financial support to travel and participate in DigiQ networking events')) desc_mk = 'Аплицирајте за финансиска поддршка за патување и учество на DigiQ мрежни настани низ Европа, помагајќи на студенти и неодамна дипломирани во квантната технологија да се поврзат, соработуваат и...';
      else if (desc_en.includes('The EU is investing €422 million')) desc_mk = 'ЕУ инвестира 422 милиони евра преку Фондот за инфраструктура за алтернативни горива за поддршка на 39 проекти фокусирани на проширување на инфраструктурата за алтернативни горива. Овие проекти вклучуваат електрични станици за полнење, водородни станици за полнење и инсталации за електрична енергија на брегот. Со уште 578 милиони евра достапни за идни предлози, следната рунда на финансирање се затвора на 11 јуни 2025. Оваа иницијатива е клучен чекор во напредувањето на чист транспорт и постигнувањето на еколошките цели на ЕУ.';
      else if (desc_en.includes('Apply for funding to develop innovative solutions in AI')) desc_mk = 'Аплицирајте за финансирање за развивање иновативни решенија во вештачка интелигенција и квантни технологии. Предизвикот се фокусира на напредување на истражувањето и апликациите во овие најсовремени области, поддржувајќи стартап компании, истражувачи и мали и средни претпријатија во создавање влијателни проекти.';
      else if (desc_en.includes('This programme supports cross-border cooperation between Albania and Kosovo')) desc_mk = 'Оваа програма поддржува прекугранична соработка меѓу Албанија и Косово за 2021-2027, фокусирајќи се на економски развој, заштита на животната средина и социјална инклузија. Проектите можат да вклучуваат заеднички иницијативи во туризам, култура и инфраструктура.';
      else if (desc_en.includes('Small grants are available for media content production in Kosovo')) desc_mk = 'Мали грантови се достапни за производство на медиумски содржини во Косово, насочени кон поддршка на независни новинари и медиумски излези во создавање висококвалитетни содржини на теми како демократија, човекови права и социјални прашања.';
      else if (desc_en.includes('Open call for strategic innovation projects')) desc_mk = 'Отворен повик за стратешки иновациски проекти на Западен Балкан, поддржувајќи иницијативи кои поттикнуваат технолошки напредок, дигитална трансформација и одржлив развој низ регионот.';
      // Translate countries to Macedonian
      let countries_mk = countries_en;
      countries_mk = countries_mk.replace('Albania', 'Албанија').replace('Montenegro', 'Црна Гора').replace('Kosovo', 'Косово');
      // Translate type_badge to Macedonian
      let type_badge_mk = type_badge_en;
      if (type_badge_en === 'Funding opportunities') type_badge_mk = 'финансиски можности';
      // Assign sector based on content
      const sectors = [];
      const content = (title_en + desc_en).toLowerCase();
      if (content.includes('agriculture') || content.includes('земјоделство') || content.includes('food') || content.includes('farm')) sectors.push('agriculture');
      if (content.includes('education') || content.includes('образование') || content.includes('school') || content.includes('university')) sectors.push('education');
      if (content.includes('health') || content.includes('здравство') || content.includes('medical') || content.includes('hospital')) sectors.push('health');
      if (content.includes('environment') || content.includes('животна средина') || content.includes('climate') || content.includes('biodiversity')) sectors.push('environment');
      if (content.includes('technology') || content.includes('технологија') || content.includes('digital') || content.includes('innovation') || content.includes('ai') || content.includes('iot')) sectors.push('technology');
      if (content.includes('culture') || content.includes('култура') || content.includes('heritage') || content.includes('arts')) sectors.push('culture');
      if (content.includes('tourism') || content.includes('туризам') || content.includes('travel') || content.includes('hospitality')) sectors.push('tourism');
      if (content.includes('sme') || content.includes('мсп') || content.includes('small') || content.includes('medium') || content.includes('enterprise') || content.includes('business')) sectors.push('sme');
      if (content.includes('eu') || content.includes('european') || content.includes('fund') || content.includes('horizon') || content.includes('erasmus')) sectors.push('eu-funds');
      if (sectors.length === 0) sectors.push('eu-funds'); // default

      const description_mk = `Опис: ${desc_mk}. Земји: ${countries_mk}. Тип: ${type_badge_mk}`;
      const hash = crypto.createHash('sha256');
      hash.update(title_en + desc_en + deadlineText + link);
      const content_hash = hash.digest('hex');
      grants.push({
        title: title_mk,
        description: description_mk,
        deadline,
        source_id: source.id,
        source_url: source.url,
        url: link,
        amount: null,
        currency: null,
        type: 'grants',
        tags: sectors,
        content_hash,
        raw_html: $.html(card),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
    return grants;
  }

  // Custom parser for GIZ tenders
  if (source.url && source.url.includes('giz.de')) {
    const $ = cheerio.load(data);
    const grants = [];
    $('table.csx-new-table tbody tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 5) {
        const published = $(cells[0]).find('abbr').attr('title'); // e.g. '02.10.2025 um 12:05 Uhr'
        const deadlineText = $(cells[1]).find('abbr').attr('title') || $(cells[1]).text().trim();
        let deadline = null;
        if (deadlineText && deadlineText !== 'nv' && deadlineText !== 'Die Frist ist bei diesem Verfahren nicht vorhanden (z.B. EU Vorinformation)') {
          // parse date - try multiple formats
          let dateMatch = deadlineText.match(/(\d{2})\.(\d{2})\.(\d{4})/); // DD.MM.YYYY
          if (!dateMatch) {
            dateMatch = deadlineText.match(/(\d{4})-(\d{2})-(\d{2})/); // YYYY-MM-DD
          }
          if (!dateMatch) {
            dateMatch = deadlineText.match(/(\d{2})\/(\d{2})\/(\d{4})/); // MM/DD/YYYY
          }
          if (dateMatch) {
            let year, month, day;
            if (dateMatch[0].includes('.')) {
              // DD.MM.YYYY or MM/DD/YYYY format
              if (dateMatch[0].includes('/') || dateMatch[1].length === 2 && parseInt(dateMatch[1]) > 12) {
                // Likely MM/DD/YYYY
                [, month, day, year] = dateMatch;
              } else {
                // Likely DD.MM.YYYY
                [, day, month, year] = dateMatch;
              }
            } else {
              // YYYY-MM-DD format
              [, year, month, day] = dateMatch;
            }
            try {
              deadline = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00Z`).toISOString();
            } catch (e) {
              console.log(`Failed to parse date: ${deadlineText}`);
            }
          }
        }
        const title = $(cells[2]).text().trim();
        const type = $(cells[3]).text().trim().replace(/\s+/g, ' ');
        const issuer = $(cells[4]).text().trim();
        // Fix encoding issues - replace broken characters with proper German characters
        const cleanTitle = title.replace(/\uFFFD/g, 'ü').replace(/\uFFFD/g, 'ä').replace(/\uFFFD/g, 'ö').replace(/\uFFFD/g, 'ß');
        const cleanType = type.replace(/\uFFFD/g, 'ü').replace(/\uFFFD/g, 'ä').replace(/\uFFFD/g, 'ö').replace(/\uFFFD/g, 'ß');
        // Assign sector based on content
        const sectors = [];
        const description_mk_full = `Тендер од GIZ: ${cleanTitle}. Тип: ${cleanType}`;
        const content = (title + description_mk_full).toLowerCase();
        if (content.includes('agriculture') || content.includes('земјоделство') || content.includes('food') || content.includes('farm')) sectors.push('agriculture');
        if (content.includes('education') || content.includes('образование') || content.includes('school') || content.includes('university') || content.includes('training') || content.includes('tvet')) sectors.push('education');
        if (content.includes('health') || content.includes('здравство') || content.includes('medical') || content.includes('hospital')) sectors.push('health');
        if (content.includes('environment') || content.includes('животна средина') || content.includes('climate') || content.includes('biodiversity') || content.includes('water') || content.includes('energy')) sectors.push('environment');
        if (content.includes('technology') || content.includes('технологија') || content.includes('digital') || content.includes('innovation') || content.includes('ict') || content.includes('software')) sectors.push('technology');
        if (content.includes('culture') || content.includes('култура') || content.includes('heritage') || content.includes('arts')) sectors.push('culture');
        if (content.includes('tourism') || content.includes('туризам') || content.includes('travel') || content.includes('hospitality')) sectors.push('tourism');
        if (content.includes('sme') || content.includes('мсп') || content.includes('small') || content.includes('medium') || content.includes('enterprise') || content.includes('business') || content.includes('company')) sectors.push('sme');
        if (content.includes('eu') || content.includes('european') || content.includes('fund') || content.includes('development')) sectors.push('eu-funds');
        if (sectors.length === 0) sectors.push('sme'); // default for tenders
        const tags = ['тендер', 'GIZ', type, ...sectors];
        const hash = crypto.createHash('sha256');
        hash.update(cleanTitle + deadlineText + published);
        const content_hash = hash.digest('hex');
        grants.push({
          title: cleanTitle,
          description: description_mk_full,
          deadline,
          source_id: source.id,
          source_url: source.url,
          url: source.url, // link to the main page
          amount: null,
          currency: null,
          type: 'tenders',
          tags,
          content_hash,
          raw_html: $.html(row),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });
    return grants;
  }

  // Custom parser for EIB loans
  if (source.url && source.url.includes('eib.org')) {
    const grants = [];
    const title = 'Кредити од Европската инвестициска банка';
    const description = 'ЕИБ нуди кредити за проекти во Европа, вклучувајќи инфраструктура, енергетика и иновации.';
    const hash = crypto.createHash('sha256');
    hash.update(title + description + source.url);
    const content_hash = hash.digest('hex');
    grants.push({
      title,
      description,
      deadline: null,
      source_id: source.id,
      source_url: source.url,
      url: source.url,
      amount: null,
      currency: null,
      type: 'loans',
      tags: ['eu-funds', 'sme', 'environment', 'technology'],
      content_hash,
      raw_html: data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return grants;
  }

  // Custom parser for Tender Impulse
  if (source.url && source.url.includes('tenderimpulse.com')) {
    const $ = cheerio.load(data);
    const grants = [];

    // Look for tender listings - use correct selectors for the actual HTML structure
    $('.list-box.background-grey').each((i, box) => {
      const titleEl = $(box).find('h2 a');
      const title = titleEl.text().trim();
      const url = titleEl.attr('href');

      // Extract deadline from the box - look for "Deadline :" text
      let deadline = null;
      const deadlineEls = $(box).find('p.list-sector');
      for (let j = 0; j < deadlineEls.length; j++) {
        const text = $(deadlineEls[j]).text().trim();
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
        const hash = crypto.createHash('sha256');
        hash.update(title + url + (deadline || ''));
        const content_hash = hash.digest('hex');
        grants.push({
          title,
          description: 'Macedonia tender opportunity',
          deadline,
          source_id: source.id,
          source_url: source.url,
          url: url.startsWith('http') ? url : new URL(url, source.url).href,
          amount: null,
          currency: null,
          type: 'tenders',
          tags: ['macedonia', 'procurement'],
          content_hash,
          raw_html: $.html(box),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });

    return grants;
  }

  // Custom parser for Tenders On Time
  if (source.url && source.url.includes('tendersontime.com')) {
    const $ = cheerio.load(data);
    const grants = [];

    // Look for tender listings - use correct selectors for the actual HTML structure
    $('.listingbox.mt10').each((i, box) => {
      const titleEl = $(box).find('a[href]');
      const title = titleEl.text().trim();
      const url = titleEl.attr('href');

      // Extract deadline from the box - look for deadline in p.list-data strong
      let deadline = null;
      const deadlineEl = $(box).find('p.list-data strong');
      const deadlineText = deadlineEl.text().trim();
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
        const hash = crypto.createHash('sha256');
        hash.update(title + url + (deadlineText || ''));
        const content_hash = hash.digest('hex');
        grants.push({
          title,
          description: 'Tender opportunity from Macedonia',
          deadline,
          source_id: source.id,
          source_url: source.url,
          url: url.startsWith('http') ? url : new URL(url, source.url).href,
          amount: null,
          currency: null,
          type: 'tenders',
          tags: ['macedonia', 'tenders'],
          content_hash,
          raw_html: $.html(box),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });

    return grants;
  }

  // Custom parser for EBRD GEFF
  if (source.url && source.url.includes('ebrdgeff.com')) {
    const $ = cheerio.load(data);
    const grants = [];

    // Look for news posts and case studies that contain funding opportunities
    $('.news-post').each((i, post) => {
      const linkEl = $(post).find('a[href]');
      const titleEl = $(post).find('h2');
      const title = titleEl.text().trim();
      const url = linkEl.attr('href');

      // Extract date
      let deadline = null;
      const dateEl = $(post).find('.date');
      const dateText = dateEl.text().trim();
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
        const hash = crypto.createHash('sha256');
        hash.update(title + url + (dateText || ''));
        const content_hash = hash.digest('hex');
        grants.push({
          title,
          description: 'EBRD Green Economy Financing Facility opportunity',
          deadline,
          source_id: source.id,
          source_url: source.url,
          url: url.startsWith('http') ? url : new URL(url, source.url).href,
          amount: null,
          currency: null,
          type: 'loans',
          tags: ['ebrd', 'green-finance', 'sustainable'],
          content_hash,
          raw_html: $.html(post),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });

    return grants;
  }

  // Custom parser for 11.VC
  if (source.url && source.url.includes('11.vc')) {
    const grants = [];
    const title = 'Инвестиции од 11.VC';
    const description = '11.VC е инвестициски фонд кој поддржува стартап компании во регионот.';
    const hash = crypto.createHash('sha256');
    hash.update(title + description + source.url);
    const content_hash = hash.digest('hex');
    grants.push({
      title,
      description,
      deadline: null,
      source_id: source.id,
      source_url: source.url,
      url: source.url,
      amount: null,
      currency: null,
      type: 'private-funding',
      tags: ['technology', 'sme'],
      content_hash,
      raw_html: data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return grants;
  }

  // Custom parser for SC Ventures
  if (source.url && source.url.includes('sc-ventures.com')) {
    const grants = [];
    const title = 'Инвестиции од SC Ventures';
    const description = 'SC Ventures инвестира во технолошки стартапи.';
    const hash = crypto.createHash('sha256');
    hash.update(title + description + source.url);
    const content_hash = hash.digest('hex');
    grants.push({
      title,
      description,
      deadline: null,
      source_id: source.id,
      source_url: source.url,
      url: source.url,
      amount: null,
      currency: null,
      type: 'private-funding',
      tags: ['technology', 'sme'],
      content_hash,
      raw_html: data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return grants;
  }

  // Custom parser for ProCredit
  if (source.url && source.url.includes('procredit.com.mk')) {
    const grants = [];
    const title = 'Кредити од ProCredit Bank';
    const description = 'ProCredit Bank нуди кредити за мали и средни претпријатија.';
    const hash = crypto.createHash('sha256');
    hash.update(title + description + source.url);
    const content_hash = hash.digest('hex');
    grants.push({
      title,
      description,
      deadline: null,
      source_id: source.id,
      source_url: source.url,
      url: source.url,
      amount: null,
      currency: null,
      type: 'loans',
      tags: ['sme'],
      content_hash,
      raw_html: data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return grants;
  }

  // Generic parser for other HTML dumps - only return empty array since most are homepages
  return [];
  // Default: expects JSON array
  if (Array.isArray(data)) {
    return data.map(item => ({
      title: item.title,
      description: item.description,
      deadline: item.deadline,
      source_id: source.id,
      source_url: source.url,
      url: item.url,
      amount: item.amount,
      currency: item.currency,
      type: item.type,
      tags: item.tags || [],
      content_hash: item.content_hash || '',
      raw_html: item.raw_html || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }
  return [];
}

aggregateOpportunities().catch((err) => {
  console.error('Top-level error:', err);
});