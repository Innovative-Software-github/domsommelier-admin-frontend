import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DatePicker, Form, InputNumber, message, Popconfirm, Select, Space, Tag } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getWineStores } from '../../../api/wineStores/requests';
import type { WineStore } from '../../../api/wineStores/interfaces';
import type { EventListItem } from '../../../api/events/interfaces';
import { DataTable } from '../../../components/DataTable';
import { PageHeader } from '../../../components/PageHeader';
import { formatDateTime, formatMoney } from '../../../shared/format';
import { getEventTypeColor, getEventTypeLabel, EVENT_TYPE_OPTIONS } from '../eventType';
import { useEvents } from '../hooks/useEvents';
import { useEventMutations } from '../hooks/useEventMutations';

export function EventsListPage() {
  const navigate = useNavigate();
  const { params, page, loading, error, updateParams, resetFilters, setPageNumber, refetch } =
    useEvents();
  const { remove, saving } = useEventMutations();
  const [wineStores, setWineStores] = useState<WineStore[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStores() {
      setStoresLoading(true);
      try {
        const storesPage = await getWineStores({ page: 0, size: 100 });
        if (!cancelled) {
          setWineStores(storesPage.content);
        }
      } catch {
        if (!cancelled) {
          setWineStores([]);
        }
      } finally {
        if (!cancelled) {
          setStoresLoading(false);
        }
      }
    }

    void loadStores();
    return () => {
      cancelled = true;
    };
  }, []);

  const dateRange =
    params.dateStart && params.dateEnd
      ? [dayjs(params.dateStart), dayjs(params.dateEnd)]
      : null;

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      message.success('Мероприятие удалено');
      refetch();
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Не удалось удалить мероприятие';
      message.error(text);
    }
  };

  const columns: ColumnsType<EventListItem> = [
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type: EventListItem['type']) => (
        <Tag color={getEventTypeColor(type)}>{getEventTypeLabel(type)}</Tag>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'dateTime',
      key: 'dateTime',
      render: (value: string) => formatDateTime(value),
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (value: number) => formatMoney(value),
    },
    {
      title: 'Винотека',
      dataIndex: 'wineStoreName',
      key: 'wineStoreName',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space onClick={(event) => event.stopPropagation()}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/events/${record.id}`)}
          >
            Изменить
          </Button>
          <Popconfirm
            title="Удалить мероприятие?"
            description="Операция необратима. Все фото также будут удалены."
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true, loading: saving }}
            onConfirm={() => void handleDelete(record.id)}
          >
            <Button type="link" danger>
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Мероприятия"
        subtitle="Дегустации и винные казино."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/events/new')}>
            Создать мероприятие
          </Button>
        }
      />

      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            allowClear
            placeholder="Тип"
            style={{ minWidth: 180 }}
            value={params.type}
            options={EVENT_TYPE_OPTIONS}
            onChange={(value) => updateParams({ type: value })}
          />
          <Select
            allowClear
            showSearch
            placeholder="Винотека"
            style={{ minWidth: 220 }}
            loading={storesLoading}
            value={params.wineStoreId}
            optionFilterProp="label"
            options={wineStores.map((store) => ({
              value: store.id,
              label: store.name,
            }))}
            onChange={(value) => updateParams({ wineStoreId: value })}
          />
          <DatePicker.RangePicker
            showTime
            value={dateRange as [dayjs.Dayjs, dayjs.Dayjs] | null}
            onChange={(dates) => {
              updateParams({
                dateStart: dates?.[0]?.toISOString(),
                dateEnd: dates?.[1]?.toISOString(),
              });
            }}
          />
          <InputNumber
            placeholder="Цена от"
            min={0}
            value={params.priceMin}
            onChange={(value) => updateParams({ priceMin: value ?? undefined })}
          />
          <InputNumber
            placeholder="Цена до"
            min={0}
            value={params.priceMax}
            onChange={(value) => updateParams({ priceMax: value ?? undefined })}
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
          onClick: () => navigate(`/events/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </>
  );
}
