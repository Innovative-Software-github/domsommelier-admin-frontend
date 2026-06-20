import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DatePicker, Form, Input, Select, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { ApiHttpError } from '../../../api/config/errors';
import { DataTable } from '../../../components/DataTable';
import { PageHeader } from '../../../components/PageHeader';
import { getOrderStatuses } from '../../../api/orders/requests';
import type { AdminOrderListItem, OrderStatusOption } from '../../../api/orders/interfaces';
import { getWineStores } from '../../../api/wineStores/requests';
import type { WineStore } from '../../../api/wineStores/interfaces';
import { useOrders } from '../hooks/useOrders';
import { getStatusColor, getStatusLabel } from '../orderStatus';
import { formatDateTime, formatMoney, shortId } from '../../../shared/format';

export function OrdersListPage() {
  const navigate = useNavigate();
  const { params, page, loading, error, updateParams, resetFilters, setPageNumber } = useOrders();
  const [statuses, setStatuses] = useState<OrderStatusOption[]>([]);
  const [wineStores, setWineStores] = useState<WineStore[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFilters() {
      setFiltersLoading(true);
      setFiltersError(null);
      try {
        const [statusList, storesPage] = await Promise.all([
          getOrderStatuses(),
          getWineStores({ page: 0, size: 100 }),
        ]);
        if (!cancelled) {
          setStatuses(statusList);
          setWineStores(storesPage.content);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof ApiHttpError && err.status === 403
            ? 'Нет доступа к справочнику статусов. Проверьте роль администратора.'
            : err instanceof Error
              ? err.message
              : 'Не удалось загрузить фильтры';
          setFiltersError(message);
        }
      } finally {
        if (!cancelled) {
          setFiltersLoading(false);
        }
      }
    }

    void loadFilters();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns: ColumnsType<AdminOrderListItem> = [
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
      title: 'Клиент',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: 'Телефон',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      render: (value: string | null) => value ?? '—',
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

  const dateRange =
    params.dateFrom && params.dateTo
      ? [dayjs(params.dateFrom), dayjs(params.dateTo)]
      : null;

  return (
    <>
      <PageHeader
        title="Заказы"
        subtitle="Список всех заказов магазина с фильтрами и сменой статуса."
      />

      <Form layout="inline" style={{ marginBottom: 16 }} disabled={filtersLoading}>
        <Space wrap>
          <Select
            allowClear
            placeholder="Статус"
            style={{ minWidth: 160 }}
            value={params.status}
            options={statuses.map((s) => ({ value: s.name, label: s.label }))}
            onChange={(value) => updateParams({ status: value })}
          />
          <Select
            allowClear
            placeholder="Винотека"
            style={{ minWidth: 200 }}
            value={params.wineStoreId}
            options={wineStores.map((s) => ({ value: s.id, label: s.name }))}
            onChange={(value) => updateParams({ wineStoreId: value })}
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
            placeholder="Поиск"
            style={{ width: 220 }}
            defaultValue={params.query}
            onSearch={(value) => updateParams({ query: value || undefined })}
          />
          <Button onClick={resetFilters}>Сбросить</Button>
        </Space>
      </Form>

      {filtersError && <div style={{ color: '#cf1322', marginBottom: 16 }}>{filtersError}</div>}
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
          onClick: () => navigate(`/orders/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </>
  );
}
