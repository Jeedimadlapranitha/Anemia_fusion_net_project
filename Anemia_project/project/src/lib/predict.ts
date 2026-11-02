import type { PredictionInput, PredictionResult, ModalityResult, Modality } from './types'
import { geoRiskWeight, severityFromHb } from './geoRisk'

// Deterministic pseudo-random in [0,1) seeded by a string.
function seededRandom(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

function modalityBase(modality: Modality, seed: string): { hb: number; conf: number } {
  const r = seededRandom(seed + modality)
  // Each modality produces a slightly noisy Hb estimate around 10.5 ± 2.5
  const hb = 10.5 + (r - 0.5) * 5
  const conf = 0.7 + seededRandom(seed + modality + 'conf') * 0.25
  return { hb: Math.round(hb * 10) / 10, conf: Math.round(conf * 100) / 100 }
}

const WEIGHTS: Record<Modality, number> = {
  conjunctiva: 0.40,
  fingernail: 0.25,
  palm: 0.20,
  clinical: 0.15,
}

export function runPrediction(input: PredictionInput): PredictionResult {
  const seed = [
    input.conjunctivaUrl || 'noC',
    input.fingernailUrl || 'noF',
    input.palmUrl || 'noP',
    input.hemoglobin ?? 'noHb',
    input.age ?? 'noAge',
    input.sex ?? 'noSex',
    input.state,
  ].join('|')

  const modalities: ModalityResult[] = []
  let weightedSum = 0
  let weightTotal = 0

  const conj = modalityBase('conjunctiva', seed)
  modalities.push({
    modality: 'conjunctiva',
    label: 'Conjunctiva',
    available: !!input.conjunctivaUrl,
    confidence: conj.conf,
    contribution: WEIGHTS.conjunctiva,
    predictedHb: input.conjunctivaUrl ? conj.hb : null,
  })
  if (input.conjunctivaUrl) { weightedSum += conj.hb * WEIGHTS.conjunctiva; weightTotal += WEIGHTS.conjunctiva }

  const nail = modalityBase('fingernail', seed)
  modalities.push({
    modality: 'fingernail',
    label: 'Fingernail Bed',
    available: !!input.fingernailUrl,
    confidence: nail.conf,
    contribution: WEIGHTS.fingernail,
    predictedHb: input.fingernailUrl ? nail.hb : null,
  })
  if (input.fingernailUrl) { weightedSum += nail.hb * WEIGHTS.fingernail; weightTotal += WEIGHTS.fingernail }

  const palm = modalityBase('palm', seed)
  modalities.push({
    modality: 'palm',
    label: 'Palm',
    available: !!input.palmUrl,
    confidence: palm.conf,
    contribution: WEIGHTS.palm,
    predictedHb: input.palmUrl ? palm.hb : null,
  })
  if (input.palmUrl) { weightedSum += palm.hb * WEIGHTS.palm; weightTotal += WEIGHTS.palm }

  const clinicalHb = input.hemoglobin ?? null
  const clinicalConf = input.hemoglobin != null ? 0.95 : 0.5
  modalities.push({
    modality: 'clinical',
    label: 'Clinical Data',
    available: input.hemoglobin != null || input.age != null,
    confidence: clinicalConf,
    contribution: WEIGHTS.clinical,
    predictedHb: clinicalHb,
  })
  if (clinicalHb != null) { weightedSum += clinicalHb * WEIGHTS.clinical; weightTotal += WEIGHTS.clinical }

  // Fallback if no image modality and no clinical Hb: use a neutral prior
  if (weightTotal === 0) {
    weightedSum = 11.0 * 0.5
    weightTotal = 0.5
  }

  const imageHb = weightedSum / weightTotal
  const geoW = geoRiskWeight(input.state)
  // Geo-risk nudges the estimate slightly downward for high-prevalence regions
  const geoAdjust = (geoW - 0.5) * -0.6
  const predictedHb = Math.round((imageHb + geoAdjust) * 10) / 10

  const { severity } = severityFromHb(predictedHb, input.sex)
  const confidence = Math.round(
    (modalities.reduce((s, m) => s + (m.available ? m.confidence * m.contribution : 0), 0) /
      Math.max(0.01, modalities.filter(m => m.available).reduce((s, m) => s + m.contribution, 0))) * 100,
  ) / 100

  return {
    predictedHb,
    severity,
    confidence: Math.min(0.99, Math.max(0.5, confidence)),
    geoRiskWeight: Math.round(geoW * 100) / 100,
    modalityResults: modalities,
  }
}
