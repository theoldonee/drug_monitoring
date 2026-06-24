import { requireAdmin } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This guard runs on every /admin/* page render.
  // Redirects to / if user is not an admin, or to /login if not authenticated.
  await requireAdmin()

  return <>{children}</>
}
