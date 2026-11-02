import { useRef, useState } from 'react'
import { ScanLine, Upload, X, Image as ImageIcon, Droplet, MapPin, Sparkles, Save, RotateCcw, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2 } from 'lucide-react'
import { STATES, geoRiskWeight, severityFromHb, NFHS5_ANEMIA } from '../lib/geoRisk'
import { runPrediction } from '../lib/predict'
import type { PredictionInput, PredictionResult, ModalityResult } from '../lib/types'
import { supabase } from '../lib/supabase'

type Slot = 'conjunctiva' | 'fingernail' | 'palm'

const slotMeta: Record<Slot, { label: string; hint: string; color: string }> = {
  conjunctiva: { label: 'Conjunctiva', hint: 'Inner lower eyelid', color: 'bg-primary-50 text-primary-700' },
  fingernail: { label: 'Fingernail Bed', hint: 'Nail bed close-up', color: 'bg-accent-50 text-accent-700' },
  palm: { label: 'Palm', hint: 'Open palm', color: 'bg-emerald-50 text-emerald-700' },
}

export default function Detect() {
  const [images, setImages] = useState<Record<Slot, string | null>>({
    conjunctiva: null, fingernail: null, palm: null,
  })
  const [hemoglobin, setHemoglobin] = useState<string>('')
  const [age, setAge] = useState<string>('')
  const [sex, setSex] = useState<'male' | 'female' | ''>('')
  const [state, setState] = useState<string>('Bihar')
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const fileRefs = {
    conjunctiva: useRef<HTMLInputElement>(null),
    fingernail: useRef<HTMLInputElement>(null),
    palm: useRef<HTMLInputElement>(null),
  }

  function onFile(slot: Slot, file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImages((prev) => ({ ...prev, [slot]: reader.result as string }))
    reader.readAsDataURL(file)
  }

  function clearImage(slot: Slot) {
    setImages((prev) => ({ ...prev, [slot]: null }))
    if (fileRefs[slot].current) fileRefs[slot].current.value = ''
  }

  function reset() {
    setImages({ conjunctiva: null, fingernail: null, palm: null })
    setHemoglobin(''); setAge(''); setSex(''); setState('Bihar')
    setResult(null); setSavedMsg(null)
  }

  function run() {
    setRunning(true); setSavedMsg(null)
    const input: PredictionInput = {
      conjunctivaUrl: images.conjunctiva,
      fingernailUrl: images.fingernail,
      palmUrl: images.palm,
      hemoglobin: hemoglobin ? Number(hemoglobin) : null,
      age: age ? Number(age) : null,
      sex: sex || null,
      state,
    }
    // simulate inference latency
    setTimeout(() => {
      setResult(runPrediction(input))
      setRunning(false)
    }, 700)
  }

  async function saveResult() {
    if (!result) return
    setSaving(true); setSavedMsg(null)
    try {
      const { error } = await supabase.from('predictions').insert({
        predicted_hb: result.predictedHb,
        severity: result.severity,
        confidence: result.confidence,
        geo_risk_weight: result.geoRiskWeight,
        age: age ? Number(age) : null,
        sex: sex || null,
        state,
        modality_flags: {
          conjunctiva: !!images.conjunctiva,
          fingernail: !!images.fingernail,
          palm: !!images.palm,
          clinical: !!hemoglobin || !!age,
        },
      })
      if (error) throw error
      setSavedMsg('Saved to analytics dashboard.')
    } catch (e: any) {
      setSavedMsg(`Save failed: ${e.message || 'unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const geoW = geoRiskWeight(state)
  const stateData = NFHS5_ANEMIA[state]
  const canRun = images.conjunctiva || images.fingernail || images.palm || hemoglobin

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Anemia Detection</h1>
          <p className="text-ink-500">Provide any combination of modalities. More inputs → higher confidence.</p>
        </div>
        <button onClick={reset} className="btn-ghost">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="space-y-6 lg:col-span-3">
          {/* Image slots */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary-600" />
              <h2 className="font-display text-lg font-bold">Image Modalities</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {(Object.keys(slotMeta) as Slot[]).map((slot) => (
                <ImageSlot
                  key={slot}
                  slot={slot}
                  value={images[slot]}
                  meta={slotMeta[slot]}
                  inputRef={fileRefs[slot]}
                  onFile={(f) => onFile(slot, f)}
                  onClear={() => clearImage(slot)}
                />
              ))}
            </div>
          </div>

          {/* Clinical */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Droplet className="h-4 w-4 text-primary-600" />
              <h2 className="font-display text-lg font-bold">Clinical Data (optional)</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">Hemoglobin (g/dL)</label>
                <input
                  type="number" step="0.1" min="3" max="20"
                  value={hemoglobin}
                  onChange={(e) => setHemoglobin(e.target.value)}
                  placeholder="e.g. 11.2"
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">Age (years)</label>
                <input
                  type="number" min="0" max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 28"
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">Sex</label>
                <div className="flex gap-2">
                  {(['female', 'male'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSex(sex === s ? '' : s)}
                      className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-semibold capitalize transition ${
                        sex === s
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">State / UT</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="input-field"
                >
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Geo-risk preview */}
          <div className="card p-6">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-600" />
              <h2 className="font-display text-lg font-bold">Geo-Risk Context</h2>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{state}</span>
                  <span className="text-ink-500">{stateData?.prevalence.toFixed(1)}% prevalence</span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-accent-500 to-primary-600 transition-all"
                    style={{ width: `${(geoW * 100).toFixed(0)}%` }}
                  />
                </div>
                <div className="mt-1.5 text-xs text-ink-500">
                  Geo-risk weight: <span className="font-semibold text-ink-700">{geoW.toFixed(2)}</span> · {stateData?.region}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={run} disabled={!canRun || running} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
              {running ? <><Sparkles className="h-4 w-4 animate-spin" /> Running…</> : <><ScanLine className="h-4 w-4" /> Run prediction</>}
            </button>
            {!canRun && <span className="self-center text-sm text-ink-400">Add at least one modality to run.</span>}
          </div>
        </div>

        {/* Result */}
        <div className="lg:col-span-2">
          <ResultPanel result={result} running={running} onSave={saveResult} saving={saving} savedMsg={savedMsg} sex={sex || null} />
        </div>
      </div>
    </div>
  )
}

function ImageSlot({
  slot, value, meta, inputRef, onFile, onClear,
}: {
  slot: Slot
  value: string | null
  meta: { label: string; hint: string; color: string }
  inputRef: React.RefObject<HTMLInputElement>
  onFile: (f: File | undefined) => void
  onClear: () => void
}) {
  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <span className={`chip ${meta.color}`}>{meta.label}</span>
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 transition hover:border-primary-400 hover:bg-primary-50/30"
      >
        {value ? (
          <>
            <img src={value} alt={slot} className="h-full w-full object-cover" />
            <button
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 p-3 text-center">
            <Upload className="h-6 w-6 text-ink-400" />
            <span className="text-xs font-semibold text-ink-500">Click to upload</span>
            <span className="text-[10px] text-ink-400">{meta.hint}</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
    </div>
  )
}

function ResultPanel({
  result, running, onSave, saving, savedMsg, sex,
}: {
  result: PredictionResult | null
  running: boolean
  onSave: () => void
  saving: boolean
  savedMsg: string | null
  sex: 'male' | 'female' | null
}) {
  if (running) {
    return (
      <div className="card sticky top-24 flex h-72 flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="text-sm font-semibold text-ink-600">Fusing modalities…</p>
      </div>
    )
  }
  if (!result) {
    return (
      <div className="card sticky top-24 flex h-72 flex-col items-center justify-center gap-2 p-6 text-center">
        <ScanLine className="h-10 w-10 text-ink-300" />
        <p className="text-sm font-semibold text-ink-500">No prediction yet</p>
        <p className="text-xs text-ink-400">Run a prediction to see the fused hemoglobin estimate.</p>
      </div>
    )
  }

  const sev = result.severity
  const sevColor: Record<string, string> = {
    Normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Mild: 'bg-accent-50 text-accent-700 border-accent-200',
    Moderate: 'bg-primary-50 text-primary-700 border-primary-200',
    Severe: 'bg-primary-700 text-white border-primary-700',
  }
  const sevIcon = sev === 'Normal' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />
  const { threshold } = severityFromHb(result.predictedHb, sex)

  return (
    <div className="card sticky top-24 animate-fade-up overflow-hidden">
      <div className="border-b border-ink-100 bg-ink-50/60 px-5 py-3">
        <h2 className="font-display text-lg font-bold">Prediction</h2>
      </div>
      <div className="space-y-5 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">Predicted Hemoglobin</div>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-display text-5xl font-extrabold tracking-tight">{result.predictedHb.toFixed(1)}</span>
            <span className="mb-1.5 text-sm font-semibold text-ink-500">g/dL</span>
          </div>
          <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${sevColor[sev]}`}>
            {sevIcon} {sev} · {threshold}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-ink-500">Confidence</span>
            <span className="font-bold text-ink-700">{(result.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${result.confidence * 100}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Modality Contributions</div>
          <div className="space-y-2">
            {result.modalityResults.map((m: ModalityResult) => (
              <ModalityBar key={m.modality} m={m} />
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-ink-50 p-3 text-xs text-ink-500">
          Geo-risk weight <span className="font-semibold text-ink-700">{result.geoRiskWeight.toFixed(2)}</span> applied
          from regional NFHS-5 prevalence.
        </div>

        <button onClick={onSave} disabled={saving} className="btn-primary w-full disabled:opacity-50">
          {saving ? 'Saving…' : <><Save className="h-4 w-4" /> Save to dashboard</>}
        </button>
        {savedMsg && (
          <div className={`text-center text-xs font-semibold ${savedMsg.startsWith('Save failed') ? 'text-primary-600' : 'text-emerald-600'}`}>
            {savedMsg}
          </div>
        )}
      </div>
    </div>
  )
}

function ModalityBar({ m }: { m: ModalityResult }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 shrink-0 text-xs font-semibold text-ink-600">{m.label}</div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
        <div
          className={`h-full rounded-full transition-all ${m.available ? 'bg-primary-500' : 'bg-ink-200'}`}
          style={{ width: `${m.available ? m.contribution * 100 : 0}%` }}
        />
      </div>
      <div className="w-12 shrink-0 text-right text-xs text-ink-500">
        {m.available ? `${(m.contribution * 100).toFixed(0)}%` : '—'}
      </div>
    </div>
  )
}
