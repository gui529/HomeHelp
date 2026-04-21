import { NextRequest, NextResponse } from 'next/server'
import { getFeaturedIds, addFeatured, removeFeatured } from '@/lib/kv'

export async function GET() {
  const ids = await getFeaturedIds()
  return NextResponse.json({ ids: Array.from(ids) })
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, action } = await req.json()
  if (!id || !['add', 'remove'].includes(action)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (action === 'add') {
    await addFeatured(id)
  } else {
    await removeFeatured(id)
  }

  return NextResponse.json({ ok: true })
}
