import { useCallback, useEffect, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import {
  deleteEventPhoto,
  getEventPhotos,
  uploadEventPhotos,
} from '../../../api/events/photos';
import type { EventPhoto } from '../../../api/events/interfaces';

export function useEventPhotos(eventId: string | undefined) {
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getEventPhotos(id);
      setPhotos(result);
    } catch (err) {
      let message = 'Не удалось загрузить фото';
      if (err instanceof ApiHttpError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setPhotos([]);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!eventId) {
      setPhotos([]);
      setLoading(false);
      setError(null);
      return;
    }

    void fetchPhotos(eventId);
  }, [eventId, fetchPhotos]);

  const upload = useCallback(async (files: File[], description: string) => {
    if (!eventId) {
      throw new Error('Сначала сохраните мероприятие');
    }

    setUploading(true);
    setError(null);

    try {
      const uploaded = await uploadEventPhotos(eventId, files, description);
      setPhotos((prev) => [...prev, ...uploaded]);
      return uploaded;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить фото';
      setError(message);
      throw new Error(message);
    } finally {
      setUploading(false);
    }
  }, [eventId]);

  const remove = useCallback(async (photoId: string) => {
    setError(null);

    try {
      await deleteEventPhoto(photoId);
      setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить фото';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const refetch = useCallback(() => {
    if (eventId) {
      void fetchPhotos(eventId);
    }
  }, [eventId, fetchPhotos]);

  return {
    photos,
    loading,
    uploading,
    error,
    upload,
    remove,
    refetch,
  };
}
