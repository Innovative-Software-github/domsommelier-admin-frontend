import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  message,
} from 'antd';
import { PageHeader } from '../../../components/PageHeader';
import type { ProductCategory, ProductReference } from '../../../api/products/interfaces';
import {
  CATEGORY_LABELS,
  DEFAULT_PRODUCT_FORM_VALUES,
  FIELD_RULES,
  detailToFormValues,
  isEditableCategory,
  toWriteRequest,
  type ProductFormValues,
} from '../productForm';
import { ProductPhotoManager } from '../components/ProductPhotoManager';
import { useProduct } from '../hooks/useProduct';
import { useProductReference } from '../hooks/useProductReference';
import { useProductMutations } from '../hooks/useProductMutations';

const toOptions = (values: string[] | null | undefined) =>
  (values ?? []).map((value) => ({ value, label: value }));

function CategoryFields({
  category,
  reference,
  loading,
}: {
  category: ProductCategory;
  reference: ProductReference;
  loading: boolean;
}) {
  const subcategory = (
    <Form.Item name="subcategory" label="Подкатегория" rules={FIELD_RULES.subcategory}>
      <Select
        showSearch
        placeholder="Подкатегория"
        loading={loading}
        options={toOptions(reference.subcategories)}
        style={{ width: 260 }}
      />
    </Form.Item>
  );
  const producer = (
    <Form.Item name="producer" label="Производитель">
      <Input placeholder="Производитель" style={{ maxWidth: 320 }} />
    </Form.Item>
  );
  const volume = (
    <Form.Item name="volume" label="Объём, л" rules={FIELD_RULES.volume}>
      <InputNumber min={0} step={0.05} precision={2} style={{ width: 160 }} />
    </Form.Item>
  );
  const strength = (
    <Form.Item name="strength" label="Крепость, %" rules={FIELD_RULES.strength}>
      <InputNumber min={0} max={100} step={0.5} style={{ width: 160 }} />
    </Form.Item>
  );
  const features = (
    <Form.Item name="features" label="Особенности" tooltip="Введите значение и нажмите Enter">
      <Select mode="tags" placeholder="подарочная упаковка" tokenSeparators={[',']} />
    </Form.Item>
  );

  switch (category) {
    case 'wine':
      return (
        <>
          <Space size="large" align="start" wrap style={{ width: '100%' }}>
            <Form.Item name="productionYear" label="Год урожая" rules={FIELD_RULES.productionYear}>
              <InputNumber min={1900} max={2100} style={{ width: 160 }} />
            </Form.Item>
            {volume}
          </Space>
          <Space size="large" align="start" wrap style={{ width: '100%' }}>
            <Form.Item name="color" label="Цвет" rules={FIELD_RULES.color}>
              <Select placeholder="Цвет" loading={loading} options={toOptions(reference.colors)} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="type" label="Тип (необязательно)">
              <Select allowClear placeholder="Тип" loading={loading} options={toOptions(reference.types)} style={{ width: 200 }} />
            </Form.Item>
          </Space>
          {producer}
          <Form.Item name="grapes" label="Сорта винограда" tooltip="Введите сорт и нажмите Enter">
            <Select mode="tags" placeholder="Мерло, Каберне Совиньон" tokenSeparators={[',']} />
          </Form.Item>
          {features}
        </>
      );
    case 'spirit':
      return (
        <>
          {subcategory}
          <Space size="large" align="start" wrap style={{ width: '100%' }}>
            {strength}
            {volume}
          </Space>
          {producer}
          {features}
        </>
      );
    case 'champagne_and_sparkling':
      return (
        <>
          {subcategory}
          <Space size="large" align="start" wrap style={{ width: '100%' }}>
            <Form.Item name="color" label="Цвет" rules={FIELD_RULES.color}>
              <Select placeholder="Цвет" loading={loading} options={toOptions(reference.colors)} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="sugarContent" label="Содержание сахара" rules={FIELD_RULES.sugarContent}>
              <Select placeholder="Сахар" loading={loading} options={toOptions(reference.sugarContents)} style={{ width: 200 }} />
            </Form.Item>
            {volume}
          </Space>
          {producer}
          {features}
        </>
      );
    case 'low_alcohol':
      return (
        <>
          {subcategory}
          <Space size="large" align="start" wrap style={{ width: '100%' }}>
            {strength}
            {volume}
          </Space>
          {producer}
          {features}
        </>
      );
    case 'snack':
      return (
        <>
          {subcategory}
          {producer}
          <Form.Item name="pairings" label="Сочетания" tooltip="Например: для красного вина">
            <Select mode="tags" placeholder="для красного вина" tokenSeparators={[',']} />
          </Form.Item>
        </>
      );
    case 'accessories':
      return (
        <>
          {producer}
          {features}
        </>
      );
    default:
      return null;
  }
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form] = Form.useForm<ProductFormValues>();

  const { product, loading, error } = useProduct(id);
  const { saving, create, update } = useProductMutations();

  const category: ProductCategory = isEdit
    ? (product?.productCategoryName ?? 'wine')
    : ((searchParams.get('category') as ProductCategory) || 'wine');

  const { reference, loading: referenceLoading } = useProductReference(category);

  useEffect(() => {
    if (product) {
      form.setFieldsValue(detailToFormValues(product.productCategoryName, product));
    }
  }, [form, product]);

  const handleSubmit = async (values: ProductFormValues) => {
    const body = toWriteRequest(category, values);
    try {
      if (isEdit && id) {
        await update(id, body);
        message.success('Товар обновлён');
      } else {
        await create(body);
        message.success('Товар создан');
      }
      navigate('/catalog');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Не удалось сохранить товар');
    }
  };

  const breadcrumbs = [
    { title: <a onClick={() => navigate('/catalog')}>Каталог</a> },
    { title: isEdit ? product?.name ?? id : 'Новый' },
  ];

  if (isEdit && loading) {
    return <Spin style={{ display: 'block', margin: '48px auto' }} />;
  }

  if (isEdit && (error || !product)) {
    return (
      <>
        <PageHeader title="Редактирование товара" breadcrumbs={breadcrumbs} />
        <Card>{error ?? 'Товар не найден'}</Card>
      </>
    );
  }

  if (!isEditableCategory(category)) {
    return (
      <>
        <PageHeader title="Товар" breadcrumbs={breadcrumbs} />
        <Alert type="info" showIcon message="Форма для этой категории недоступна." />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isEdit ? 'Редактирование товара' : `Новый товар: ${CATEGORY_LABELS[category]}`}
        breadcrumbs={breadcrumbs}
      />

      <Form<ProductFormValues>
        form={form}
        layout="vertical"
        initialValues={DEFAULT_PRODUCT_FORM_VALUES}
        onFinish={handleSubmit}
        disabled={saving}
      >
        <Card title="Основное" style={{ marginBottom: 24 }}>
          <Form.Item name="article" label="Артикул" rules={FIELD_RULES.article}>
            <Input placeholder="WINE-001" style={{ maxWidth: 280 }} />
          </Form.Item>
          <Form.Item name="name" label="Название" rules={FIELD_RULES.name}>
            <Input placeholder="Château Margaux 2018" />
          </Form.Item>
          <Space size="large" align="start" wrap style={{ width: '100%' }}>
            <Form.Item name="initialPrice" label="Начальная цена" rules={FIELD_RULES.initialPrice}>
              <InputNumber min={0} step={10} style={{ width: 200 }} addonAfter="₽" />
            </Form.Item>
            <Form.Item name="price" label="Цена" rules={FIELD_RULES.price}>
              <InputNumber min={0} step={10} style={{ width: 200 }} addonAfter="₽" />
            </Form.Item>
            <Form.Item name="discount" label="Скидка, %" rules={FIELD_RULES.discount}>
              <InputNumber min={0} max={100} style={{ width: 140 }} />
            </Form.Item>
          </Space>
          <Form.Item name="country" label="Страна" rules={FIELD_RULES.country}>
            <Select
              showSearch
              placeholder="Выберите страну"
              loading={referenceLoading}
              options={toOptions(reference.countries)}
              style={{ maxWidth: 320 }}
            />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} placeholder="Описание товара" />
          </Form.Item>
        </Card>

        <Card title={`Характеристики: ${CATEGORY_LABELS[category]}`} style={{ marginBottom: 24 }}>
          <CategoryFields category={category} reference={reference} loading={referenceLoading} />
        </Card>

        <Card title="Фото" style={{ marginBottom: 24 }}>
          {isEdit && id ? (
            <ProductPhotoManager productId={id} />
          ) : (
            <Alert
              type="info"
              showIcon
              message="Сохраните товар, затем добавьте фото в режиме редактирования."
            />
          )}
        </Card>

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
          <Button onClick={() => navigate('/catalog')} disabled={saving}>
            Отмена
          </Button>
        </Space>
      </Form>
    </>
  );
}
