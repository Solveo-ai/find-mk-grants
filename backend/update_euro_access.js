// Script to update Euro-Access grants with new fields
require('dotenv').config({ path: '../frontend/.env' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateGrants() {
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('euro_access_grants.sql', 'utf8');

    // Split into individual statements
    const statements = sqlContent.split('\n\n').filter(stmt => stmt.trim());

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      console.log(`Executing statement ${i + 1}/${statements.length}`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
        }
      } catch (err) {
        console.error(`Failed to execute statement ${i + 1}:`, err.message);
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Update completed');
  } catch (error) {
    console.error('Error updating grants:', error);
  }
}

updateGrants();