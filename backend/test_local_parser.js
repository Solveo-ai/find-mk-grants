const fs = require('fs');
const path = require('path');

// Simple HTML parser test using local HTML files
function testBidDetailParser() {
  const htmlPath = path.join(__dirname, '..', 'html_dumps', 'biddetail.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.log('❌ biddetail.html not found');
    return;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  console.log(`✅ Loaded biddetail.html (${html.length} chars)`);

  // Simple regex-based parser for testing
  const tenderRowRegex = /<div class="tender_row"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  const titleRegex = /<h2>\s*<a[^>]*title="([^"]*)"[^>]*>(.*?)<\/a>/;
  const priceRegex = /<li class="price"[^>]*>\s*<i[^>]*><\/i>\s*([^<\n]+)/;
  const deadlineRegex = /<li class="dd"[^>]*><i[^>]*><\/i>([^<]+)/;

  const matches = html.match(tenderRowRegex);
  
  if (matches) {
    console.log(`🔍 Found ${matches.length} tender rows`);
    
    // Parse first few tenders
    for (let i = 0; i < Math.min(3, matches.length); i++) {
      const tender = matches[i];
      const titleMatch = tender.match(titleRegex);
      const priceMatch = tender.match(priceRegex);
      const deadlineMatch = tender.match(deadlineRegex);
      
      if (titleMatch) {
        console.log(`\n📋 Tender ${i + 1}:`);
        console.log(`   Title: ${titleMatch[2].trim()}`);
        console.log(`   Price: ${priceMatch ? priceMatch[1].trim() : 'N/A'}`);
        console.log(`   Deadline: ${deadlineMatch ? deadlineMatch[1].trim() : 'N/A'}`);
      }
    }
  } else {
    console.log('❌ No tender rows found in biddetail.html');
  }
}

function testWebalkansParser() {
  const htmlPath = path.join(__dirname, '..', 'html_dumps2', 'webalkans_opportunities.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.log('❌ webalkans_opportunities.html not found');
    return;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  console.log(`\n✅ Loaded webalkans_opportunities.html (${html.length} chars)`);

  // Look for opportunity cards
  const cardRegex = /<div class="umb-card[\s\S]*?<\/div>/g;
  const titleRegex = /<h3 class="umb-card__title">(.*?)<\/h3>/;
  
  const matches = html.match(cardRegex);
  
  if (matches) {
    console.log(`🔍 Found ${matches.length} opportunity cards`);
    
    // Parse first few opportunities
    for (let i = 0; i < Math.min(3, matches.length); i++) {
      const card = matches[i];
      const titleMatch = card.match(titleRegex);
      
      if (titleMatch) {
        console.log(`\n💡 Opportunity ${i + 1}:`);
        console.log(`   Title: ${titleMatch[1].trim()}`);
      }
    }
  } else {
    // Try alternative pattern
    if (html.includes('Funding to Attend DigiQ')) {
      console.log('✅ Found funding opportunities in content');
    } else {
      console.log('❌ No opportunity cards found in webalkans_opportunities.html');
    }
  }
}

console.log('🧪 Testing Local HTML Parsers...\n');
testBidDetailParser();
testWebalkansParser();

console.log('\n✅ Parser testing completed');