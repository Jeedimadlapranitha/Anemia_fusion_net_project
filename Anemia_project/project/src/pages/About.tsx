import { Microscope, Cpu, Database, ShieldCheck, TriangleAlert as AlertTriangle, BookOpen, Layers, MapPin, Activity, HeartPulse } from 'lucide-react'

export default function About() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Architecture & Method</h1>
        <p className="text-ink-500">How AnemiaFusionNet works under the hood.</p>
      </div>

      {/* Problem */}
      <section className="card p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary-600" />
          <h2 className="font-display text-xl font-bold">The problem</h2>
        </div>
        <p className="mt-3 text-ink-600">
          Anemia affects over half of Indian women aged 15-49 (NFHS-5, 2019-21), yet mass screening
          is bottlenecked by the need for invasive blood draws and lab equipment. A smartphone-based,
          non-invasive screening tool could dramatically expand reach in rural and low-resource settings.
        </p>
      </section>

      {/* Architecture */}
      <section className="card overflow-hidden">
        <div className="border-b border-ink-100 bg-ink-50/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary-600" />
            <h2 className="font-display text-xl font-bold">Model architecture</h2>
          </div>
        </div>
        <div className="grid gap-px bg-ink-100 md:grid-cols-2">
          {[
            { icon: Layers, t: 'Multi-branch CNN', d: 'Each image modality (conjunctiva, nail, palm) passes through its own EfficientNet-B0 backbone pretrained on ImageNet, then a regression head outputs a hemoglobin estimate.' },
            { icon: Activity, t: 'Clinical MLP', d: 'Age, sex, and (if available) lab Hb feed a small MLP that produces a clinical Hb estimate with higher confidence when lab data is present.' },
            { icon: MapPin, t: 'Geo-Risk Module', d: 'State-level NFHS-5 anemia prevalence is converted to a 0-1 weight and used to adjust the fused estimate downward in high-risk regions.' },
            { icon: HeartPulse, t: 'Weighted Fusion', d: 'Modality estimates are combined using fixed weights (0.40 / 0.25 / 0.20 / 0.15) renormalized over available modalities, then geo-adjusted.' },
          ].map((c) => {
            const Icon = c.icon
            return (
              <div key={c.t} className="bg-white p-6">
                <Icon className="h-5 w-5 text-primary-600" />
                <div className="mt-3 font-semibold">{c.t}</div>
                <p className="mt-1 text-sm text-ink-500">{c.d}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* WHO thresholds */}
      <section className="card p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary-600" />
          <h2 className="font-display text-xl font-bold">WHO anemia thresholds (g/dL)</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Severity</th>
                <th className="px-4 py-2 font-semibold">Women (non-pregnant)</th>
                <th className="px-4 py-2 font-semibold">Men</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {[
                { s: 'Normal', w: '≥ 12.0', m: '≥ 13.0', c: 'text-emerald-600' },
                { s: 'Mild', w: '11.0 – 11.9', m: '11.0 – 12.9', c: 'text-accent-600' },
                { s: 'Moderate', w: '8.0 – 10.9', m: '8.0 – 10.9', c: 'text-primary-600' },
                { s: 'Severe', w: '< 8.0', m: '< 8.0', c: 'text-primary-800' },
              ].map((r) => (
                <tr key={r.s}>
                  <td className={`px-4 py-2.5 font-semibold ${r.c}`}>{r.s}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-700">{r.w}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-700">{r.m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Data sources */}
      <section className="grid gap-5 md:grid-cols-3">
        {[
          { icon: Database, t: 'NFHS-5 (2019-21)', d: 'National Family Health Survey-5 provides state-level anemia prevalence among women 15-49, used to derive geo-risk weights for 29 states/UTs.' },
          { icon: Microscope, t: 'Image datasets', d: 'Conjunctiva, fingernail, and palm images sourced from published anemia-detection research datasets. In this demo, uploads stay client-side.' },
          { icon: BookOpen, t: 'WHO guidelines', d: 'Hemoglobin cutoff thresholds for anemia severity classification are defined by the World Health Organization.' },
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

      {/* Ethics */}
      <section className="card border-l-4 border-l-primary-500 p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary-600" />
          <h2 className="font-display text-xl font-bold">Ethical considerations</h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-ink-600">
          <li className="flex gap-2"><span className="text-primary-500">•</span> This is a research prototype, not a medical device, and must not replace clinical diagnosis.</li>
          <li className="flex gap-2"><span className="text-primary-500">•</span> No images are stored server-side in this demo; only prediction metadata is persisted for analytics.</li>
          <li className="flex gap-2"><span className="text-primary-500">•</span> Geo-risk adjustment is a population-level prior and should not override individual clinical judgment.</li>
          <li className="flex gap-2"><span className="text-primary-500">•</span> Deployment should include informed consent, data minimization, and bias auditing across regions and skin tones.</li>
        </ul>
      </section>

      {/* Disclaimer */}
      <section className="rounded-2xl bg-ink-100 p-5 text-center text-xs text-ink-500">
        AnemiaFusionNet is a demonstration of multimodal AI for public-health screening.
        Predictions are simulated for illustration and are not clinically validated.
      </section>
    </div>
  )
}
