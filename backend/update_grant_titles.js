import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function updateGrantTitles() {
  try {
    // First, get all grants where title starts with numbers
    const { data: grants, error: selectError } = await supabase
      .from('grants')
      .select('id, title')
      .ilike('title', '^[0-9]%'); // PostgreSQL ilike with regex pattern

    if (selectError) throw selectError;

    console.log(`Found ${grants.length} grants with titles starting with numbers`);

    for (const grant of grants) {
      // Remove leading numbers and any following spaces
      const newTitle = grant.title.replace(/^[0-9]+\s*/, '');

      console.log(`Updating: "${grant.title}" -> "${newTitle}"`);

      // Update the title
      const { error: updateError } = await supabase
        .from('grants')
        .update({ title: newTitle })
        .eq('id', grant.id);

      if (updateError) {
        console.error(`Error updating grant ${grant.id}:`, updateError);
      }
    }

    console.log('Update completed');

  } catch (error) {
    console.error('Error:', error);
  }
}

updateGrantTitles();