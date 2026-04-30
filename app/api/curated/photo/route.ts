import { NextRequest, NextResponse } from 'next/server'
import { uploadBusinessPhoto } from '@/lib/kv'
import { AuthError, requireAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file required' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Max 5MB' }, { status: 400 })
  }

  try {
    const buffer = await file.arrayBuffer()
    const url = await uploadBusinessPhoto(buffer, file.type, file.name)
    return NextResponse.json({ url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
