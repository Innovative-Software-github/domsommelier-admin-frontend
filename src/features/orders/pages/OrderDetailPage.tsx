import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '../../../components/PageHeader';
import { getOrderStatuses } from '../../../api/orders/requests';
import type { OrderedProductItem, OrderStatusOption } from '../../../api/orders/interfaces';
import { useOrder } from '../hooks/useOrder';
import { useOrderMutations } from '../hooks/useOrderMutations';
import { getStatusColor, getStatusLabel, isTerminalStatus } from '../orderStatus';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('ru-RU');
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('ru-RU');
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, loading, error, refetch } = useOrder(id);
  const { saving, updateStatus, cancel } = useOrderMutations();
  const [statuses, setStatuses] = useState<OrderStatusOption[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  useEffect(() => {
    void getOrderStatuses().then(setStatuses).catch(() => {
      message.error('Не удалось загрузить статусы');
    });
  }, []);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.statusName);
    }
  }, [order]);

  const handleSaveStatus = async () => {
    if (!id || !selectedStatus || selectedStatus === order?.statusName) {
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

  const handleCancel = async () => {
    if (!id) {
      return;
    }

    try {
      await cancel(id);
      message.success('Заказ отменён');
      refetch();
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Не удалось отменить заказ';
      message.error(text);
    }
  };

  const itemColumns: ColumnsType<OrderedProductItem> = [
    { title: 'Артикул', dataIndex: 'article', key: 'article' },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Кол-во', dataIndex: 'quantity', key: 'quantity', width: 90 },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (value: number) => formatMoney(value),
    },
    {
      title: 'Сумма',
      dataIndex: 'sum',
      key: 'sum',
      align: 'right',
      render: (value: number) => formatMoney(value),
    },
  ];

  if (loading) {
    return <Spin style={{ display: 'block', margin: '48px auto' }} />;
  }

  if (error || !order) {
    return (
      <>
        <PageHeader
          title="Заказ"
          breadcrumbs={[{ title: <a onClick={() => navigate('/orders')}>Заказы</a> }]}
        />
        <Card>{error ?? 'Заказ не найден'}</Card>
      </>
    );
  }

  const terminal = isTerminalStatus(order.statusName);

  return (
    <>
      <PageHeader
        title={`Заказ ${order.id.slice(0, 8)}`}
        subtitle="Детали заказа, позиции, клиент и смена статуса."
        breadcrumbs={[
          { title: <a onClick={() => navigate('/orders')}>Заказы</a> },
          { title: order.id.slice(0, 8) },
        ]}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Информация о заказе">
          <Descriptions column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Статус">
              <Tag color={getStatusColor(order.statusName)}>
                {getStatusLabel(order.statusName)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Дата создания">
              {formatDateTime(order.date)}
            </Descriptions.Item>
            <Descriptions.Item label="Клиент">
              {order.customerName ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Телефон">
              {order.customerPhone ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {order.customerEmail ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Адрес самовывоза">
              {order.pickupAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Дата самовывоза">
              {order.pickupDate ? formatDate(order.pickupDate) : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Оплата">
              {order.paymentMethod ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Промокод">
              {order.promoDiscount != null ? `−${order.promoDiscount}%` : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Сумма">
              <strong>{formatMoney(order.totalAmount)}</strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Позиции">
          <Table
            rowKey="productId"
            columns={itemColumns}
            dataSource={order.items}
            pagination={false}
            size="small"
          />
        </Card>

        <Card title="Управление статусом">
          <Space wrap>
            <Select
              style={{ minWidth: 200 }}
              value={selectedStatus}
              disabled={terminal}
              options={statuses.map((s) => ({ value: s.name, label: s.label }))}
              onChange={setSelectedStatus}
            />
            <Button
              type="primary"
              loading={saving}
              disabled={terminal || selectedStatus === order.statusName}
              onClick={() => void handleSaveStatus()}
            >
              Сохранить
            </Button>
            <Popconfirm
              title="Отменить заказ?"
              description="Заказ перейдёт в статус «Отменён»."
              okText="Отменить заказ"
              cancelText="Назад"
              disabled={terminal}
              onConfirm={() => void handleCancel()}
            >
              <Button danger loading={saving} disabled={terminal}>
                Отменить заказ
              </Button>
            </Popconfirm>
          </Space>
        </Card>
      </Space>
    </>
  );
}
