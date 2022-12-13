import { createClient } from '@supabase/supabase-js'

export default async function reload(req, res) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const { data } = await supabase.rpc('intersection', { input: 'Learn & How & to & Learn', input2: 'gradoo & derece & atolyesi' })
  console.log(data)


  res.status(200).json(data)
}