// Parser for SEE Legal (dbnm_seelegal.html)
// Extracts news and publications from the static HTML dump
const cheerio = require('cheerio');
const fs = require('fs');

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
