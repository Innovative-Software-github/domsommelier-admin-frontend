import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Input, Popconfirm, Segmented, Space, Tag, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { DataTable } from '../../../components/DataTable';
import { PageHeader } from '../../../components/PageHeader';
import { formatMoney } from '../../../shared/format';
import type { ProductCardItem, ProductCategory } from '../../../api/products/interfaces';
import { PRODUCT_CATEGORIES, isEditableCategory } from '../productForm';
import { useProducts } from '../hooks/useProducts';
import { useProductMutations } from '../hooks/useProductMutations';

export function CatalogListPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<ProductCategory>('wine');
  const { params, page, loading, error, setSearch, setPageNumber, refetch } = useProducts(category);
  const { saving, remove } = useProductMutations();

  const editable = isEditableCategory(category);

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      message.success('Товар удалён');
      refetch();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Не удалось удалить товар');
    }
  };

  const columns: ColumnsType<ProductCardItem> = [
    { title: 'Артикул', dataIndex: 'article', key: 'article', width: 160 },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      align: 'right',
      render: (price: number) => formatMoney(price),
    },
    {
      title: 'Скидка',
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      render: (discount: number | null) => (discount ? `${discount}%` : '—'),
    },
    {
      title: 'Страна',
      dataIndex: 'productCountry',
      key: 'productCountry',
      width: 160,
      render: (value: string | null) => value ?? '—',
    },
  ];

  if (editable) {
    columns.push({
      title: 'Действия',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space onClick={(event) => event.stopPropagation()}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/catalog/${record.id}`)}
          >
            Изменить
          </Button>
          <Popconfirm
            title="Удалить товар?"
            description="Нельзя удалить, если на товар есть заказы."
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
    });
  }

  return (
    <>
      <PageHeader
        title="Каталог"
        subtitle="Товары по категориям. Доступность на витрине определяется остатком в винотеках (Винотеки → Склад)."
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={!editable}
            onClick={() => navigate(`/catalog/new?category=${category}`)}
          >
            Добавить товар
          </Button>
        }
      />

      <Segmented<ProductCategory>
        value={category}
        onChange={setCategory}
        options={PRODUCT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
        style={{ marginBottom: 16 }}
      />

      {!editable && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Создание и редактирование этой категории появятся на следующем этапе. Список доступен только для просмотра."
        />
      )}

      <Input.Search
        allowClear
        placeholder="Поиск по названию или артикулу"
        style={{ width: 320, marginBottom: 16, display: 'block' }}
        defaultValue={params.search}
        onSearch={(value) => setSearch(value)}
      />

      {error && <div style={{ color: '#cf1322', marginBottom: 16 }}>{error}</div>}

      <DataTable
        rowKey="id"
        columns={columns}
        dataSource={page?.content}
        loading={loading}
        total={page?.totalElements}
        page={page?.number ?? params.page ?? 0}
        pageSize={page?.size ?? params.size ?? 20}
        onPageChange={setPageNumber}
        onRow={(record) => ({
          onClick: editable ? () => navigate(`/catalog/${record.id}`) : undefined,
          style: editable ? { cursor: 'pointer' } : undefined,
        })}
      />

      {!editable && (
        <Tag style={{ marginTop: 12 }}>Категория «{category}» — только просмотр</Tag>
      )}
    </>
  );
}
