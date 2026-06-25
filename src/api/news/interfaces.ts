import type { Page } from '../config/page';

export interface News {
  id: string;
  title: string;
  description: string | null;
  /** Готовая публичная ссылка на обложку или null, если её нет. */
  coverUrl: string | null;
  publishedAt: string;
}

export interface NewsRequestBody {
  title: string;
  description?: string;
}

export interface NewsQueryParams {
  page?: number;
  size?: number;
}

export type NewsPage = Page<News>;
