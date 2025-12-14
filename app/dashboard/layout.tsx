import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/security/auth'
import { getActiveSubscriptionWithPlanDetails } from '@/lib/db/queries'

export const metadata = {
  title: 'Dashboard - Chefe Natalino',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side guard: verifica token e assinatura ativa antes de renderizar qualquer conteúdo do dashboard
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('access-token')?.value

    if (!token) {
      // sem token — redirecionar para homepage (seção planos)
      redirect('/#precos')
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.userId) {
      redirect('/#precos')
    }

    const sub = await getActiveSubscriptionWithPlanDetails(payload.userId)
    if (!sub) {
      // sem assinatura ativa — redirecionar para homepage/planos
      redirect('/#precos')
    }

    // tudo ok — renderiza conteúdo do dashboard
    return <>{children}</>
  } catch (err) {
    // Em caso de erro, redirecionar para homepage
    redirect('/#precos')
  }
}
