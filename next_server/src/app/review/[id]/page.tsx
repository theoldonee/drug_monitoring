import { requireCounselorOrAdmin } from '@/lib/auth'
import { ReviewPage } from '@/modules/verification/ui/review/id'

export default async function Page() {
  // Enforce counselor or admin session at the server component layer
  await requireCounselorOrAdmin()

  return <ReviewPage />
}
