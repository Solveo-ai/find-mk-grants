const axios = require('axios');

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

async function translateText(text, options = {}) {
  if (!text || text.trim() === '') {
    return text;
  }

  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text,
        target: options.to || 'mk',
        source: options.from,
        format: 'text',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error.message);
    // Return original text if translation fails
    return text;
  }
}

async function translateToMacedonian(text, from) {
  return translateText(text, { from, to: 'mk' });
}

async function translateFromMacedonian(text, to) {
  return translateText(text, { from: 'mk', to });
}

// Batch translation for multiple texts
async function translateBatch(texts, options = {}) {
  const promises = texts.map(text => translateText(text, options));
  return Promise.all(promises);
}

module.exports = {
  translateText,
  translateToMacedonian,
  translateFromMacedonian,
  translateBatch,
};