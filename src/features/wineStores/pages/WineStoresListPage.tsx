import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, message, Popconfirm, Select, Space } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getWineStores } from '../../../api/wineStores/requests';
import type { WineStore } from '../../../api/wineStores/interfaces';
import { DataTable } from '../../../components/DataTable';
import { PageHeader } from '../../../components/PageHeader';
import { formatCoordinates } from '../wineStoreForm';
import { useWineStores } from '../hooks/useWineStores';
import { useWineStoreMutations } from '../hooks/useWineStoreMutations';

export function WineStoresListPage() {
  const navigate = useNavigate();
  const { params, page, loading, error, updateParams, resetFilters, setPageNumber, refetch } =
    useWineStores();
  const { remove, saving } = useWineStoreMutations();
  const [filterStores, setFilterStores] = useState<WineStore[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFilterOptions() {
      setFiltersLoading(true);
      try {
        const storesPage = await getWineStores({ page: 0, size: 100 });
        if (!cancelled) {
          setFilterStores(storesPage.content);
        }
      } catch {
        if (!cancelled) {
          setFilterStores([]);
        }
      } finally {
        if (!cancelled) {
          setFiltersLoading(false);
        }
      }
    }

    void loadFilterOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const cityOptions = useMemo(
    () => [...new Set(filterStores.map((store) => store.city))].sort().map((city) => ({
      value: city,
      label: city,
    })),
    [filterStores],
  );

  const districtOptions = useMemo(() => {
    const source = params.city
      ? filterStores.filter((store) => store.city === params.city)
      : filterStores;
    return [...new Set(source.map((store) => store.district))].sort().map((district) => ({
      value: district,
      label: district,
    }));
  }, [filterStores, params.city]);

  const handleDelete = async (id: number) => {
    try {
      await remove(id);
      message.success('Винотека удалена');
      refetch();
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Не удалось удалить винотеку';
      message.error(text);
    }
  };

  const columns: ColumnsType<WineStore> = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Город',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Район',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: 'Адрес',
      dataIndex: 'address',
      key: 'address',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: 'Часы работы',
      dataIndex: 'workingHours',
      key: 'workingHours',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: 'Координаты',
      key: 'location',
      render: (_, record) => formatCoordinates(record.location.latitude, record.location.longitude),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space onClick={(event) => event.stopPropagation()}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/wine-stores/${record.id}`)}
          >
            Изменить
          </Button>
          <Popconfirm
            title="Удалить винотеку?"
            description="Операция необратима."
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true, loading: saving }}
            onConfirm={() => handleDelete(record.id)}
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
        title="Винотеки"
        subtitle="Точки самовывоза и их гео-координаты."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/wine-stores/new')}>
            Добавить винотеку
          </Button>
        }
      />

      <Form layout="inline" style={{ marginBottom: 16 }} disabled={filtersLoading}>
        <Space wrap>
          <Select
            allowClear
            placeholder="Город"
            style={{ minWidth: 180 }}
            value={params.city}
            options={cityOptions}
            onChange={(value) => updateParams({ city: value, district: undefined })}
          />
          <Select
            allowClear
            placeholder="Район"
            style={{ minWidth: 180 }}
            value={params.district}
            options={districtOptions}
            onChange={(value) => updateParams({ district: value })}
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
          onClick: () => navigate(`/wine-stores/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </>
  );
}
