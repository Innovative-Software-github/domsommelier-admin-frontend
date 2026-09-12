import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Input, InputNumber, Select, Space, Tag, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { DataTable } from '../../../components/DataTable';
import { PageHeader } from '../../../components/PageHeader';
import { formatMoney } from '../../../shared/format';
import type { StoreStockItem } from '../../../api/wineStores/interfaces';
import { useWineStore } from '../hooks/useWineStore';
import { useStoreStock } from '../hooks/useStoreStock';
import { isStockQuantity, saveStockChanges, type StockDraft } from '../stockDrafts';
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
  const { id } = useParams();
  return <StockPage key={id} />;
}

function StockPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const storeId = id !== undefined && Number.isFinite(Number(id)) ? Number(id) : null;

  const { wineStore } = useWineStore(id);
  const { params, page, loading, error, setSearch, setCategory, setPageNumber, patchQuantity } =
    useStoreStock(storeId);
  const { savingId, setStock } = useStoreStockMutations();

  // Drafts belong to the store, not the current search/category/page.
  const [drafts, setDrafts] = useState<Record<string, StockDraft>>({});
  const [saving, setSaving] = useState(false);
  const [failures, setFailures] = useState<string[]>([]);
  const saveLock = useRef(false);
  const entries = Object.entries(drafts);
  const invalid = entries.some(([, draft]) => !isStockQuantity(draft.quantity));

  const handleSave = async (productId?: string) => {
    if (storeId === null || loading || saveLock.current) return;
    const selected = productId ? entries.filter(([key]) => key === productId) : entries;
    if (!selected.length || selected.some(([, draft]) => !isStockQuantity(draft.quantity))) return;
    saveLock.current = true;
    setSaving(true); setFailures([]);
    try {
      const result = await saveStockChanges(selected,
        async (key, quantity) => (await setStock(storeId, key, quantity)).quantity,
        (key, quantity) => {
          patchQuantity(key, quantity);
          setDrafts(prev => { const next = { ...prev }; delete next[key]; return next; });
        });
      if (result.saved) message.success(`Сохранено товаров: ${result.saved}`);
      setFailures(result.failed.map(item => `${item.name}: ${item.error}`));
    } finally {
      saveLock.current = false; setSaving(false);
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
        const draft = drafts[item.productId]?.quantity;
        const value = draft === undefined ? item.quantity : draft;
        return (
          <InputNumber
            min={0}
            max={2147483647}
            disabled={saving || loading}
            status={draft !== undefined && !isStockQuantity(draft) ? 'error' : undefined}
            precision={0}
            value={value}
            style={{ width: 120 }}
            onChange={(next) =>
              setDrafts(prev => {
                const updated = { ...prev };
                if (next === item.quantity) delete updated[item.productId];
                else updated[item.productId] = { quantity: next as number | null, name: item.name };
                return updated;
              })
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
        const draft = drafts[item.productId]?.quantity;
        const dirty = draft !== undefined && isStockQuantity(draft);
        return (
          <Button
            type="link"
            icon={<SaveOutlined />}
            disabled={!dirty || saving || loading}
            loading={savingId === item.productId}
            onClick={() => handleSave(item.productId)}
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

      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          aria-label="Категория товара"
          placeholder="Все категории"
          allowClear
          value={params.category}
          options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
          style={{ width: 220 }}
          disabled={saving}
          onChange={setCategory}
        />
        <Input.Search
          allowClear
          disabled={saving}
          placeholder="Поиск по названию или артикулу"
          style={{ width: 320, maxWidth: '100%' }}
          defaultValue={params.search}
          onSearch={(value) => setSearch(value)}
        />
        <Button type="primary" icon={<SaveOutlined />} loading={saving}
          disabled={!entries.length || invalid || loading || storeId === null} onClick={() => handleSave()}>
          Сохранить всё{entries.length ? ` (${entries.length})` : ''}
        </Button>
      </Space>
      {entries.length > 0 && <Alert style={{ marginBottom: 16 }} type={invalid ? 'warning' : 'info'}
        message={invalid ? 'Заполните все изменённые остатки целыми числами от 0 до 2147483647.' : `Несохранённых изменений: ${entries.length}. Будут сохранены также правки на других страницах и в других категориях.`} />}
      {failures.length > 0 && <Alert type="error" style={{ marginBottom: 16 }}
        message="Часть изменений не сохранена. Они оставлены для повторной отправки."
        description={<ul>{failures.map((text, index) => <li key={index}>{text}</li>)}</ul>} />}


      {error && <div style={{ color: '#cf1322', marginBottom: 16 }}>{error}</div>}

      <DataTable
        rowKey="productId"
        columns={columns}
        dataSource={page?.content}
        loading={loading}
        total={page?.totalElements}
        page={page?.number ?? params.page ?? 0}
        pageSize={page?.size ?? params.size ?? 20}
        onPageChange={(page, size) => { if (!saveLock.current) setPageNumber(page, size); }}
      />
    </>
  );
}
