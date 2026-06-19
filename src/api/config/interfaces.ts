export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface CustomFetchOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  withAuth?: boolean;
}

export interface ApiErrorBody {
  message?: string;
}
