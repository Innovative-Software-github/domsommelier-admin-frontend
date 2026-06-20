import { useNavigate, useParams } from 'react-router-dom';
import { Card, Descriptions, Spin, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DataTable } from '../../../components/DataTable';
import { PageHeader } from '../../../components/PageHeader';
import type { AdminCustomerOrder } from '../../../api/customers/interfaces';
import { formatDateTime, formatMoney, shortId } from '../../../shared/format';
import { getStatusColor, getStatusLabel } from '../../orders/orderStatus';
import { getRoleColor, getRoleLabel } from '../customerRole';
import { useCustomer } from '../hooks/useCustomer';
import { useCustomerOrders } from '../hooks/useCustomerOrders';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, loading, error } = useCustomer(id);
  const { page, loading: ordersLoading, error: ordersError, setPageNumber } = useCustomerOrders(id);

  const orderColumns: ColumnsType<AdminCustomerOrder> = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (orderId: string) => shortId(orderId),
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => formatDateTime(value),
    },
    {
      title: 'Винотека',
      dataIndex: 'wineStoreName',
      key: 'wineStoreName',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: 'Сумма',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (value: number) => formatMoney(value),
    },
    {
      title: 'Статус',
      dataIndex: 'statusName',
      key: 'statusName',
      render: (statusName: string) => (
        <Tag color={getStatusColor(statusName)}>{getStatusLabel(statusName)}</Tag>
      ),
    },
  ];

  if (loading) {
    return <Spin style={{ display: 'block', margin: '48px auto' }} />;
  }

  if (error || !customer) {
    return (
      <>
        <PageHeader
          title="Клиент"
          breadcrumbs={[{ title: <a onClick={() => navigate('/customers')}>Клиенты</a> }]}
        />
        <Card>{error ?? 'Клиент не найден'}</Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={customer.displayName}
        subtitle={customer.email}
        breadcrumbs={[
          { title: <a onClick={() => navigate('/customers')}>Клиенты</a> },
          { title: customer.displayName },
        ]}
      />

      <Card title="Профиль" style={{ marginBottom: 24 }}>
        <Descriptions column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Фамилия">
            {customer.secondName ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Имя">
            {customer.firstName ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Отчество">
            {customer.middleName ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {customer.email}
          </Descriptions.Item>
          <Descriptions.Item label="Телефон">
            {customer.phone ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Роль">
            <Tag color={getRoleColor(customer.role)}>{getRoleLabel(customer.role)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Основная винотека">
            {customer.defaultWineStoreName ?? '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Заказы">
        {ordersError && (
          <div style={{ color: '#cf1322', marginBottom: 16 }}>{ordersError}</div>
        )}
        <DataTable
          rowKey="id"
          columns={orderColumns}
          dataSource={page?.content}
          loading={ordersLoading}
          total={page?.totalElements}
          page={page?.number ?? 0}
          pageSize={page?.size ?? 10}
          onPageChange={setPageNumber}
          onRow={(record) => ({
            onClick: () => navigate(`/orders/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </>
  );
}
