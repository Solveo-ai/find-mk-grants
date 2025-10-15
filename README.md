# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3fb2088f-095e-4661-970b-653bd80bf28c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3fb2088f-095e-4661-970b-653bd80bf28c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3fb2088f-095e-4661-970b-653bd80bf28c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Real-time Grant Aggregation System

This project includes a real-time grant aggregation system that automatically scrapes and parses grant opportunities from HTML sources using Supabase Edge Functions.

### Features

- **Real-time Processing**: New grant sources trigger immediate processing via database triggers
- **Deduplication**: Content-based hashing prevents duplicate grants
- **Modular Parsing**: Pluggable parser strategy with domain-specific parsers and generic fallback
- **Frontend Realtime**: React components update instantly as new grants are discovered
- **Error Handling**: Robust error tracking and retry mechanisms

### Database Schema

The system uses two main tables:
- `grant_sources`: Stores URLs of grant listing pages
- `grants`: Stores parsed grant information with deduplication via content_hash

### Setup Instructions

1. **Database Migration**
   Run the SQL in `backend/schema.sql` in your Supabase SQL editor to create tables, indexes, RLS policies, and triggers.

2. **Environment Variables**
   Set the following secrets in your Supabase Edge Functions:
   ```
   WEBHOOK_SECRET=your-random-webhook-secret
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Update Trigger Function**
   In the `invoke_process_grant_source` function in `backend/schema.sql`, replace:
   - `YOUR_WEBHOOK_SECRET_HERE` with your actual webhook secret
   - `YOUR_PROJECT_REF` with your Supabase project reference (found in project settings)

4. **Deploy Edge Functions**
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link to your project
   supabase link --project-ref your-project-ref

   # Deploy functions
   supabase functions deploy process-grant-source
   supabase functions deploy process-all-sources
   ```

5. **Frontend Integration**
   The frontend automatically subscribes to realtime grant updates. Use the `GrantsFeed` component:

   ```tsx
   import GrantsFeed from '@/components/grants/GrantsFeed';

   function App() {
     return (
       <div>
         <GrantsFeed limit={50} />
       </div>
     );
   }
   ```

### Testing

1. **Add a Test Source**
   ```sql
   INSERT INTO grant_sources (url) VALUES ('https://example.com/grants');
   ```

2. **Monitor Processing**
   - Check `grant_sources` table for status updates
   - View parsed grants in `grants` table
   - Frontend should update automatically via realtime subscription

3. **Manual Reprocessing**
   Call the `process-all-sources` function to reprocess existing sources:
   ```bash
   supabase functions invoke process-all-sources
   ```

### Architecture

- **Trigger**: Database trigger fires on `grant_sources` insert, calls Edge Function via pg_net
- **Processing**: Edge Function fetches HTML, parses with cheerio-like DOM parsing, upserts grants
- **Deduplication**: SHA-256 hash of title+url+deadline+source_url prevents duplicates
- **Realtime**: Supabase Realtime broadcasts INSERT/UPDATE events to frontend

### Security

- RLS policies restrict write access to service role (Edge Functions)
- Webhook secret authentication between database trigger and Edge Function
- Public read access to grants table for frontend consumption

### Performance Notes

- Each source processes independently with concurrency limits
- 10s timeout with 3 retries and exponential backoff
- Raw HTML stored for debugging (consider cleanup in production)
- Rate limiting via small delays between concurrent requests
