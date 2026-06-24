import { requireAdmin } from '@/lib/auth'
import { fetchAnalyticsData, fetchTeamMembers } from './actions'
import { AdminDashboardClient } from './AdminDashboardClient'

export default async function AdminPage() {
  const { user } = await requireAdmin()
  const [analyticsResult, teamResult] = await Promise.all([
    fetchAnalyticsData(),
    fetchTeamMembers(),
  ])

  return (
    <AdminDashboardClient
      analytics={analyticsResult.data}
      analyticsError={analyticsResult.error}
      teamMembers={teamResult.data}
      teamError={teamResult.error}
      userEmail={user.email ?? ''}
    />
  )
}
