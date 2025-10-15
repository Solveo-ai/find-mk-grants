import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function updateEuFundingsTitles() {
  try {
    // First, get all eu_fundings where title_mk starts with numbers
    const { data: fundings, error: selectError } = await supabase
      .from('eu_fundings')
      .select('id, title_mk')
      .ilike('title_mk', '^[0-9]%'); // PostgreSQL ilike with regex pattern

    if (selectError) throw selectError;

    console.log(`Found ${fundings.length} eu_fundings with titles starting with numbers`);

    for (const funding of fundings) {
      // Remove leading numbers and any following spaces
      const newTitle = funding.title_mk.replace(/^[0-9]+\s*/, '');

      console.log(`Updating: "${funding.title_mk}" -> "${newTitle}"`);

      // Update the title_mk
      const { error: updateError } = await supabase
        .from('eu_fundings')
        .update({ title_mk: newTitle })
        .eq('id', funding.id);

      if (updateError) {
        console.error(`Error updating eu_funding ${funding.id}:`, updateError);
      }
    }

    console.log('Update completed');

  } catch (error) {
    console.error('Error:', error);
  }
}

updateEuFundingsTitles();