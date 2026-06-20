import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Select, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DataTable } from '../../../components/DataTable';
import { PageHeader } from '../../../components/PageHeader';
import type { AdminCustomerListItem } from '../../../api/customers/interfaces';
import type { UserRole } from '../../../auth/roles';
import { shortId } from '../../../shared/format';
import { getRoleColor, getRoleLabel, ROLE_FILTER_OPTIONS } from '../customerRole';
import { useCustomers } from '../hooks/useCustomers';

export function CustomersListPage() {
  const navigate = useNavigate();
  const { params, page, loading, error, updateParams, resetFilters, setPageNumber } = useCustomers();

  const columns: ColumnsType<AdminCustomerListItem> = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => shortId(id),
    },
    {
      title: 'ФИО',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: 'Винотека',
      dataIndex: 'defaultWineStoreName',
      key: 'defaultWineStoreName',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)}>{getRoleLabel(role)}</Tag>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Клиенты"
        subtitle="Просмотр клиентов и их заказов (read-only)."
      />

      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Поиск по email, телефону, ФИО"
            style={{ width: 280 }}
            defaultValue={params.query}
            onSearch={(value) => updateParams({ query: value || undefined })}
          />
          <Select
            allowClear
            placeholder="Роль"
            style={{ minWidth: 180 }}
            value={params.role}
            options={ROLE_FILTER_OPTIONS}
            onChange={(value) => updateParams({ role: value as UserRole | undefined })}
          />
          <Button onClick={resetFilters}>Сбросить</Button>
        </Space>
      </Form>

      {error && <div style={{ color: '#cf1322', marginBottom: 16 }}>{error}</div>}

      <DataTable
        rowKey="id"
        columns={columns}
        dataSource={page?.content}
        loading={loading}
        total={page?.totalElements}
        page={page?.number ?? params.page ?? 0}
        pageSize={page?.size ?? params.size ?? 10}
        onPageChange={setPageNumber}
        onRow={(record) => ({
          onClick: () => navigate(`/customers/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </>
  );
}
