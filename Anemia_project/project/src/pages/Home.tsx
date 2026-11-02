import { Link } from 'react-router-dom'
import {
  ScanLine, GitBranch, BarChart3, ShieldCheck, MapPin, Layers,
  Activity, ArrowRight, Microscope, Database, Cpu,
} from 'lucide-react'
import { NFHS5_ANEMIA } from '../lib/geoRisk'

export default function Home() {
  const avgPrevalence = (
    Object.values(NFHS5_ANEMIA).reduce((s, d) => s + d.prevalence, 0) /
    Object.keys(NFHS5_ANEMIA).length
  ).toFixed(1)

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-ink-200 bg-gradient-to-br from-white via-white to-primary-50/40 p-8 sm:p-12">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-accent-100/50 blur-3xl" />
        <div className="relative">
          <div className="chip mb-4 bg-primary-50 text-primary-700">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
            Research Prototype · Multimodal Fusion
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl">
            Non-invasive anemia detection<br />
            <span className="text-primary-600">from a smartphone image.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-600">
            AnemiaFusionNet combines conjunctiva, fingernail-bed, and palm images with
            clinical data and NFHS-5 geo-risk signals to estimate hemoglobin —
            no blood draw required.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/detect" className="btn-primary">
              <ScanLine className="h-4 w-4" /> Try the demo
            </Link>
            <Link to="/pipeline" className="btn-ghost">
              <GitBranch className="h-4 w-4" /> View pipeline
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Image modalities', value: '3', icon: Layers, sub: 'Conjunctiva · Nail · Palm' },
          { label: 'NFHS-5 states covered', value: '29', icon: MapPin, sub: '+ UTs' },
          { label: 'Avg. women anemia', value: `${avgPrevalence}%`, icon: Activity, sub: 'NFHS-5, 15-49y' },
          { label: 'Fusion strategy', value: 'Weighted', icon: Cpu, sub: 'CNN + geo-risk' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">{s.label}</div>
                <Icon className="h-4 w-4 text-primary-500" />
              </div>
              <div className="mt-2 font-display text-3xl font-extrabold text-ink-900">{s.value}</div>
              <div className="text-xs text-ink-500">{s.sub}</div>
            </div>
          )
        })}
      </section>

      {/* Feature cards */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">What's inside</h2>
            <p className="text-ink-500">Four connected modules you can explore.</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            {
              to: '/detect', icon: ScanLine, title: 'Anemia Detection',
              desc: 'Upload conjunctiva, fingernail, and palm images, add clinical context, and get a hemoglobin estimate with severity classification.',
              accent: 'bg-primary-50 text-primary-700',
            },
            {
              to: '/pipeline', icon: GitBranch, title: 'Fusion Pipeline',
              desc: 'See how each modality streams through preprocessing, CNN feature extraction, and weighted fusion with the geo-risk module.',
              accent: 'bg-accent-50 text-accent-700',
            },
            {
              to: '/analytics', icon: BarChart3, title: 'Analytics Dashboard',
              desc: 'Aggregate predictions, severity distributions, and NFHS-5 state-level anemia prevalence comparison.',
              accent: 'bg-emerald-50 text-emerald-700',
            },
            {
              to: '/about', icon: Microscope, title: 'Architecture & Method',
              desc: 'Model architecture, dataset sources, WHO severity thresholds, and ethical considerations.',
              accent: 'bg-sky-50 text-sky-700',
            },
          ].map((c) => {
            const Icon = c.icon
            return (
              <Link key={c.to} to={c.to} className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${c.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold">{c.title}</h3>
                      <ArrowRight className="h-4 w-4 text-ink-400 transition group-hover:translate-x-1 group-hover:text-primary-600" />
                    </div>
                    <p className="mt-1 text-sm text-ink-600">{c.desc}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="card overflow-hidden">
        <div className="border-b border-ink-100 bg-ink-50/60 px-6 py-4">
          <h2 className="font-display text-lg font-bold">How a prediction flows</h2>
        </div>
        <div className="grid gap-px bg-ink-100 sm:grid-cols-4">
          {[
            { n: 1, t: 'Capture', d: 'Conjunctiva, nail bed, palm images + age, sex, state', icon: ScanLine },
            { n: 2, t: 'Extract', d: 'Per-modality CNN produces Hb estimate + confidence', icon: Cpu },
            { n: 3, t: 'Fuse', d: 'Weighted average + NFHS-5 geo-risk adjustment', icon: Layers },
            { n: 4, t: 'Classify', d: 'WHO thresholds → Normal / Mild / Moderate / Severe', icon: ShieldCheck },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.n} className="bg-white p-6">
                <div className="flex items-center gap-2 text-primary-600">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-600 text-xs font-bold text-white">{s.n}</span>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-3 font-semibold">{s.t}</div>
                <p className="mt-1 text-sm text-ink-500">{s.d}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Data sources */}
      <section className="grid gap-5 md:grid-cols-3">
        {[
          { icon: Database, t: 'NFHS-5 (2019-21)', d: 'State-level anemia prevalence among women 15-49 used to derive geo-risk weights.' },
          { icon: Microscope, t: 'WHO thresholds', d: 'Hemoglobin cutoffs (g/dL) for anemia severity by sex.' },
          { icon: ShieldCheck, t: 'Ethical by design', d: 'No images are stored server-side in this demo; predictions are ephemeral.' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.t} className="card p-5">
              <Icon className="h-5 w-5 text-primary-600" />
              <div className="mt-3 font-semibold">{s.t}</div>
              <p className="mt-1 text-sm text-ink-500">{s.d}</p>
            </div>
          )
        })}
      </section>
    </div>
  )
}
