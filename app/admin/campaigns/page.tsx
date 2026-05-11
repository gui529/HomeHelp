import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import CampaignsClient from './CampaignsClient'

export default async function CampaignsPage() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/login?error=not_an_admin')
  }
  return <CampaignsClient />
}
