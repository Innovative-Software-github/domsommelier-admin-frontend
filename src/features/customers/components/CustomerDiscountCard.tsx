import { useState } from 'react';
import { Alert, Button, Card, Input, InputNumber, Space, Tag, Typography } from 'antd';
import { ApiHttpError } from '../../../api/config/errors';
import { updateCustomerDiscount } from '../../../api/customers/requests';
import type { AdminCustomerDetail } from '../../../api/customers/interfaces';
import { formatDateTime } from '../../../shared/format';

interface CustomerDiscountCardProps {
  customer: AdminCustomerDetail;
  onUpdated: (customer: AdminCustomerDetail) => void;
}

/**
 * Личная скидка клиента. Применяется автоматически в корзине и только к товарам
 * без акционной цены — с акцией не складывается (см. docs/DISCOUNTS_PLAN.md §4).
 */
export function CustomerDiscountCard({ customer, onUpdated }: CustomerDiscountCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [percent, setPercent] = useState<number>(customer.discountPercent ?? 0);
  const [comment, setComment] = useState<string>(customer.discountComment ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPercent = customer.discountPercent ?? 0;

  const startEdit = () => {
    setPercent(currentPercent);
    setComment(customer.discountComment ?? '');
    setError(null);
    setIsEditing(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);

    try {
      const updated = await updateCustomerDiscount(customer.id, {
        percent,
        comment: comment.trim() || undefined,
      });
      onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof ApiHttpError && err.status === 403
        ? 'Недостаточно прав для изменения скидки.'
        : err instanceof Error
          ? err.message
          : 'Не удалось сохранить скидку';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title="Персональная скидка"
      style={{ marginBottom: 24 }}
      extra={!isEditing && <Button onClick={startEdit}>Изменить</Button>}
    >
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}

      {isEditing ? (
        <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 480 }}>
          <InputNumber
            min={0}
            max={100}
            value={percent}
            onChange={(value) => setPercent(value ?? 0)}
            addonAfter="%"
            style={{ width: 160 }}
            autoFocus
          />
          <Input
            placeholder="Основание, например «постоянный клиент»"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={255}
          />
          <Typography.Text type="secondary">
            0 — снять скидку. На товары по акции скидка не начисляется.
          </Typography.Text>
          <Space>
            <Button type="primary" loading={saving} onClick={save}>
              Сохранить
            </Button>
            <Button disabled={saving} onClick={() => setIsEditing(false)}>
              Отмена
            </Button>
          </Space>
        </Space>
      ) : (
        <Space direction="vertical" size="small">
          {currentPercent > 0 ? (
            <Tag color="red" style={{ fontSize: 16, padding: '4px 12px' }}>
              −{currentPercent}%
            </Tag>
          ) : (
            <Typography.Text type="secondary">Скидки нет</Typography.Text>
          )}
          {customer.discountComment && (
            <Typography.Text>{customer.discountComment}</Typography.Text>
          )}
          {customer.discountUpdatedAt && (
            <Typography.Text type="secondary">
              Изменено: {formatDateTime(customer.discountUpdatedAt)}
            </Typography.Text>
          )}
        </Space>
      )}
    </Card>
  );
}
