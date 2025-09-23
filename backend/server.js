const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Routes
app.get('/api/opportunities', async (req, res) => {
  try {
    let query = supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    // Add filters
    if (req.query.type) {
      const types = req.query.type.split(',');
      query = query.in('type', types);
    }
    if (req.query.sector) {
      const sectors = req.query.sector.split(',');
      query = query.in('sector', sectors);
    }
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }
    if (req.query.search) {
      query = query.or(`title.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/opportunities/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sources', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sources')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/opportunities/featured', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('status', 'open')
      .limit(3);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});