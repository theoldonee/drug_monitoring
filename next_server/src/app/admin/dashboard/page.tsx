import { requireAdmin } from '@/lib/auth'
import { getAdmins, getMyProfile } from './actions'
import { signOut } from '@/app/login/signout-action'
import { AddAdminForm } from './add-admin-form'
import {
  Shield,
  LogOut,
  Users,
  UserPlus,
  ClipboardList,
  Mail,
  Calendar,
} from 'lucide-react'

export default async function AdminDashboard() {
  const { user } = await requireAdmin()
  const profile = await getMyProfile()
  const { admins } = await getAdmins()

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 ring-1 ring-indigo-500/30">
              <Shield className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-100">
                Admin Dashboard
              </h1>
              <p className="text-xs text-zinc-500">Drug Monitoring System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-zinc-300">
                {profile?.email ?? user.email}
              </p>
              <p className="text-xs text-indigo-400">Administrator</p>
            </div>
            <form>
              <button
                id="admin-signout"
                formAction={signOut}
                className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-zinc-900/60 px-4 text-sm text-zinc-400 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Stats cards */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">
                  {admins.length}
                </p>
                <p className="text-xs text-zinc-500">Total Admins</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <ClipboardList className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">—</p>
                <p className="text-xs text-zinc-500">Pending Submissions</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <ClipboardList className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">—</p>
                <p className="text-xs text-zinc-500">Reviewed Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Queue placeholder */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              Submission Queue
            </h2>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-12 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-zinc-700" />
            <p className="mt-3 text-sm text-zinc-500">
              No submissions to review yet.
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Video submissions from users will appear here for review.
            </p>
          </div>
        </section>

        {/* Manage Admins */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              Manage Administrators
            </h2>
          </div>

          {/* Add Admin form */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-sm font-medium text-zinc-300">
              Add New Admin
            </h3>
            <AddAdminForm />
          </div>

          {/* Admin list */}
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-zinc-900/50">
            <div className="border-b border-white/[0.06] px-6 py-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Current Administrators
              </h3>
            </div>

            {admins.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-500">
                No administrators found.
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {admins.map((admin) => (
                  <li
                    key={admin.id}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-xs font-semibold uppercase text-indigo-400 ring-1 ring-indigo-500/20">
                        {admin.email?.charAt(0) ?? '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-zinc-500" />
                          <p className="text-sm font-medium text-zinc-200">
                            {admin.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar className="h-3 w-3 text-zinc-600" />
                          <p className="text-xs text-zinc-500">
                            Added{' '}
                            {admin.created_at
                              ? new Date(admin.created_at).toLocaleDateString()
                              : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {admin.id === user.id && (
                      <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400 ring-1 ring-indigo-500/20">
                        You
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
