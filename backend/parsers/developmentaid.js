// Parser for DevelopmentAid tenders using Puppeteer
// Loads https://www.developmentaid.org/tenders/search?locations=272 and extracts tender data
const puppeteer = require('puppeteer');

// Enhanced keyword extraction function for Macedonian content
function extractKeywords(title, description = '', source = '') {
  const text = `${title} ${description} ${source}`.toLowerCase();
  const keywords = [];

  // Macedonian keyword mappings for different categories
  const keywordMappings = {
    // Sector keywords
    'екологија': ['екологија', 'заштита на животната средина', 'климатски промени', 'зелена енергија', 'обновливи извори', 'одржлив развој', 'екосистем', 'загадување', 'рециклирање', 'биодиверзитет'],
    'образование': ['образование', 'училиште', 'универзитет', 'студент', 'настава', 'курс', 'обука', 'дигитално образование', 'високо образование', 'професионално образование'],
    'земјоделство': ['земјоделство', 'селска економија', 'храна', 'земјоделски производи', 'селски развој', 'агрикултура', 'фермер', 'прехрана', 'селски туризам'],
    'здравство': ['здравство', 'здравствена заштита', 'медицина', 'болница', 'здравствена нега', 'превенција', 'здравствена едукација', 'психично здравје'],
    'технологија': ['технологија', 'дигитализација', 'информациски технологии', 'интернет', 'софтвер', 'апликација', 'веб', 'дигитална трансформација', 'кибер безбедност'],
    'туризам': ['туризам', 'туристички', 'патување', 'хотели', 'културно наследство', 'природни атракции', 'туристички оператори'],
    'инфраструктура': ['инфраструктура', 'патишта', 'железница', 'комуникации', 'водоснабдување', 'енергетска инфраструктура', 'градско планирање'],
    'енергија': ['енергија', 'електрична енергија', 'газ', 'нафта', 'обновливи извори', 'енергетска ефикасност', 'зелена енергија'],
    'истражување': ['истражување', 'наука', 'иновации', 'развој', 'технолошки развој', 'научни истражувања', 'лабораторија'],
    'млади': ['млади', 'младински', 'студент', 'млад претприемач', 'младинска работа', 'младински организации'],
    'култура': ['култура', 'културно наследство', 'уметност', 'музеј', 'театар', 'музика', 'филм', 'културни институции'],
    'претприемништво': ['претприемништво', 'претприемач', 'стартап', 'бизнис', 'компанија', 'иновации', 'пазар', 'економски развој'],
    'социјална заштита': ['социјална заштита', 'социјални услуги', 'ранливи групи', 'инклузивност', 'социјална интеграција', 'заштита на деца'],
    'спорт': ['спорт', 'спортски', 'рекреација', 'физичка активност', 'спортски клубови', 'олимписки'],
    'транспорт': ['транспорт', 'саобраќај', 'патен сообраќај', 'јавен превоз', 'железнички транспорт', 'воздушен транспорт'],

    // Funding type keywords
    'грант': ['грант', 'финансирање', 'финансиска поддршка', 'европски фондови', 'ипа', 'хоризонт европа', 'еразмус'],
    'тендер': ['тендер', 'јавна набавка', 'конкурс', 'повикување за понуди', 'процедура за јавна набавка'],
    'кредит': ['кредит', 'заем', 'финансирање', 'банкарски производи', 'микрокредит', 'инвестициски кредит'],
    'приватно финансирање': ['приватно финансирање', 'инвестиции', 'венчур капитал', 'бизнис ангели', 'инвеститори'],

    // Target audience keywords
    'мсп': ['мали и средни претпријатија', 'мсп', 'претпријатија', 'бизнис', 'компании', 'фирми'],
    'нво': ['нво', 'невладини организации', 'граѓански организации', 'цивилно општество', 'асоцијации'],
    'универзитет': ['универзитет', 'факултет', 'високо образование', 'академска институција', 'научна институција'],
    'стартап': ['стартап', 'нова компанија', 'нова бизнис идеја', 'инновациски компании', 'технолошки стартап'],
    'јавен сектор': ['јавен сектор', 'државни институции', 'локална самоуправа', 'министерства', 'општини'],

    // Geographic keywords
    'европа': ['европа', 'европска унија', 'еу', 'европски', 'западен балкан', 'балкан'],
    'македонија': ['македонија', 'северна македонија', 'мк', 'македонски', 'локални'],
    'балкан': ['балкан', 'западен балкан', 'регионален', 'балкански држави'],
    'африка': ['африка', 'африкански', 'развиените земји'],
    'азия': ['азija', 'азиски', 'далечен исток']
  };

  // Check each category and add matching keywords
  for (const [category, terms] of Object.entries(keywordMappings)) {
    for (const term of terms) {
      if (text.includes(term.toLowerCase())) {
        // Add the category name as keyword (in Macedonian)
        if (!keywords.includes(category)) {
          keywords.push(category);
        }
        break; // Only add category once per match
      }
    }
  }

  // Additional logic: extract specific terms from title
  const titleWords = title.toLowerCase().split(/\s+/);
  const importantWords = ['иновации', 'развој', 'технологија', 'образование', 'здравство', 'екологија', 'енергија', 'туризам', 'култура', 'спорт'];

  for (const word of titleWords) {
    if (importantWords.includes(word) && !keywords.includes(word)) {
      keywords.push(word);
    }
  }

  // Limit to 3-5 keywords and prioritize the most relevant ones
  const priorityOrder = ['грант', 'тендер', 'кредит', 'приватно финансирање', 'екологија', 'образование', 'технологија', 'здравство', 'земјоделство', 'енергија', 'млади', 'претприемништво', 'мсп', 'нво'];

  const prioritizedKeywords = keywords.filter(k => priorityOrder.includes(k))
    .sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b));

  const remainingKeywords = keywords.filter(k => !priorityOrder.includes(k));

  return [...prioritizedKeywords, ...remainingKeywords].slice(0, 5);
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