// Script to insert Euro-Access data using Supabase client
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

// Read the SQL file and extract INSERT statements
const sqlContent = fs.readFileSync('euro_access_grants.sql', 'utf8');
const insertStatements = sqlContent.split('\n').filter(line =>
  line.trim().startsWith('INSERT INTO euro_access_grants')
);

console.log(`Found ${insertStatements.length} INSERT statements to execute`);

async function insertData() {
  for (let i = 0; i < insertStatements.length; i++) {
    const statement = insertStatements[i];
    console.log(`Executing statement ${i + 1}/${insertStatements.length}`);

    try {
      // Extract values from the INSERT statement
      const valuesMatch = statement.match(/VALUES\s*\((.*)\);?$/s);
      if (!valuesMatch) {
        console.error(`Could not parse statement ${i + 1}`);
        continue;
      }

      const values = valuesMatch[1];

      // Parse the values (this is a simplified parser)
      const parsedValues = parseInsertValues(values);

      const { error } = await supabase
        .from('euro_access_grants')
        .insert(parsedValues);

      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        // Continue with next statement
      }
    } catch (err) {
      console.error(`Error processing statement ${i + 1}:`, err.message);
    }
  }

  console.log('Data insertion completed');
}

function parseInsertValues(valuesStr) {
  // This is a very simplified parser for the INSERT VALUES
  // In a real scenario, you'd want a proper SQL parser
  const parts = valuesStr.split(',');

  return {
    source_id: cleanValue(parts[0]),
    source_url: cleanValue(parts[1]),
    title: cleanValue(parts[2]),
    title_mk: cleanValue(parts[3]),
    description: cleanValue(parts[4]),
    description_mk: cleanValue(parts[5]),
    deadline: cleanValue(parts[6]) === 'NULL' ? null : cleanValue(parts[6]),
    days_left: cleanValue(parts[7]) === 'NULL' ? null : parseInt(cleanValue(parts[7])),
    url: cleanValue(parts[8]),
    type: cleanValue(parts[9]),
    tags: parseArray(cleanValue(parts[10])),
    content_hash: cleanValue(parts[11]),
    raw_html: cleanValue(parts[12]),
    created_at: cleanValue(parts[13]),
    updated_at: cleanValue(parts[14]),
    funding_program: cleanValue(parts[15]),
    call_number: cleanValue(parts[16]),
    call_objectives: cleanValue(parts[17]),
    regions_countries_for_funding: cleanValue(parts[18]),
    eligible_entities: cleanValue(parts[19]),
    mandatory_partnership: cleanValue(parts[20]),
    project_partnership: cleanValue(parts[21]),
    topics: cleanValue(parts[22]),
    un_sdgs: cleanValue(parts[23]),
    additional_information: cleanValue(parts[24]),
    contact: cleanValue(parts[25]),
    funding_rate: cleanValue(parts[26]),
    estimated_eu_contribution_per_project: cleanValue(parts[27]),
    project_duration: cleanValue(parts[28]),
    relevance_for_eu_macro_region: cleanValue(parts[29]),
    other_eligibility_criteria: cleanValue(parts[30]),
    call_documents: cleanValue(parts[31])
  };
}

function cleanValue(value) {
  const cleaned = value.trim();
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    return cleaned.slice(1, -1).replace(/''/g, "'");
  }
  return cleaned;
}

function parseArray(arrayStr) {
  if (arrayStr === 'NULL') return null;
  // Parse ARRAY['item1', 'item2'] format
  const match = arrayStr.match(/ARRAY\[(.*)\]/);
  if (match) {
    const items = match[1].split(',').map(item => cleanValue(item.trim()));
    return items;
  }
  return null;
}

insertData().catch(console.error);