import { useCallback, useState } from 'react';
import { ApiHttpError } from '../../../api/config/errors';
import {
  createEvent,
  deleteEvent,
  updateEvent,
} from '../../../api/events/requests';
import type { EventRequestBody, EventWriteResponse } from '../../../api/events/interfaces';

function resolveMutationError(err: unknown, fallback: string): string {
  if (err instanceof ApiHttpError) {
    if (err.status === 403) {
      return 'Нет прав на изменение мероприятий. Проверьте роль администратора.';
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export function useEventMutations() {
  const [saving, setSaving] = useState(false);

  const create = useCallback(async (body: EventRequestBody): Promise<EventWriteResponse> => {
    setSaving(true);
    try {
      return await createEvent(body);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось создать мероприятие'));
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(async (id: string, body: EventRequestBody): Promise<EventWriteResponse> => {
    setSaving(true);
    try {
      return await updateEvent(id, body);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось обновить мероприятие'));
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    setSaving(true);
    try {
      await deleteEvent(id);
    } catch (err) {
      throw new Error(resolveMutationError(err, 'Не удалось удалить мероприятие'));
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, create, update, remove };
}
