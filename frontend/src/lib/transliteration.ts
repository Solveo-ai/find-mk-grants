// Macedonian Cyrillic to Latin transliteration mapping
const cyrillicToLatin: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
  'ѓ': 'gj', 'е': 'e', 'ж': 'zh', 'з': 'z', 'ѕ': 'dz',
  'и': 'i', 'ј': 'j', 'к': 'k', 'л': 'l', 'љ': 'lj',
  'м': 'm', 'н': 'n', 'њ': 'nj', 'о': 'o', 'п': 'p',
  'р': 'r', 'с': 's', 'т': 't', 'ќ': 'kj', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'џ': 'dzh',
  'ш': 'sh'
};

// Latin to Macedonian Cyrillic transliteration mapping
const latinToCyrillic: Record<string, string> = {
  'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д',
  'gj': 'ѓ', 'ǵ': 'ѓ', 'e': 'е', 'zh': 'ж', 'ž': 'ж', 'z': 'з', 'dz': 'ѕ',
  'i': 'и', 'j': 'ј', 'k': 'к', 'l': 'л', 'lj': 'љ',
  'm': 'м', 'n': 'н', 'nj': 'њ', 'o': 'о', 'p': 'п',
  'r': 'р', 's': 'с', 't': 'т', 'kj': 'ќ', 'ḱ': 'ќ', 'u': 'у',
  'f': 'ф', 'h': 'х', 'c': 'ц', 'ch': 'ч', 'č': 'ч', 'dzh': 'џ', 'dž': 'џ',
  'sh': 'ш', 'š': 'ш'
};

/**
 * Transliterates Macedonian Cyrillic text to Latin script
 */
export function cyrillicToLatinText(text: string): string {
  if (!text) return text;

  let result = text.toLowerCase();

  // Handle multi-character mappings first (longest first)
  const multiCharMappings = [
    ['dzh', 'џ'], ['dz', 'ѕ'], ['gj', 'ѓ'], ['kj', 'ќ'],
    ['nj', 'њ'], ['lj', 'љ'], ['zh', 'ж'], ['ch', 'ч'], ['sh', 'ш']
  ];

  for (const [latin, cyrillic] of multiCharMappings) {
    result = result.replace(new RegExp(cyrillic, 'g'), latin);
  }

  // Handle single character mappings
  result = result.split('').map(char => cyrillicToLatin[char] || char).join('');

  return result;
}

/**
 * Transliterates Latin text to Macedonian Cyrillic script
 */
export function latinToCyrillicText(text: string): string {
  if (!text) return text;

  let result = text.toLowerCase();

  // Handle multi-character mappings first (longest first)
  const multiCharMappings = [
    ['dzh', 'џ'], ['dž', 'џ'], ['dz', 'ѕ'],
    ['gj', 'ѓ'], ['ǵ', 'ѓ'], ['kj', 'ќ'], ['ḱ', 'ќ'],
    ['nj', 'њ'], ['lj', 'љ'], ['zh', 'ж'], ['ž', 'ж'], ['ch', 'ч'], ['č', 'ч'], ['sh', 'ш'], ['š', 'ш']
  ];

  for (const [latin, cyrillic] of multiCharMappings) {
    result = result.replace(new RegExp(latin, 'g'), cyrillic);
  }

  // Handle single character mappings
  result = result.split('').map(char => latinToCyrillic[char] || char).join('');

  return result;
}

/**
 * Creates search variants for a given text (original + transliterated versions)
 */
export function createSearchVariants(text: string): string[] {
  if (!text) return [''];

  const original = text.toLowerCase();
  const cyrillicVersion = cyrillicToLatinText(text);
  const latinVersion = latinToCyrillicText(text);

  // Return unique variants
  const variants = new Set([original, cyrillicVersion, latinVersion]);
  return Array.from(variants).filter(v => v.length > 0);
}

/**
 * Remove diacritics from a string (e.g., ž -> z)
 */
function removeDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Generate diacritic/ASCII alternate forms (zh <-> ž, ch <-> č, sh <-> š, gj <-> ǵ, kj <-> ḱ, dzh <-> dž)
 */
function addDiacriticAlternates(text: string): string[] {
  const variants = new Set<string>();
  const lower = text.toLowerCase();
  variants.add(lower);

  const toDiacritic: [RegExp, string][] = [
    [/(zh)/g, 'ž'],
    [/(ch)/g, 'č'],
    [/(sh)/g, 'š'],
    [/(gj)/g, 'ǵ'],
    [/(kj)/g, 'ḱ'],
    [/(dzh)/g, 'dž'],
  ];
  const fromDiacritic: [RegExp, string][] = [
    [/ž/g, 'zh'],
    [/č/g, 'ch'],
    [/š/g, 'sh'],
    [/ǵ/g, 'gj'],
    [/ḱ/g, 'kj'],
    [/dž/g, 'dzh'],
  ];

  for (const [re, rep] of toDiacritic) {
    if (re.test(lower)) variants.add(lower.replace(re, rep));
  }
  for (const [re, rep] of fromDiacritic) {
    if (re.test(lower)) variants.add(lower.replace(re, rep));
  }

  // Add a diacritic-stripped form as well
  variants.add(removeDiacritics(lower));

  return Array.from(variants);
}

/**
 * Bilingual synonyms to bridge common English ↔ Macedonian search terms
 */
const BILINGUAL_SYNONYMS: { en: string[]; mk: string[] }[] = [
  { en: ['grant','grants'], mk: ['грант','грантови'] },
  { en: ['fund','funds','funding','finance','financing'], mk: ['фонд','фондови','финансии','финансирање'] },
  { en: ['tender','tenders','procurement'], mk: ['тендер','тендери','јавна набавка','набавки'] },
  { en: ['loan','loans','credit','credits'], mk: ['кредит','кредити','заем','заеми'] },
  { en: ['program','programme','call','calls'], mk: ['програма','повик','повици'] },
];

/**
 * Expand strings with bilingual synonyms (adds both EN and MK variants and their transliterations)
 */
function expandWithSynonyms(inputs: string[]): string[] {
  const out = new Set<string>();
  for (const s of inputs) {
    const l = s.toLowerCase();
    out.add(l);
    for (const pair of BILINGUAL_SYNONYMS) {
      const hasEn = pair.en.some(k => l.includes(k));
      const hasMk = pair.mk.some(k => l.includes(k));
      if (hasEn || hasMk) {
        // Add all synonyms in both languages, and their script-variants
        for (const en of pair.en) {
          out.add(en);
          out.add(latinToCyrillicText(en));
          out.add(cyrillicToLatinText(en));
        }
        for (const mk of pair.mk) {
          out.add(mk);
          out.add(latinToCyrillicText(mk));
          out.add(cyrillicToLatinText(mk));
        }
      }
    }
  }
  return Array.from(out);
}

/**
 * Normalizes text for better search matching by handling common variations
 */
function normalizeForSearch(text: string): string {
  const lower = text.toLowerCase();
  const noDia = removeDiacritics(lower);
  return noDia
    // Normalize common vocabulary differences
    .replace(/finance/g, 'finans')
    .replace(/financ/g, 'finans');
}

/**
 * Checks if a search term matches text in both Cyrillic and Latin scripts
 */
export function matchesTransliterated(searchTerm: string, text: string): boolean {
  if (!searchTerm || !text) return false;

  const baseSearch = searchTerm.toLowerCase();
  const baseText = text.toLowerCase();

  // Fast path: direct match
  if (baseText.includes(baseSearch)) return true;

  const candidatesSearch = new Set<string>();
  const candidatesText = new Set<string>();

  const addAll = (set: Set<string>, arr: string[]) => arr.forEach(v => { if (v) set.add(v); });

  // Base variants (Cyrillic ↔ Latin)
  const searchVariants = [
    baseSearch,
    cyrillicToLatinText(baseSearch),
    latinToCyrillicText(baseSearch),
  ];
  const textVariants = [
    baseText,
    cyrillicToLatinText(baseText),
    latinToCyrillicText(baseText),
  ];

  // Add diacritic and ASCII alternates
  for (const v of searchVariants) addAll(candidatesSearch, addDiacriticAlternates(v));
  for (const v of textVariants) addAll(candidatesText, addDiacriticAlternates(v));

  // Add normalized and diacritic-stripped forms
  const enrich = (set: Set<string>) => {
    const snapshot = Array.from(set);
    for (const v of snapshot) {
      set.add(normalizeForSearch(v));
      set.add(removeDiacritics(v));
    }
  };
  // Initial normalize/diacritics
  enrich(candidatesSearch);
  enrich(candidatesText);

  // Expand with bilingual synonyms
  const addSynonymsToSet = (set: Set<string>) => {
    const expanded = expandWithSynonyms(Array.from(set));
    for (const v of expanded) {
      set.add(v);
      // Also add transliteration and normalized versions of each synonym
      set.add(cyrillicToLatinText(v));
      set.add(latinToCyrillicText(v));
      set.add(removeDiacritics(v));
      set.add(normalizeForSearch(v));
    }
  };
  addSynonymsToSet(candidatesSearch);
  addSynonymsToSet(candidatesText);

  // Cross-compare all variants
  for (const t of candidatesText) {
    for (const s of candidatesSearch) {
      if (!s) continue;
      if (t.includes(s)) return true;
    }
  }
  return false;
}