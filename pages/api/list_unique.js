import { createClient } from '@supabase/supabase-js'
const https = require("https");

export default async function reload(req, res) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const { data, error } = await supabase.rpc('eventdistinctcount', { eventname: 'Learn How to Learn: English'})

  res.status(200).json(data)
}

