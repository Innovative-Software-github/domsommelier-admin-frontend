/** Optional attributes shared by the read DTO and category-specific write extensions. */
export interface CatalogReference { code: string; label: string }
export interface Packaging { giftBox: boolean | null; type: CatalogReference | null }
export interface GrapeShare { grape: CatalogReference; percent: number | null }
export interface SourceRating { value: number; scaleMin: number | null; scaleMax: number | null; sourceId: string }
export interface SensoryProfile { sweetness?: SourceRating | null; acidity?: SourceRating | null; aromaticIntensity?: SourceRating | null; body?: SourceRating | null; tannins?: SourceRating | null }
export interface DurationRange { min: number | null; max: number | null; minInclusive: boolean; maxInclusive: boolean }
export interface Aging { status: 'aged' | 'not_aged' | 'unknown'; vessels: CatalogReference[] | null; durationMonths: DurationRange | null; description: string | null }
export interface TemperatureRange { min: number; max: number }
export interface CellaringPotential { minYears: number; maxYears: number; reference: 'vintage' | 'bottling' | 'purchase' | 'unspecified' }
export interface BeverageAttributes {
  region?: CatalogReference | null;
  appellation?: CatalogReference | null;
  aromaTags?: CatalogReference[] | null;
  flavorTags?: CatalogReference[] | null;
  foodPairingTags?: CatalogReference[] | null;
  aging?: Aging | null;
  productionMethod?: string | null;
  servingTemperature?: TemperatureRange | null;
}
export interface WineAttributes extends BeverageAttributes {
  strength?: number | null;
  grapeComposition?: GrapeShare[] | null;
  grapeCompositionComplete?: boolean | null;
  sensoryProfile?: SensoryProfile | null;
  styleTags?: CatalogReference[] | null;
  cellaringPotential?: CellaringPotential | null;
  aerationRecommendation?: 'recommended' | 'not_recommended' | 'optional' | null;
}
export interface SparklingAttributes extends WineAttributes {
  productionYear?: number | null;
  vintageStatus?: 'vintage' | 'non_vintage' | 'unknown' | null;
  sparklingMethod?: CatalogReference | null;
}
export interface AgingStage { order: number; purpose: 'primary' | 'finish' | 'unspecified'; vessel: CatalogReference | null; wood: CatalogReference | null; previousContents: CatalogReference | null; durationMonths: DurationRange | null }
export interface WhiskySpecific { whiskyType: CatalogReference | null; blendStyle: CatalogReference | null; componentCount: number | null; ageStatementYears: number | null; ageStatementStatus: 'stated' | 'nas' | 'unknown' }
export interface CognacSpecific { ageClassification: CatalogReference | null; ageStatementYears: number | null; grapeComposition: GrapeShare[] | null; grapeCompositionComplete: boolean | null; originArea: CatalogReference | null }
export interface SpiritAttributes extends BeverageAttributes {
  agingStages?: AgingStage[] | null;
  servingTags?: CatalogReference[] | null;
  sensoryRatings?: { dimension: CatalogReference; rating: SourceRating }[] | null;
  whiskyDetails?: WhiskySpecific | null;
  cognacDetails?: CognacSpecific | null;
}
export type ExtendedProductAttributes = WineAttributes | SparklingAttributes | SpiritAttributes;
