"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  BarChart2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Navbar } from "@/components/safeguard/Navbar";
import { Footer } from "@/components/safeguard/Footer";
import { StatsCard } from "@/components/safeguard/StatsCard";
import { RiskBadge } from "@/components/safeguard/RiskBadge";
import type { RiskLevel } from "@/components/safeguard/RiskBadge";
import Link from "next/link";

const statsData = [
  { title: "Total Reports", value: 128, icon: <FileText className="w-5 h-5" />, color: "teal" as const, trend: { value: 12, label: "vs last month" } },
  { title: "Pending Review", value: 23, icon: <Clock className="w-5 h-5" />, color: "amber" as const, trend: { value: 5, label: "awaiting admin" } },
  { title: "Approved", value: 89, icon: <CheckCircle className="w-5 h-5" />, color: "blue" as const, trend: { value: 8, label: "this month" } },
  { title: "Flagged", value: 16, icon: <AlertTriangle className="w-5 h-5" />, color: "red" as const, trend: { value: -3, label: "vs last month" } },
];

const recentReports = [
  { id: "SGR-2025-0471", date: "24 Jun 2025", risk: "medium" as RiskLevel, score: 47, status: "pending", submitter: "Community Worker A" },
  { id: "SGR-2025-0470", date: "24 Jun 2025", risk: "high" as RiskLevel, score: 72, status: "flagged", submitter: "Outreach Team B" },
  { id: "SGR-2025-0469", date: "23 Jun 2025", risk: "low" as RiskLevel, score: 18, status: "approved", submitter: "Community Worker C" },
  { id: "SGR-2025-0468", date: "23 Jun 2025", risk: "critical" as RiskLevel, score: 88, status: "flagged", submitter: "Field Team D" },
  { id: "SGR-2025-0467", date: "22 Jun 2025", risk: "medium" as RiskLevel, score: 51, status: "approved", submitter: "Community Worker A" },
  { id: "SGR-2025-0466", date: "22 Jun 2025", risk: "low" as RiskLevel, score: 12, status: "approved", submitter: "Outreach Team B" },
];

const weeklyData = [
  { day: "Mon", reports: 14, approved: 10, flagged: 4 },
  { day: "Tue", reports: 22, approved: 17, flagged: 5 },
  { day: "Wed", reports: 18, approved: 14, flagged: 4 },
  { day: "Thu", reports: 26, approved: 19, flagged: 7 },
  { day: "Fri", reports: 21, approved: 16, flagged: 5 },
  { day: "Sat", reports: 16, approved: 12, flagged: 4 },
  { day: "Sun", reports: 11, approved: 9, flagged: 2 },
];

const riskDistribution = [
  { name: "Low", value: 38, color: "#16a34a" },
  { name: "Medium", value: 45, color: "#d97706" },
  { name: "High", value: 29, color: "#dc2626" },
  { name: "Critical", value: 16, color: "#7c3aed" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending Review", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  approved: { label: "Approved", className: "bg-green-50 text-green-700 border border-green-200" },
  flagged: { label: "Flagged", className: "bg-red-50 text-red-700 border border-red-200" },
};

export default function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a]">Admin Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Overview of all SafeGuard MU submissions and review status
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </Button>
                <Link href="/admin/analytics">
                  <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" />
                    Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Weekly bar chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-bold text-[#0f172a] mb-1">Weekly Submission Trends</h2>
              <p className="text-xs text-slate-400 mb-5">Reports submitted and reviewed this week</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData} barSize={14} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
                    cursor={{ fill: "#f8fafc" }}
                  />
                  <Bar dataKey="approved" name="Approved" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="flagged" name="Flagged" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Risk distribution pie */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-bold text-[#0f172a] mb-1">Risk Distribution</h2>
              <p className="text-xs text-slate-400 mb-4">All-time by risk level</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "10px", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {riskDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#0f172a]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reports Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[#0f172a]">Recent Reports</h2>
                <p className="text-xs text-slate-400 mt-0.5">Latest AI-generated safety assessments</p>
              </div>
              <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
                {recentReports.filter((r) => r.status === "pending").length} pending
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 bg-[#f8fafc] hover:bg-[#f8fafc]">
                    <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Report ID</TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Date</TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Risk Level</TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Score</TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Submitter</TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReports.map((report) => {
                    const status = statusConfig[report.status];
                    return (
                      <TableRow key={report.id} className="border-slate-100 hover:bg-[#f8fafc] transition-colors">
                        <TableCell className="font-mono text-xs font-semibold text-[#0f172a]">{report.id}</TableCell>
                        <TableCell className="text-sm text-slate-500">{report.date}</TableCell>
                        <TableCell><RiskBadge level={report.risk} size="sm" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${report.score}%`,
                                  backgroundColor: report.score > 70 ? "#dc2626" : report.score > 40 ? "#d97706" : "#16a34a",
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{report.score}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.className}`}>
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{report.submitter}</TableCell>
                        <TableCell>
                          <Link href={`/admin/review/${report.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-[#0d9488] hover:bg-[#f0fdfa] hover:text-[#0d9488] rounded-lg">
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Review
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Review Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-[#0f172a] mb-1">Priority Review Queue</h2>
            <p className="text-xs text-slate-400 mb-5">High-risk reports requiring immediate human review</p>
            <div className="space-y-3">
              {recentReports
                .filter((r) => r.status === "pending" || r.risk === "high" || r.risk === "critical")
                .slice(0, 4)
                .map((report) => (
                  <div
                    key={report.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      report.risk === "critical" || report.risk === "high"
                        ? "bg-red-50 border-red-200"
                        : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 shrink-0 ${
                          report.risk === "critical" || report.risk === "high"
                            ? "text-red-500"
                            : "text-amber-500"
                        }`}
                      />
                      <div>
                        <div className="font-mono text-sm font-semibold text-[#0f172a]">{report.id}</div>
                        <div className="text-xs text-slate-500">{report.date} · Score: {report.score}/100</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiskBadge level={report.risk} size="sm" showIcon={false} />
                      <Link href={`/admin/review/${report.id}`}>
                        <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg h-7 text-xs">
                          Review Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
