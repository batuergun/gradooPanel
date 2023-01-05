import { createClient } from '@supabase/supabase-js'

export default async function reload(req, res) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  // const { data } = await supabase.rpc('distinctevent')
  // console.log(data)

  // const { data, error } = await supabase.rpc('eventcount_by_time', { eventname: 'Gradoo x Derece Atölyesi', from_input: '2022-12-1', until_input: '2022-12-31' })
  // console.log(data[0].count)

  // const { data, error } = await supabase.rpc('distinctuser')
  // console.log(data)

  const { data, error } = await supabase.rpc('eventdistinctcount_by_time', { eventname: 'Gradoo x Derece Atölyesi', from_input: '2022-12-1', until_input: '2022-12-31'})
  console.log(data[0].count)

  // const { data, error } = await supabase.rpc('eventcount', { eventname: 'Gradoo x Derece Atölyesi' })
  // console.log(data)

  // const { data } = await supabase.rpc('intersection', { input: 'Learn & How & to & Learn', input2: 'gradoo & derece & atolyesi' })
  // console.log(data)


  res.status(200).json(data)
}