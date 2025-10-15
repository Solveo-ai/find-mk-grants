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
  'gj': 'ѓ', 'e': 'е', 'zh': 'ж', 'z': 'з', 'dz': 'ѕ',
  'i': 'и', 'j': 'ј', 'k': 'к', 'l': 'л', 'lj': 'љ',
  'm': 'м', 'n': 'н', 'nj': 'њ', 'o': 'о', 'p': 'п',
  'r': 'р', 's': 'с', 't': 'т', 'kj': 'ќ', 'u': 'у',
  'f': 'ф', 'h': 'х', 'c': 'ц', 'ch': 'ч', 'dzh': 'џ',
  'sh': 'ш'
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
    ['dzh', 'џ'], ['dz', 'ѕ'], ['gj', 'ѓ'], ['kj', 'ќ'],
    ['nj', 'њ'], ['lj', 'љ'], ['zh', 'ж'], ['ch', 'ч'], ['sh', 'ш']
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
 * Normalizes text for better search matching by handling common variations
 */
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    // Replace common Latin variations with standard forms
    .replace(/c/g, 's')  // Treat 'c' as 's' for Macedonian context
    .replace(/finance/g, 'finans')  // Normalize common words
    .replace(/financ/g, 'finans');
}

/**
 * Checks if a search term matches text in both Cyrillic and Latin scripts
 */
export function matchesTransliterated(searchTerm: string, text: string): boolean {
  if (!searchTerm || !text) return false;

  const searchLower = searchTerm.toLowerCase();
  const textLower = text.toLowerCase();

  // Direct substring match (case insensitive)
  if (textLower.includes(searchLower)) {
    return true;
  }

  // Check transliterated versions
  const searchTransliterated = cyrillicToLatinText(searchLower);
  const textTransliterated = cyrillicToLatinText(textLower);

  if (textTransliterated.includes(searchTransliterated) || textLower.includes(searchTransliterated)) {
    return true;
  }

  // Also check reverse transliteration
  const searchToCyrillic = latinToCyrillicText(searchLower);
  const textToCyrillic = latinToCyrillicText(textLower);

  if (textToCyrillic.includes(searchToCyrillic) || textLower.includes(searchToCyrillic)) {
    return true;
  }

  // Try normalized versions for better matching
  const searchNormalized = normalizeForSearch(searchTransliterated);
  const textNormalized = normalizeForSearch(textTransliterated);

  if (textNormalized.includes(searchNormalized)) {
    return true;
  }

  return false;
}