import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCeiaPlansByUserId } from '@/lib/db/queries'
import { withAuthorization } from '@/lib/security/authorization'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    if (!userId) return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 })

    return withAuthorization(
      req,
      async (user) => {
        // ownership enforced by withAuthorization options
        const plans = await getCeiaPlansByUserId(user.id, 20)
        return NextResponse.json({ success: true, plans })
      },
      { requireOwnershipOf: userId, requireSubscription: true }
    )
  } catch (err: any) {
    console.error('ceia.list error', err)
    return NextResponse.json({ success: false, message: err.message || 'Erro' }, { status: 500 })
  }
}
