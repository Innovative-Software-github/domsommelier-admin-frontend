import { customFetch } from '../config/customFetch';
import type { QueryParamValue } from '../config/interfaces';
import type {
  EventDetails,
  EventRequestBody,
  EventsPage,
  EventsQueryParams,
  EventWriteResponse,
} from './interfaces';

export function getEvents(params: EventsQueryParams = {}): Promise<EventsPage> {
  return customFetch<EventsPage>('/api/v1/events/filter', {
    withAuth: true,
    params: params as Record<string, QueryParamValue>,
  });
}

export function getEventById(id: string): Promise<EventDetails> {
  return customFetch<EventDetails>(`/api/v1/events/${id}`, {
    withAuth: true,
  });
}

export function createEvent(body: EventRequestBody): Promise<EventWriteResponse> {
  return customFetch<EventWriteResponse>('/api/v1/events', {
    method: 'POST',
    body,
    withAuth: true,
  });
}

export function updateEvent(id: string, body: EventRequestBody): Promise<EventWriteResponse> {
  return customFetch<EventWriteResponse>(`/api/v1/events/${id}`, {
    method: 'PUT',
    body,
    withAuth: true,
  });
}

export function deleteEvent(id: string): Promise<void> {
  return customFetch<void>(`/api/v1/events/${id}`, {
    method: 'DELETE',
    withAuth: true,
  });
}
