import { requireCounselorOrAdmin } from '@/lib/auth'
import { fetchCaseReports } from './actions'
import { ReviewDashboardClient } from './ReviewDashboardClient'

export default async function ReviewPage() {
  const { user, role } = await requireCounselorOrAdmin()
  const { data: cases, error } = await fetchCaseReports()

  return <ReviewDashboardClient cases={cases} error={error} userEmail={user.email ?? ''} role={role} />
}
