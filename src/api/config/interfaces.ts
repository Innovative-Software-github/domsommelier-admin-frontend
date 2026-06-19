export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParamValue = string | number | boolean | undefined | null;

export interface CustomFetchOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  withAuth?: boolean;
  params?: Record<string, QueryParamValue>;
}

export interface ApiErrorBody {
  message?: string;
}
