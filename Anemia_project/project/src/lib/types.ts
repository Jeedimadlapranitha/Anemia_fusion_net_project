export type Severity = 'Normal' | 'Mild' | 'Moderate' | 'Severe'

export type Modality = 'conjunctiva' | 'fingernail' | 'palm' | 'clinical'

export interface PredictionInput {
  conjunctivaUrl?: string | null
  fingernailUrl?: string | null
  palmUrl?: string | null
  hemoglobin: number | null
  age: number | null
  sex: 'male' | 'female' | null
  state: string
}

export interface ModalityResult {
  modality: Modality
  label: string
  available: boolean
  confidence: number
  contribution: number
  predictedHb: number | null
}

export interface PredictionResult {
  id?: string
  predictedHb: number
  severity: Severity
  confidence: number
  geoRiskWeight: number
  modalityResults: ModalityResult[]
  createdAt?: string
}

export interface PredictionRecord {
  id: string
  predicted_hb: number
  severity: string
  confidence: number
  geo_risk_weight: number
  age: number | null
  sex: string | null
  state: string
  modality_flags: Record<string, boolean>
  created_at: string
}
