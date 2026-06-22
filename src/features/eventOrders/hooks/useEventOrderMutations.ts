import { useCallback, useState } from 'react';
import { updateEventOrderStatus } from '../../../api/eventOrders/requests';
import type { AdminEventOrderDetail } from '../../../api/eventOrders/interfaces';

export function useEventOrderMutations() {
  const [saving, setSaving] = useState(false);

  const updateStatus = useCallback(
    async (id: string, status: string): Promise<AdminEventOrderDetail> => {
      setSaving(true);
      try {
        return await updateEventOrderStatus(id, status);
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { saving, updateStatus };
}
