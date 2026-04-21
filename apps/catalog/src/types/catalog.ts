export type CategoryId =
  | 'mechanics'
  | 'waves'
  | 'optics'
  | 'thermodynamics'
  | 'electromagnetism'
  | 'fluids'
  | 'modern';

export type TimeModelId =
  | 'linear'
  | 'periodic'
  | 'orbit'
  | 'continuous'
  | 'steady_state'
  | 'static'
  | 'quasistatic'
  | 'statistical'
  | 'discrete';

export interface Parameter {
  id: string;
  label: string;
  unit: string;
}

export interface Stage {
  id: string;
  label: string;
  desc?: string;
}

export interface Environment {
  id: string;
  label: string;
  desc?: string;
}

export interface EmbedEstimate {
  min: number;
  max: number;
}

export interface Bundle {
  id: string;
  label: string;
  category: CategoryId;
  operation: string;
  timeModel: TimeModelId;
  parameters: Parameter[];
  stages: Stage[];
  environments: Environment[];
  phenomena: string[];
  embedEstimate: EmbedEstimate;
  notes?: string;
}

export interface CategorySummary {
  bundles: number;
  embeds: EmbedEstimate;
}

export interface CatalogSummary {
  totalBundles: number;
  totalEmbedEstimate: EmbedEstimate;
  byCategory: Record<CategoryId, CategorySummary>;
}

export interface Catalog {
  version: string;
  name: string;
  description: string;
  categories: Record<CategoryId, string>;
  timeModels: Record<TimeModelId, string>;
  bundles: Bundle[];
  summary: CatalogSummary;
  openQuestions?: string[];
}

export const CATEGORY_ORDER: CategoryId[] = [
  'mechanics',
  'waves',
  'optics',
  'thermodynamics',
  'electromagnetism',
  'fluids',
  'modern',
];
