import { createClient } from '@supabase/supabase-js'

export default async function reload(req, res) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const { data, error } = await supabase.rpc('indexschool', { input: '' })

  if (data.length > 0) {
    console.log(data[0].city)
  }

  res.status(200).json(data)
}