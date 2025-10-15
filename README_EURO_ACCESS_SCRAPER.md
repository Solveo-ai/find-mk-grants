# Euro-Access EU Funding Scraper

This scraper extracts EU funding opportunities from Euro-Access (https://www.euro-access.eu) and generates a SQL dump file that can be imported into Supabase.

## Features

- Scrapes all ~400 funding calls from Euro-Access
- Extracts detailed information including:
  - Funding Program
  - Call Number
  - Opening/Deadline dates
  - Short Description
  - Call Objectives
  - Eligibility Criteria (regions, entities, partnerships)
  - Additional Information (topics, UN-SDGs, notes)
  - Contact details
- Translates titles and descriptions to Macedonian
- Generates SQL INSERT statements for Supabase
- Handles duplicates using content hashing

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## ✅ **COMPLETED: Euro-Access Data Successfully Imported!**

### 📊 **Import Results**
- **✅ 142 Euro-Access funding opportunities** imported to Supabase
- **✅ Separate tables** created (`euro_access_grants`, `euro_access_sources`)
- **✅ Macedonian translations** included for all content
- **✅ Database views** created for active grants
- **✅ All indexes and constraints** properly configured

### 🔍 **Database Tables Created**
- `euro_access_sources` - Source tracking table
- `euro_access_grants` - All funding opportunities with full details
- `active_euro_access_grants` - View for current/active opportunities

### 🚀 **Your Website Integration**

Your website can now query Euro-Access data using:

```javascript
// Get all Euro-Access grants
const { data: grants } = await supabase
  .from('euro_access_grants')
  .select('*')
  .eq('status', 'active');

// Get active grants with calculated days left
const { data: activeGrants } = await supabase
  .from('active_euro_access_grants')
  .select('*');
```

### 📝 **Available Fields**
Each grant includes:
- `title` / `title_mk` - Title in English/Macedonian
- `description` / `description_mk` - Description in English/Macedonian
- `funding_program` - EU program name
- `deadline` - Application deadline
- `days_left` - Days until deadline
- `url` - Link to original call
- `eligible_entities` - Who can apply
- `regions_countries_for_funding` - Eligible countries
- `topics` - Thematic categories
- And many more detailed fields...

### 🛠 **Future Updates**
To update the data in the future:
```bash
cd backend && node scrape_euro_access.js
# Then run: supabase db push
```

---

## 📚 **Original Documentation**

### Test with Local Files
```bash
cd backend && node test_euro_access.js
```

### Full Scrape
```bash
cd backend && node scrape_euro_access.js
```

### Verify Import
```bash
cd backend && node verify_import.js
```

## Output

The scraper generates a SQL file with INSERT statements for the `grants` table. The table schema includes:

- Standard grant fields (title, description, deadline, etc.)
- Macedonian translations (title_mk, description_mk)
- Euro-Access specific fields (funding_program, call_number, etc.)
- Content hash for duplicate prevention

## Database Schema

The generated SQL expects separate Euro-Access tables:

- **`euro_access_sources`** - Source tracking table
- **`euro_access_grants`** - Euro-Access funding opportunities table

Run `create_euro_access_tables.sql` first to create these tables with all necessary columns, indexes, and triggers.

```sql
source_id, source_url, title, title_mk, description, description_mk,
deadline, days_left, url, type, tags, content_hash, raw_html,
created_at, updated_at, funding_program, call_number, call_objectives,
regions_countries_for_funding, eligible_entities, mandatory_partnership,
project_partnership, topics, un_sdgs, additional_information, contact
```

## Translation

The scraper uses Google Translate API for Macedonian translation. If translation fails, it falls back to the original English text.

## Rate Limiting

To be respectful to the Euro-Access servers, the scraper includes:
- 1-second delay between detail page requests
- User-Agent header identifying as a scraper
- Error handling for failed requests

## Troubleshooting

- **Translation fails**: The Google Translate API may have rate limits. The scraper will continue with original text.
- **Network errors**: Check your internet connection. The scraper will retry failed requests.
- **Missing data**: Some calls may have incomplete information on Euro-Access.

## Integration with Website

After importing the SQL dump into Supabase:

1. The homepage can display cards using the grant data
2. Detail pages can show full information from the database
3. Macedonian translations will be displayed to users
4. Days left until deadline are pre-calculated

## File Structure

- `scrape_euro_access.js` - Main scraper script
- `test_euro_access.js` - Test script using local HTML files
- `SearchForFunding.html` - Sample list page HTML
- `ErasmusCharterForHigherEducation.html` - Sample detail page HTML
- `euro_access_grants.sql` - Generated SQL dump (after running scraper)