"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart2, TrendingUp, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/safeguard/Navbar";
import { Footer } from "@/components/safeguard/Footer";

const riskDistData = [
  { name: "Low", value: 38, color: "#16a34a" },
  { name: "Medium", value: 45, color: "#d97706" },
  { name: "High", value: 29, color: "#dc2626" },
  { name: "Critical", value: 16, color: "#7c3aed" },
];

const approvalData = [
  { month: "Jan", approved: 32, flagged: 8 },
  { month: "Feb", approved: 28, flagged: 12 },
  { month: "Mar", approved: 41, flagged: 9 },
  { month: "Apr", approved: 35, flagged: 11 },
  { month: "May", approved: 48, flagged: 14 },
  { month: "Jun", approved: 56, flagged: 16 },
];

const completionData = [
  { name: "Completed", value: 87, fill: "#0d9488" },
  { name: "Pending", value: 13, fill: "#e2e8f0" },
];

const trendData = [
  { week: "W1 May", submissions: 18, processed: 16 },
  { week: "W2 May", submissions: 24, processed: 22 },
  { week: "W3 May", submissions: 21, processed: 19 },
  { week: "W4 May", submissions: 28, processed: 26 },
  { week: "W1 Jun", submissions: 31, processed: 28 },
  { week: "W2 Jun", submissions: 38, processed: 35 },
  { week: "W3 Jun", submissions: 42, processed: 39 },
  { week: "W4 Jun", submissions: 35, processed: 33 },
];

const summaryMetrics = [
  { label: "Total Submissions", value: "128", change: "+12%", positive: true },
  { label: "Avg Review Time", value: "4.2h", change: "-18%", positive: true },
  { label: "Completion Rate", value: "87%", change: "+5%", positive: true },
  { label: "Flag Rate", value: "12.5%", change: "-2%", positive: true },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                  <BarChart2 className="w-6 h-6 text-[#0d9488]" />
                  Analytics Overview
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Platform-wide risk assessment and review performance metrics
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Last 30 Days
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Summary metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryMetrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sg-card-hover"
              >
                <div className="text-xs text-slate-400 font-medium mb-1">{metric.label}</div>
                <div className="text-3xl font-bold text-[#0f172a] mb-1">{metric.value}</div>
                <div
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    metric.positive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  {metric.change} vs last period
                </div>
              </div>
            ))}
          </div>

          {/* Row 1: Risk Distribution + Approval vs Flagged */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Risk Distribution Pie */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-bold text-[#0f172a] mb-1">Risk Distribution</h2>
              <p className="text-xs text-slate-400 mb-5">All-time breakdown by assessed risk level</p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={riskDistData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {riskDistData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "10px", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3 w-full">
                  {riskDistData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-slate-600">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(item.value / 128) * 100}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-[#0f172a] w-6 text-right">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Approved vs Flagged Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-bold text-[#0f172a] mb-1">Approved vs. Flagged</h2>
              <p className="text-xs text-slate-400 mb-5">Monthly comparison of review outcomes</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={approvalData} barSize={16} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 11 }} cursor={{ fill: "#f8fafc" }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="approved" name="Approved" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="flagged" name="Flagged" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Completion Rate Radial + Submission Trends Line */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Radial completion rate */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center">
              <h2 className="font-bold text-[#0f172a] mb-1 w-full">Review Completion Rate</h2>
              <p className="text-xs text-slate-400 mb-4 w-full">Percentage of reports fully reviewed</p>
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    barSize={16}
                    data={completionData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-black text-[#0d9488]">87%</span>
                  <span className="text-xs text-slate-400">Complete</span>
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-[#0d9488]">111</div>
                  <div className="text-xs text-slate-400">Reviewed</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-slate-400">17</div>
                  <div className="text-xs text-slate-400">Pending</div>
                </div>
              </div>
            </div>

            {/* Submission trends line chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-bold text-[#0f172a] mb-1">Submission Trends</h2>
              <p className="text-xs text-slate-400 mb-5">Weekly submissions vs. processed over 8 weeks</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 11 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="submissions"
                    name="Submitted"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="processed"
                    name="Processed"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#0d9488" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk level breakdown table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-[#0f172a] mb-5">Risk Level Breakdown Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Risk Level", "Total Reports", "Approved", "Flagged", "Pending", "Avg Score", "% of Total"].map(
                      (h) => (
                        <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { level: "Low", total: 38, approved: 36, flagged: 1, pending: 1, avg: 15, pct: 30 },
                    { level: "Medium", total: 45, approved: 38, flagged: 4, pending: 3, avg: 48, pct: 35 },
                    { level: "High", total: 29, approved: 21, flagged: 7, pending: 1, avg: 73, pct: 23 },
                    { level: "Critical", total: 16, approved: 4, flagged: 11, pending: 1, avg: 91, pct: 12 },
                  ].map((row) => {
                    const levelColors: Record<string, string> = {
                      Low: "text-green-700 bg-green-50 border-green-200",
                      Medium: "text-amber-700 bg-amber-50 border-amber-200",
                      High: "text-red-700 bg-red-50 border-red-200",
                      Critical: "text-purple-700 bg-purple-50 border-purple-200",
                    };
                    return (
                      <tr key={row.level} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${levelColors[row.level]}`}>
                            {row.level} Risk
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-bold text-[#0f172a]">{row.total}</td>
                        <td className="py-3 pr-4 text-green-700 font-medium">{row.approved}</td>
                        <td className="py-3 pr-4 text-red-700 font-medium">{row.flagged}</td>
                        <td className="py-3 pr-4 text-amber-700 font-medium">{row.pending}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#0d9488]"
                                style={{ width: `${row.avg}%` }}
                              />
                            </div>
                            <span className="font-medium text-[#0f172a]">{row.avg}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-medium text-slate-600">{row.pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
