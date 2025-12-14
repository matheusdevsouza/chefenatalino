import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDrinkCalculationsByUserId } from '@/lib/db/queries'
import { withAuthorization } from '@/lib/security/authorization'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    if (!userId) return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 })

    return withAuthorization(
      req,
      async (user) => {
        const items = await getDrinkCalculationsByUserId(user.id, 20)
        return NextResponse.json({ success: true, items })
      },
      { requireOwnershipOf: userId, requireSubscription: true }
    )
  } catch (err: any) {
    console.error('drinks.list error', err)
    return NextResponse.json({ success: false, message: err.message || 'Erro' }, { status: 500 })
  }
}
