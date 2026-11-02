import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts'
import { TrendingUp, Activity, MapPin, Database, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { PredictionRecord } from '../lib/types'
import { NFHS5_ANEMIA } from '../lib/geoRisk'

const SEV_COLORS: Record<string, string> = {
  Normal: '#10b981', Mild: '#f97316', Moderate: '#ef4444', Severe: '#7f1d1d',
}

export default function Analytics() {
  const [records, setRecords] = useState<PredictionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      setRecords((data || []) as PredictionRecord[])
    } catch (e: any) {
      setError(e.message || 'Failed to load predictions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold text-primary-600">Failed to load analytics.</p>
        <p className="mt-1 text-sm text-ink-500">{error}</p>
        <button onClick={load} className="btn-primary mt-4"><RefreshCw className="h-4 w-4" /> Retry</button>
      </div>
    )
  }
  if (records.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Database className="mx-auto h-10 w-10 text-ink-300" />
        <p className="mt-2 font-semibold text-ink-600">No predictions yet.</p>
        <p className="text-sm text-ink-400">Run and save a prediction from the Detect page.</p>
      </div>
    )
  }

  const total = records.length
  const avgHb = (records.reduce((s, r) => s + Number(r.predicted_hb), 0) / total).toFixed(1)
  const avgConf = (records.reduce((s, r) => s + Number(r.confidence), 0) / total * 100).toFixed(0)
  const avgGeo = (records.reduce((s, r) => s + Number(r.geo_risk_weight), 0) / total).toFixed(2)

  // severity distribution
  const sevCounts = ['Normal', 'Mild', 'Moderate', 'Severe'].map((s) => ({
    name: s,
    value: records.filter((r) => r.severity === s).length,
    color: SEV_COLORS[s],
  }))

  // Hb distribution buckets
  const buckets = [
    { range: '< 8', min: 0, max: 8 },
    { range: '8-10.9', min: 8, max: 10.95 },
    { range: '11-11.9', min: 11, max: 11.95 },
    { range: '12-12.9', min: 12, max: 12.95 },
    { range: '≥ 13', min: 13, max: 100 },
  ].map((b) => ({
    range: b.range,
    count: records.filter((r) => Number(r.predicted_hb) >= b.min && Number(r.predicted_hb) < b.max).length,
  }))

  // state distribution (top 8)
  const stateMap: Record<string, number> = {}
  records.forEach((r) => { stateMap[r.state] = (stateMap[r.state] || 0) + 1 })
  const stateData = Object.entries(stateMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([state, count]) => ({
      state,
      count,
      prevalence: NFHS5_ANEMIA[state]?.prevalence ?? 0,
    }))

  // time series (last 14 days)
  const byDay: Record<string, number> = {}
  records.forEach((r) => {
    const d = new Date(r.created_at).toISOString().slice(0, 10)
    byDay[d] = (byDay[d] || 0) + 1
  })
  const days: string[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    days.push(d)
  }
  const timeData = days.map((d) => ({ date: d.slice(5), predictions: byDay[d] || 0 }))

  // modality availability
  const modalityCounts = ['conjunctiva', 'fingernail', 'palm', 'clinical'].map((m) => ({
    modality: m.charAt(0).toUpperCase() + m.slice(1),
    count: records.filter((r) => (r.modality_flags as Record<string, boolean>)?.[m]).length,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Analytics Dashboard</h1>
          <p className="text-ink-500">{total} saved predictions · last 14 days shown below.</p>
        </div>
        <button onClick={load} className="btn-ghost"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total predictions', value: total.toString(), icon: Database, color: 'text-primary-600' },
          { label: 'Avg predicted Hb', value: `${avgHb} g/dL`, icon: Activity, color: 'text-accent-600' },
          { label: 'Avg confidence', value: `${avgConf}%`, icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Avg geo-risk weight', value: avgGeo, icon: MapPin, color: 'text-sky-600' },
        ].map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">{k.label}</div>
                <Icon className={`h-4 w-4 ${k.color}`} />
              </div>
              <div className="mt-2 font-display text-3xl font-extrabold">{k.value}</div>
            </div>
          )
        })}
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Severity pie */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Severity Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={sevCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {sevCounts.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Hb distribution */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Hemoglobin Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={buckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time series */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Predictions Over Time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timeData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="predictions" stroke="#ef4444" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* State distribution */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Top States (predictions)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stateData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="state" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modality usage + NFHS comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Modality Availability</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={modalityCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="modality" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold">NFHS-5 Prevalence vs Predictions</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stateData.map((s) => ({ state: s.state.slice(0, 8), prevalence: s.prevalence, predictions: s.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="state" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="l" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="l" type="monotone" dataKey="prevalence" stroke="#ef4444" name="NFHS-5 %" strokeWidth={2} />
              <Line yAxisId="r" type="monotone" dataKey="predictions" stroke="#0ea5e9" name="Predictions" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent table */}
      <div className="card overflow-hidden">
        <div className="border-b border-ink-100 bg-ink-50/60 px-6 py-4">
          <h2 className="font-display text-lg font-bold">Recent Predictions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Time</th>
                <th className="px-6 py-3 font-semibold">Hb (g/dL)</th>
                <th className="px-6 py-3 font-semibold">Severity</th>
                <th className="px-6 py-3 font-semibold">Conf.</th>
                <th className="px-6 py-3 font-semibold">State</th>
                <th className="px-6 py-3 font-semibold">Age/Sex</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {records.slice(0, 12).map((r) => (
                <tr key={r.id} className="hover:bg-ink-50">
                  <td className="px-6 py-3 text-ink-500">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-6 py-3 font-semibold">{Number(r.predicted_hb).toFixed(1)}</td>
                  <td className="px-6 py-3">
                    <span className="chip" style={{ backgroundColor: SEV_COLORS[r.severity] + '22', color: SEV_COLORS[r.severity] }}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-ink-600">{(Number(r.confidence) * 100).toFixed(0)}%</td>
                  <td className="px-6 py-3 text-ink-600">{r.state}</td>
                  <td className="px-6 py-3 text-ink-500">{r.age ?? '—'} / {r.sex ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
