// NFHS-5 (2019-21) anemia prevalence among women aged 15-49 by state/UT.
// Source: National Family Health Survey-5, India.
// Values are percentages; higher = higher geo-risk weight.
export const NFHS5_ANEMIA: Record<string, { prevalence: number; region: string }> = {
  'Andhra Pradesh': { prevalence: 59.8, region: 'South' },
  'Arunachal Pradesh': { prevalence: 53.0, region: 'Northeast' },
  'Assam': { prevalence: 65.3, region: 'Northeast' },
  'Bihar': { prevalence: 63.5, region: 'East' },
  'Chhattisgarh': { prevalence: 60.2, region: 'Central' },
  'Delhi': { prevalence: 52.6, region: 'North' },
  'Goa': { prevalence: 48.4, region: 'West' },
  'Gujarat': { prevalence: 65.0, region: 'West' },
  'Haryana': { prevalence: 57.5, region: 'North' },
  'Himachal Pradesh': { prevalence: 53.7, region: 'North' },
  'Jharkhand': { prevalence: 65.3, region: 'East' },
  'Karnataka': { prevalence: 48.3, region: 'South' },
  'Kerala': { prevalence: 36.5, region: 'South' },
  'Madhya Pradesh': { prevalence: 54.3, region: 'Central' },
  'Maharashtra': { prevalence: 48.0, region: 'West' },
  'Manipur': { prevalence: 29.5, region: 'Northeast' },
  'Meghalaya': { prevalence: 47.2, region: 'Northeast' },
  'Mizoram': { prevalence: 22.5, region: 'Northeast' },
  'Nagaland': { prevalence: 31.3, region: 'Northeast' },
  'Odisha': { prevalence: 64.2, region: 'East' },
  'Punjab': { prevalence: 44.1, region: 'North' },
  'Rajasthan': { prevalence: 57.2, region: 'North' },
  'Sikkim': { prevalence: 22.5, region: 'Northeast' },
  'Tamil Nadu': { prevalence: 53.4, region: 'South' },
  'Telangana': { prevalence: 56.0, region: 'South' },
  'Tripura': { prevalence: 62.9, region: 'Northeast' },
  'Uttar Pradesh': { prevalence: 52.4, region: 'North' },
  'Uttarakhand': { prevalence: 51.2, region: 'North' },
  'West Bengal': { prevalence: 62.7, region: 'East' },
}

export const STATES = Object.keys(NFHS5_ANEMIA).sort()

// Convert prevalence (%) to a 0-1 geo-risk weight using a soft normalization.
// 22% → ~0.22, 66% → ~0.66, clamped.
export function geoRiskWeight(state: string): number {
  const data = NFHS5_ANEMIA[state]
  if (!data) return 0.5
  return Math.min(1, Math.max(0, data.prevalence / 100))
}

export function severityFromHb(hb: number, sex: 'male' | 'female' | null): {
  severity: 'Normal' | 'Mild' | 'Moderate' | 'Severe'
  threshold: string
} {
  // WHO thresholds. For women (non-pregnant adult): <12, 11-11.9, 8-10.9, <8.
  // For men: <13, 11-12.9, 8-10.9, <8.
  const isFemale = sex !== 'male'
  const normal = isFemale ? 12.0 : 13.0
  if (hb >= normal) return { severity: 'Normal', threshold: `≥ ${normal.toFixed(1)} g/dL` }
  if (hb >= (isFemale ? 11.0 : 11.0)) return { severity: 'Mild', threshold: `${isFemale ? '11.0–11.9' : '11.0–12.9'} g/dL` }
  if (hb >= 8.0) return { severity: 'Moderate', threshold: '8.0–10.9 g/dL' }
  return { severity: 'Severe', threshold: '< 8.0 g/dL' }
}
