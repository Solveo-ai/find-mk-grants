// Test script for keyword extraction function
import { extractKeywords } from './parser.ts';

// Test cases with Macedonian content
const testCases = [
  {
    title: 'Експертски мислења, совети и обука за зајакнување на колективното дејствување',
    description: 'Програма за поддршка на невладини организации во Северна Македонија',
    source: 'https://example.mk'
  },
  {
    title: 'Грантови за зелена енергија и обновливи извори',
    description: 'Финансирање за мали и средни претпријатија во енергетскиот сектор',
    source: 'https://eu-funding.mk'
  },
  {
    title: 'Обука за дигитални вештини за млади претприемачи',
    description: 'Еразмус програмата нуди можности за младите во Македонија',
    source: 'https://erasmus.mk'
  },
  {
    title: 'Тендер за изградба на патишта во Скопје',
    description: 'Јавна набавка за инфраструктурни проекти',
    source: 'https://tenders.mk'
  },
  {
    title: 'Иновации во образованието - дигитална трансформација',
    description: 'Проект за модернизирање на универзитетите во Македонија',
    source: 'https://education.mk'
  }
];

console.log('Testing keyword extraction:');
testCases.forEach((testCase, index) => {
  const keywords = extractKeywords(testCase.title, testCase.description, testCase.source);
  console.log(`\nTest ${index + 1}:`);
  console.log(`Title: ${testCase.title}`);
  console.log(`Keywords: [${keywords.join(', ')}]`);
});