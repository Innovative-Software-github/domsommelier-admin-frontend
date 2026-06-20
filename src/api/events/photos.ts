import { customFetch } from '../config/customFetch';
import { uploadWithAuth } from '../config/uploadFetch';
import type { EventPhoto } from './interfaces';

export function getEventPhotos(eventId: string): Promise<EventPhoto[]> {
  return customFetch<EventPhoto[]>('/events/files/list', {
    withAuth: true,
    params: { eventId },
  });
}

export function uploadEventPhotos(
  eventId: string,
  files: File[],
  description: string,
): Promise<EventPhoto[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('description', description);

  return uploadWithAuth<EventPhoto[]>(
    `/events/files/upload?eventId=${encodeURIComponent(eventId)}`,
    formData,
  );
}

export function deleteEventPhoto(photoId: string): Promise<void> {
  return customFetch<void>(`/events/files/${photoId}`, {
    method: 'DELETE',
    withAuth: true,
  });
}

export function getEventPhotoUrl(photoId: string): string {
  return `/api-back/events/files/id?id=${encodeURIComponent(photoId)}`;
}
