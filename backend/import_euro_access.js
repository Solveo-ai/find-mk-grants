// Script to help import Euro-Access grants into Supabase
const fs = require('fs');
const path = require('path');

console.log('Euro-Access Import Helper');
console.log('==========================');
console.log('');
console.log('This script provides instructions for importing Euro-Access data into Supabase.');
console.log('');

// Check if files exist
const createTablesPath = path.join(__dirname, '..', 'create_euro_access_tables.sql');
const grantsSQLPath = path.join(__dirname, 'euro_access_grants.sql');

console.log('Checking files...');
console.log(`Create tables SQL: ${fs.existsSync(createTablesPath) ? '✅ Found' : '❌ Missing'}`);
console.log(`Grants data SQL: ${fs.existsSync(grantsSQLPath) ? '✅ Found' : '❌ Missing'}`);
console.log('');

if (!fs.existsSync(createTablesPath) || !fs.existsSync(grantsSQLPath)) {
  console.log('❌ Required files are missing. Please run the scraper first:');
  console.log('   node scrape_euro_access.js');
  process.exit(1);
}

console.log('📋 Import Instructions:');
console.log('');
console.log('Method 1: Supabase Dashboard (Easiest)');
console.log('--------------------------------------');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the contents of create_euro_access_tables.sql');
console.log('4. Click "Run" to create the tables');
console.log('5. Copy and paste the contents of backend/euro_access_grants.sql');
console.log('6. Click "Run" to import the data');
console.log('');

console.log('Method 2: Command Line (if you have psql)');
console.log('------------------------------------------');
console.log('1. Install PostgreSQL client (psql) if not installed');
console.log('2. Get your database connection string from Supabase dashboard');
console.log('3. Run:');
console.log(`   psql "${process.env.DATABASE_URL || 'your-supabase-connection-string'}" -f create_euro_access_tables.sql`);
console.log(`   psql "${process.env.DATABASE_URL || 'your-supabase-connection-string'}" -f backend/euro_access_grants.sql`);
console.log('');

console.log('Method 3: Supabase CLI');
console.log('-----------------------');
console.log('1. Install Supabase CLI: npm install -g supabase');
console.log('2. Login: supabase login');
console.log('3. Link project: supabase link --project-ref your-project-ref');
console.log('4. Run: supabase db push');
console.log('');

console.log('📊 Expected Results:');
console.log('- euro_access_sources table with 1 record (Euro-Access)');
console.log('- euro_access_grants table with ~400 EU funding opportunities');
console.log('- All grants include Macedonian translations');
console.log('- Days-left calculations for active deadlines');
console.log('');

console.log('🔍 File Locations:');
console.log(`Tables SQL: ${createTablesPath}`);
console.log(`Grants SQL: ${grantsSQLPath}`);
console.log('');

console.log('✅ Ready to import! Choose one of the methods above.');
console.log('');
console.log('Note: If you get duplicate key errors, the import will skip existing records (this is normal).');