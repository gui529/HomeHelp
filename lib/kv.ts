import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function getFeaturedIds(): Promise<Set<string>> {
  const supabase = getSupabase()
  if (!supabase) return new Set()
  const { data } = await supabase.from('featured_businesses').select('id')
  return new Set((data ?? []).map((row: { id: string }) => row.id))
}

export async function addFeatured(id: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.from('featured_businesses').upsert({ id })
}

export async function removeFeatured(id: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.from('featured_businesses').delete().eq('id', id)
}
