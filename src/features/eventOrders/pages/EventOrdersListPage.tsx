import { useNavigate } from 'react-router-dom';
import { Button, DatePicker, Form, Input, Select, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { DataTable } from '../../../components/DataTable';
import { PageHeader } from '../../../components/PageHeader';
import type { AdminEventOrderListItem } from '../../../api/eventOrders/interfaces';
import { useEventOrders } from '../hooks/useEventOrders';
import { getStatusColor, getStatusLabel, STATUS_OPTIONS } from '../eventOrderStatus';
import { formatDateTime, shortId } from '../../../shared/format';

export function EventOrdersListPage() {
  const navigate = useNavigate();
  const { params, page, loading, error, updateParams, resetFilters, setPageNumber } =
    useEventOrders();

  const columns: ColumnsType<AdminEventOrderListItem> = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => shortId(id),
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => formatDateTime(value),
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      render: (value: string | null) => value ?? '—',
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

  const dateRange =
    params.dateFrom && params.dateTo
      ? [dayjs(params.dateFrom), dayjs(params.dateTo)]
      : null;

  return (
    <>
      <PageHeader
        title="Заявки на мероприятия"
        subtitle="Заявки на проведение частных мероприятий, оставленные на сайте."
      />

      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            allowClear
            placeholder="Статус"
            style={{ minWidth: 160 }}
            value={params.status}
            options={STATUS_OPTIONS}
            onChange={(value) => updateParams({ status: value })}
          />
          <DatePicker.RangePicker
            value={dateRange as [dayjs.Dayjs, dayjs.Dayjs] | null}
            onChange={(dates) => {
              updateParams({
                dateFrom: dates?.[0]?.format('YYYY-MM-DD'),
                dateTo: dates?.[1]?.format('YYYY-MM-DD'),
              });
            }}
          />
          <Input.Search
            allowClear
            placeholder="Имя или телефон"
            style={{ width: 220 }}
            defaultValue={params.query}
            onSearch={(value) => updateParams({ query: value || undefined })}
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
          onClick: () => navigate(`/event-orders/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </>
  );
}
