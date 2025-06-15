export interface Product {
  id: string;
  name: string;
  description?: string;
}

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  description?: string;
}

export interface Score {
  productId: string;
  criterionId: string;
  value: number;
}

export interface ProductScore {
  product: Product;
  totalScore: number;
  weightedScore: number;
  criteriaScores: {
    criterion: Criterion;
    score: number;
    weightedScore: number;
  }[];
}
