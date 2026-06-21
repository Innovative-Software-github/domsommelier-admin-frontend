import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, InputNumber, Space, Tag, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { DataTable } from '../../../components/DataTable';
import { PageHeader } from '../../../components/PageHeader';
import { formatMoney } from '../../../shared/format';
import type { StoreStockItem } from '../../../api/wineStores/interfaces';
import { useWineStore } from '../hooks/useWineStore';
import { useStoreStock } from '../hooks/useStoreStock';
import { useStoreStockMutations } from '../hooks/useStoreStockMutations';

const CATEGORY_LABELS: Record<string, string> = {
  wine: 'Вино',
  spirit: 'Крепкий',
  champagne_and_sparkling: 'Игристое',
  low_alcohol: 'Слабоалкогольное',
  snack: 'Снеки',
  accessories: 'Аксессуары',
};

export function WineStoreStockPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const storeId = id !== undefined && Number.isFinite(Number(id)) ? Number(id) : null;

  const { wineStore } = useWineStore(id);
  const { params, page, loading, error, setSearch, setPageNumber, patchQuantity } =
    useStoreStock(storeId);
  const { savingId, setStock } = useStoreStockMutations();

  // Черновики правок количества: productId -> введённое значение.
  const [drafts, setDrafts] = useState<Record<string, number | null>>({});

  // Сбрасываем черновики при смене страницы/поиска (но не при точечном patch).
  useEffect(() => {
    setDrafts({});
  }, [params]);

  const handleSave = async (item: StoreStockItem) => {
    if (storeId === null) {
      return;
    }
    const draft = drafts[item.productId];
    if (draft === null || draft === undefined || draft === item.quantity) {
      return;
    }

    try {
      await setStock(storeId, item.productId, draft);
      patchQuantity(item.productId, draft);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[item.productId];
        return next;
      });
      message.success('Остаток сохранён');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Не удалось сохранить остаток');
    }
  };

  const columns: ColumnsType<StoreStockItem> = [
    {
      title: 'Артикул',
      dataIndex: 'article',
      key: 'article',
      width: 140,
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      render: (category: string) => <Tag>{CATEGORY_LABELS[category] ?? category}</Tag>,
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      render: (price: number) => formatMoney(price),
    },
    {
      title: 'Остаток',
      key: 'quantity',
      width: 160,
      render: (_, item) => {
        const draft = drafts[item.productId];
        const value = draft === undefined ? item.quantity : draft;
        return (
          <InputNumber
            min={0}
            precision={0}
            value={value}
            style={{ width: 120 }}
            onChange={(next) =>
              setDrafts((prev) => ({ ...prev, [item.productId]: next as number | null }))
            }
          />
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 140,
      render: (_, item) => {
        const draft = drafts[item.productId];
        const dirty = draft !== undefined && draft !== null && draft !== item.quantity;
        return (
          <Button
            type="link"
            icon={<SaveOutlined />}
            disabled={!dirty}
            loading={savingId === item.productId}
            onClick={() => handleSave(item)}
          >
            Сохранить
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Склад винотеки"
        subtitle={
          wineStore
            ? `${wineStore.name} — остатки товаров в этой точке`
            : 'Остатки товаров в этой точке'
        }
        breadcrumbs={[
          { title: <a onClick={() => navigate('/wine-stores')}>Винотеки</a> },
          { title: wineStore?.name ?? id },
          { title: 'Склад' },
        ]}
      />

      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          allowClear
          placeholder="Поиск по названию или артикулу"
          style={{ width: 320 }}
          defaultValue={params.search}
          onSearch={(value) => setSearch(value)}
        />
      </Space>

      {error && <div style={{ color: '#cf1322', marginBottom: 16 }}>{error}</div>}

      <DataTable
        rowKey="productId"
        columns={columns}
        dataSource={page?.content}
        loading={loading}
        total={page?.totalElements}
        page={page?.number ?? params.page ?? 0}
        pageSize={page?.size ?? params.size ?? 20}
        onPageChange={setPageNumber}
      />
    </>
  );
}
