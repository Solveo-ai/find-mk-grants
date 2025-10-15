const GOOGLE_TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

export interface TranslationOptions {
  from?: string;
  to: string;
}

export async function translateText(text: string, options: TranslationOptions): Promise<string> {
  if (!text || text.trim() === '') {
    return text;
  }

  // Clean up the text by removing "short description" prefix and other unwanted prefixes
  let cleanedText = text.trim();

  // Remove various unwanted prefixes (case insensitive)
  const prefixesToRemove = [
    /^short description\s*/i,
    /^call objectives\s*/i,
    /^eligibility criteria\s*/i,
    /^additional information\s*/i,
    /^contact\s*/i,
    /^topics\s*/i,
    /^un sustainable development goals\s*/i,
    /^relevance for eu macro-region\s*/i,
    /^call documents\s*/i,
    /^mandatory partnership\s*/i,
    /^project partnership\s*/i,
    /^other eligibility criteria\s*/i,
  ];

  // Apply all prefix removals
  prefixesToRemove.forEach(regex => {
    cleanedText = cleanedText.replace(regex, '');
  });

  // Also remove any remaining instances of these phrases that might appear elsewhere in the text
  const phrasesToRemove = [
    /short description/gi,
    /call objectives/gi,
    /eligibility criteria/gi,
    /additional information/gi,
    /contact/gi,
    /topics/gi,
    /un sustainable development goals/gi,
    /relevance for eu macro-region/gi,
    /call documents/gi,
    /mandatory partnership/gi,
    /project partnership/gi,
    /other eligibility criteria/gi,
  ];

  phrasesToRemove.forEach(regex => {
    cleanedText = cleanedText.replace(regex, '');
  });

  // If the text is now empty after cleaning, return original
  if (!cleanedText.trim()) {
    return text;
  }

  // Check if API key is available
  if (!GOOGLE_TRANSLATE_API_KEY) {
    console.warn('Google Translate API key not found, returning cleaned text');
    return cleanedText;
  }

  try {
    console.log('Attempting to translate cleaned text:', cleanedText.substring(0, 100) + '...');

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: cleanedText,
          target: options.to,
          source: options.from,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Translation API error:', response.status, errorData);
      throw new Error(`Translation API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const translatedText = data.data.translations[0].translatedText;

    // Log successful translation for debugging
    console.log('✅ Translation successful:', cleanedText.substring(0, 50) + '...', '->', translatedText.substring(0, 50) + '...');

    return translatedText;
  } catch (error) {
    console.error('❌ Translation failed for cleaned text:', cleanedText.substring(0, 100), 'Error:', error);
    // Return cleaned text if translation fails
    return cleanedText;
  }
}

export async function translateToMacedonian(text: string, from?: string): Promise<string> {
  // If no source language specified, try to detect it
  if (!from) {
    // Try German first (common for GIZ grants), then English
    try {
      const germanResult = await translateText(text, { from: 'de', to: 'mk' });
      // If German translation succeeded and looks reasonable, return it
      if (germanResult && germanResult !== text) {
        return germanResult;
      }
    } catch (error) {
      // German translation failed, try English
    }
    // Fallback to English
    return translateText(text, { from: 'en', to: 'mk' });
  }

  return translateText(text, { from, to: 'mk' });
}

export async function translateFromMacedonian(text: string, to: string): Promise<string> {
  return translateText(text, { from: 'mk', to });
}

// Batch translation for multiple texts
export async function translateBatch(texts: string[], options: TranslationOptions): Promise<string[]> {
  const promises = texts.map(text => translateText(text, options));
  return Promise.all(promises);
}