import { useState } from 'react'
import {
  ScanLine, Crop, Cpu, Layers, MapPin, GitMerge, ShieldCheck,
  ArrowRight, Eye, Image as ImageIcon, Droplet,
} from 'lucide-react'

const stages = [
  {
    id: 'capture', n: 1, title: 'Capture', icon: ScanLine, color: 'bg-primary-600',
    desc: 'Collect up to three image modalities plus optional clinical context.',
    items: [
      { label: 'Conjunctiva photo', icon: ImageIcon },
      { label: 'Fingernail bed photo', icon: ImageIcon },
      { label: 'Palm photo', icon: ImageIcon },
      { label: 'Age, sex, Hb (optional)', icon: Droplet },
    ],
  },
  {
    id: 'preprocess', n: 2, title: 'Preprocess', icon: Crop, color: 'bg-accent-600',
    desc: 'Resize to 224×224, normalize, augment, ROI extraction for conjunctiva.',
    items: [
      { label: 'Resize 224×224', icon: Crop },
      { label: 'Normalize (ImageNet stats)', icon: Crop },
      { label: 'Conjunctiva ROI segmentation', icon: Crop },
      { label: 'Augment: flip, rotate, jitter', icon: Crop },
    ],
  },
  {
    id: 'extract', n: 3, title: 'Feature Extract', icon: Cpu, color: 'bg-sky-600',
    desc: 'Per-modality CNN backbone (EfficientNet-B0) produces an Hb estimate + confidence.',
    items: [
      { label: 'Conjunctiva branch → Hb_c', icon: Cpu },
      { label: 'Fingernail branch → Hb_f', icon: Cpu },
      { label: 'Palm branch → Hb_p', icon: Cpu },
      { label: 'Clinical MLP → Hb_clin', icon: Cpu },
    ],
  },
  {
    id: 'fuse', n: 4, title: 'Fusion', icon: GitMerge, color: 'bg-emerald-600',
    desc: 'Availability-aware weighted average combines modality estimates.',
    items: [
      { label: 'Weights: 0.40 / 0.25 / 0.20 / 0.15', icon: Layers },
      { label: 'Renormalize over available modalities', icon: Layers },
      { label: 'Weighted Hb estimate', icon: Layers },
    ],
  },
  {
    id: 'georisk', n: 5, title: 'Geo-Risk Adjust', icon: MapPin, color: 'bg-indigo-600',
    desc: 'NFHS-5 state prevalence nudges the estimate for high-risk regions.',
    items: [
      { label: 'Look up state prevalence', icon: MapPin },
      { label: 'Weight = prevalence / 100', icon: MapPin },
      { label: 'Adjust: (w − 0.5) × −0.6', icon: MapPin },
    ],
  },
  {
    id: 'classify', n: 6, title: 'Classify', icon: ShieldCheck, color: 'bg-primary-700',
    desc: 'WHO hemoglobin thresholds map the estimate to a severity class.',
    items: [
      { label: 'Normal: ≥ 12 (F) / ≥ 13 (M)', icon: ShieldCheck },
      { label: 'Mild: 11–11.9 (F) / 11–12.9 (M)', icon: ShieldCheck },
      { label: 'Moderate: 8–10.9', icon: ShieldCheck },
      { label: 'Severe: < 8', icon: ShieldCheck },
    ],
  },
]

export default function Pipeline() {
  const [active, setActive] = useState(1)
  const activeStage = stages.find((s) => s.n === active)!

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Fusion Pipeline</h1>
        <p className="text-ink-500">From smartphone images to a severity class — six stages.</p>
      </div>

      {/* Horizontal flow */}
      <div className="card overflow-x-auto p-6">
        <div className="flex min-w-max items-stretch gap-2">
          {stages.map((s, i) => {
            const Icon = s.icon
            const isActive = s.n === active
            return (
              <div key={s.id} className="flex items-stretch gap-2">
                <button
                  onClick={() => setActive(s.n)}
                  className={`group flex w-44 flex-col rounded-xl border p-4 text-left transition ${
                    isActive
                      ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                      : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`grid h-8 w-8 place-items-center rounded-lg text-white ${s.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-ink-400">Stage {s.n}</span>
                  </div>
                  <div className="mt-2 font-display text-sm font-bold">{s.title}</div>
                  <div className="mt-1 text-[11px] leading-snug text-ink-500">{s.desc}</div>
                </button>
                {i < stages.length - 1 && (
                  <div className="flex items-center text-ink-300">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Active stage detail */}
      <div className="card animate-fade-up overflow-hidden">
        <div className={`flex items-center gap-3 px-6 py-4 text-white ${activeStage.color}`}>
          {(() => {
            const Icon = activeStage.icon
            return <Icon className="h-5 w-5" />
          })()}
          <h2 className="font-display text-lg font-bold">Stage {activeStage.n}: {activeStage.title}</h2>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-ink-600">{activeStage.desc}</p>
            <div className="mt-4 space-y-2">
              {activeStage.items.map((it) => {
                const Icon = it.icon
                return (
                  <div key={it.label} className="flex items-center gap-2.5 rounded-lg bg-ink-50 px-3 py-2">
                    <Icon className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium text-ink-700">{it.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="rounded-xl border border-ink-200 bg-ink-50/40 p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
              <Eye className="h-4 w-4" /> Visual
            </div>
            <StageVisual stageId={activeStage.id} />
          </div>
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="card overflow-hidden">
        <div className="border-b border-ink-100 bg-ink-50/60 px-6 py-4">
          <h2 className="font-display text-lg font-bold">End-to-end architecture</h2>
        </div>
        <div className="p-6">
          <ArchDiagram />
        </div>
      </div>
    </div>
  )
}

function StageVisual({ stageId }: { stageId: string }) {
  if (stageId === 'capture') {
    return (
      <div className="grid grid-cols-3 gap-3">
        {['Conjunctiva', 'Nail bed', 'Palm'].map((m) => (
          <div key={m} className="aspect-square rounded-lg border-2 border-dashed border-ink-200 bg-white grid place-items-center text-center text-xs font-semibold text-ink-400">
            {m}
          </div>
        ))}
      </div>
    )
  }
  if (stageId === 'preprocess') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded bg-gradient-to-br from-primary-200 to-accent-200" />
          <ArrowRight className="h-4 w-4 text-ink-400" />
          <div className="h-16 w-16 rounded bg-gradient-to-br from-primary-200 to-accent-200" />
          <ArrowRight className="h-4 w-4 text-ink-400" />
          <div className="h-16 w-16 rounded border-2 border-primary-400 bg-white grid place-items-center text-[10px] font-bold text-primary-600">224²</div>
        </div>
        <p className="text-xs text-ink-500">Resize → normalize → ROI → augment.</p>
      </div>
    )
  }
  if (stageId === 'extract') {
    return (
      <div className="space-y-2">
        {['Conjunctiva', 'Fingernail', 'Palm', 'Clinical'].map((m, i) => (
          <div key={m} className="flex items-center gap-2">
            <div className="w-24 text-xs font-semibold text-ink-600">{m}</div>
            <div className="flex-1 rounded-md border border-ink-200 bg-white px-2 py-1.5 text-[10px] font-mono text-ink-500">
              EfficientNet-B0 → fc → Hb<sub>{['c','f','p','clin'][i]}</sub>
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (stageId === 'fuse') {
    return (
      <div className="space-y-2">
        {[
          { l: 'Conjunctiva', w: 0.40, c: 'bg-primary-500' },
          { l: 'Fingernail', w: 0.25, c: 'bg-accent-500' },
          { l: 'Palm', w: 0.20, c: 'bg-emerald-500' },
          { l: 'Clinical', w: 0.15, c: 'bg-sky-500' },
        ].map((m) => (
          <div key={m.l} className="flex items-center gap-2">
            <div className="w-20 text-xs font-semibold text-ink-600">{m.l}</div>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink-100">
              <div className={`h-full rounded-full ${m.c}`} style={{ width: `${m.w * 100}%` }} />
            </div>
            <div className="w-8 text-right text-xs font-bold text-ink-600">{m.w}</div>
          </div>
        ))}
        <p className="pt-1 text-xs text-ink-500">Σ wᵢ·Hbᵢ / Σ wᵢ (available only)</p>
      </div>
    )
  }
  if (stageId === 'georisk') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink-600">State prevalence</span>
          <span className="font-mono text-ink-500">e.g. 65.3% → w=0.65</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-accent-500 to-primary-600" style={{ width: '65%' }} />
        </div>
        <p className="text-xs text-ink-500">Adjustment: (w − 0.5) × −0.6 → nudges Hb down in high-risk regions.</p>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {[
        { l: 'Normal', c: 'bg-emerald-100 text-emerald-700', v: '≥ 12 / 13' },
        { l: 'Mild', c: 'bg-accent-100 text-accent-700', v: '11–11.9 / 12.9' },
        { l: 'Moderate', c: 'bg-primary-100 text-primary-700', v: '8–10.9' },
        { l: 'Severe', c: 'bg-primary-700 text-white', v: '< 8' },
      ].map((s) => (
        <div key={s.l} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${s.c}`}>
          <span>{s.l}</span>
          <span className="font-mono">{s.v} g/dL</span>
        </div>
      ))}
    </div>
  )
}

function ArchDiagram() {
  const branches = [
    { name: 'Conjunctiva', color: 'border-primary-300 bg-primary-50', w: '0.40' },
    { name: 'Fingernail', color: 'border-accent-300 bg-accent-50', w: '0.25' },
    { name: 'Palm', color: 'border-emerald-300 bg-emerald-50', w: '0.20' },
    { name: 'Clinical', color: 'border-sky-300 bg-sky-50', w: '0.15' },
  ]
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {branches.map((b) => (
          <div key={b.name} className={`rounded-lg border-2 p-3 text-center ${b.color}`}>
            <div className="text-xs font-bold text-ink-700">{b.name}</div>
            <div className="mt-1 text-[10px] font-mono text-ink-500">CNN → Hb</div>
            <div className="mt-1 text-[10px] font-semibold text-ink-600">w = {b.w}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <ArrowRight className="h-5 w-5 text-ink-400" />
      </div>
      <div className="mx-auto max-w-md rounded-xl border-2 border-ink-300 bg-white p-4 text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">Weighted Fusion</div>
        <div className="mt-1 font-mono text-sm text-ink-700">Ĥ = Σ wᵢ · Hbᵢ / Σ wᵢ</div>
      </div>
      <div className="flex justify-center">
        <ArrowRight className="h-5 w-5 text-ink-400" />
      </div>
      <div className="mx-auto max-w-md rounded-xl border-2 border-indigo-300 bg-indigo-50 p-4 text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">+ Geo-Risk (NFHS-5)</div>
        <div className="mt-1 font-mono text-sm text-ink-700">Ĥ_adj = Ĥ + (w_geo − 0.5) × −0.6</div>
      </div>
      <div className="flex justify-center">
        <ArrowRight className="h-5 w-5 text-ink-400" />
      </div>
      <div className="mx-auto max-w-md rounded-xl border-2 border-primary-400 bg-primary-50 p-4 text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary-700">WHO Severity Class</div>
        <div className="mt-1 flex flex-wrap justify-center gap-1.5">
          {['Normal', 'Mild', 'Moderate', 'Severe'].map((s) => (
            <span key={s} className="chip bg-white text-ink-700 border border-ink-200">{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
