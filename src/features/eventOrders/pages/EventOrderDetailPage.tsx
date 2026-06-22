import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Descriptions, Select, Space, Spin, Tag, message } from 'antd';
import { PageHeader } from '../../../components/PageHeader';
import { useEventOrder } from '../hooks/useEventOrder';
import { useEventOrderMutations } from '../hooks/useEventOrderMutations';
import { getStatusColor, getStatusLabel, STATUS_OPTIONS } from '../eventOrderStatus';
import { formatDateTime } from '../../../shared/format';

export function EventOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { eventOrder, loading, error, refetch } = useEventOrder(id);
  const { saving, updateStatus } = useEventOrderMutations();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  useEffect(() => {
    if (eventOrder) {
      setSelectedStatus(eventOrder.statusName);
    }
  }, [eventOrder]);

  const handleSaveStatus = async () => {
    if (!id || !selectedStatus || selectedStatus === eventOrder?.statusName) {
      return;
    }

    try {
      await updateStatus(id, selectedStatus);
      message.success('Статус обновлён');
      refetch();
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Не удалось обновить статус';
      message.error(text);
    }
  };

  if (loading) {
    return <Spin style={{ display: 'block', margin: '48px auto' }} />;
  }

  if (error || !eventOrder) {
    return (
      <>
        <PageHeader
          title="Заявка на мероприятие"
          breadcrumbs={[{ title: <a onClick={() => navigate('/event-orders')}>Заявки на мероприятия</a> }]}
        />
        <Card>{error ?? 'Заявка не найдена'}</Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Заявка ${eventOrder.id.slice(0, 8)}`}
        subtitle="Детали заявки на проведение мероприятия и смена статуса."
        breadcrumbs={[
          { title: <a onClick={() => navigate('/event-orders')}>Заявки на мероприятия</a> },
          { title: eventOrder.id.slice(0, 8) },
        ]}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Информация о заявке">
          <Descriptions column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Статус">
              <Tag color={getStatusColor(eventOrder.statusName)}>
                {getStatusLabel(eventOrder.statusName)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Дата создания">
              {formatDateTime(eventOrder.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Имя">{eventOrder.name}</Descriptions.Item>
            <Descriptions.Item label="Телефон">{eventOrder.phone}</Descriptions.Item>
            <Descriptions.Item label="Комментарий" span={2}>
              {eventOrder.comment ?? '—'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Управление статусом">
          <Space wrap>
            <Select
              style={{ minWidth: 200 }}
              value={selectedStatus}
              options={STATUS_OPTIONS}
              onChange={setSelectedStatus}
            />
            <Button
              type="primary"
              loading={saving}
              disabled={selectedStatus === eventOrder.statusName}
              onClick={() => void handleSaveStatus()}
            >
              Сохранить
            </Button>
          </Space>
        </Card>
      </Space>
    </>
  );
}
