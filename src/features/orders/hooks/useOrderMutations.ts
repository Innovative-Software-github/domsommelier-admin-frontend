import { useCallback, useState } from 'react';
import { cancelOrder, updateOrderStatus } from '../../../api/orders/requests';
import type { AdminOrderDetail } from '../../../api/orders/interfaces';

export function useOrderMutations() {
  const [saving, setSaving] = useState(false);

  const updateStatus = useCallback(async (orderId: string, status: string): Promise<AdminOrderDetail> => {
    setSaving(true);
    try {
      return await updateOrderStatus(orderId, status);
    } finally {
      setSaving(false);
    }
  }, []);

  const cancel = useCallback(async (orderId: string): Promise<void> => {
    setSaving(true);
    try {
      await cancelOrder(orderId);
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, updateStatus, cancel };
}
