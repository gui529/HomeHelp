import { createClient } from '@supabase/supabase-js'

export const DEFAULT_MESSAGE =
  "Hi, I'm Jeremy from QuickProList. We'd like to feature your business on our website this month! Interested in a permanent listing? It's just $29.99/month. Reply STOP to opt out."

export interface CampaignContact {
  id: string
  yelp_id: string | null
  business_name: string
  phone: string
  email: string | null
  channel: 'sms' | 'email'
  category: string | null
  city: string | null
  message_body: string
  message_sid: string | null
  status: 'sent' | 'failed'
  error_message: string | null
  invitation_token: string | null
  sent_at: string
}

export interface RecordContactInput {
  yelpId?: string
  businessName: string
  phone?: string
  email?: string
  channel: 'sms' | 'email'
  category?: string
  city?: string
  messageBody: string
  messageSid?: string
  status: 'sent' | 'failed'
  errorMessage?: string
  invitationToken?: string
}

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function recordContact(input: RecordContactInput): Promise<CampaignContact> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('campaign_contacts')
    .insert({
      yelp_id: input.yelpId ?? null,
      business_name: input.businessName,
      phone: input.phone ?? '',
      email: input.email ?? null,
      channel: input.channel,
      category: input.category ?? null,
      city: input.city ?? null,
      message_body: input.messageBody,
      message_sid: input.messageSid ?? null,
      status: input.status,
      error_message: input.errorMessage ?? null,
      invitation_token: input.invitationToken ?? null,
    })
    .select('*')
    .single()

  if (error || !data) throw new Error('Failed to record campaign contact')
  return data as CampaignContact
}

export async function listCampaignContacts(): Promise<CampaignContact[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('campaign_contacts')
    .select('*')
    .order('sent_at', { ascending: false })

  if (error || !data) return []
  return data as CampaignContact[]
}
