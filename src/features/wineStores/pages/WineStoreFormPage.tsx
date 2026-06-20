import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Form, Input, InputNumber, Space, Spin, message } from 'antd';
import { PageHeader } from '../../../components/PageHeader';
import { WineStoreLocationPicker } from '../components/WineStoreLocationPickerLazy';
import { useWineStore } from '../hooks/useWineStore';
import { useWineStoreMutations } from '../hooks/useWineStoreMutations';
import {
  DEFAULT_FORM_VALUES,
  toFormValues,
  toRequestBody,
  WINE_STORE_FORM_RULES,
  type WineStoreFormValues,
} from '../wineStoreForm';

export function WineStoreFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form] = Form.useForm<WineStoreFormValues>();
  const { wineStore, loading, error } = useWineStore(id);
  const { saving, create, update } = useWineStoreMutations();

  const latitude = Form.useWatch('latitude', form) ?? DEFAULT_FORM_VALUES.latitude;
  const longitude = Form.useWatch('longitude', form) ?? DEFAULT_FORM_VALUES.longitude;

  useEffect(() => {
    if (wineStore) {
      form.setFieldsValue(toFormValues(wineStore));
    }
  }, [form, wineStore]);

  const handleSubmit = async (values: WineStoreFormValues) => {
    const body = toRequestBody(values);

    try {
      if (isEdit && id) {
        await update(Number(id), body);
        message.success('Винотека обновлена');
      } else {
        await create(body);
        message.success('Винотека создана');
      }
      navigate('/wine-stores');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Не удалось сохранить винотеку';
      message.error(text);
    }
  };

  if (isEdit && loading) {
    return <Spin style={{ display: 'block', margin: '48px auto' }} />;
  }

  if (isEdit && (error || !wineStore)) {
    return (
      <>
        <PageHeader
          title="Редактирование винотеки"
          breadcrumbs={[
            { title: <a onClick={() => navigate('/wine-stores')}>Винотеки</a> },
            { title: 'Ошибка' },
          ]}
        />
        <Card>{error ?? 'Винотека не найдена'}</Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isEdit ? 'Редактирование винотеки' : 'Новая винотека'}
        breadcrumbs={[
          { title: <a onClick={() => navigate('/wine-stores')}>Винотеки</a> },
          { title: isEdit ? wineStore?.name ?? id : 'Новая' },
        ]}
      />

      <Form<WineStoreFormValues>
        form={form}
        layout="vertical"
        initialValues={DEFAULT_FORM_VALUES}
        onFinish={handleSubmit}
        disabled={saving}
      >
        <Card title="Основное" style={{ marginBottom: 24 }}>
          <Form.Item name="name" label="Название" rules={WINE_STORE_FORM_RULES.name}>
            <Input placeholder='Винотека "Дом Сомелье"' />
          </Form.Item>
          <Space size="large" align="start" wrap style={{ width: '100%' }}>
            <Form.Item name="city" label="Город" rules={WINE_STORE_FORM_RULES.city}>
              <Input placeholder="москва" style={{ width: 240 }} />
            </Form.Item>
            <Form.Item name="district" label="Район" rules={WINE_STORE_FORM_RULES.district}>
              <Input placeholder="центральный" style={{ width: 240 }} />
            </Form.Item>
          </Space>
          <Form.Item name="address" label="Адрес" rules={WINE_STORE_FORM_RULES.address}>
            <Input placeholder="ул. Тверская, д. 12" />
          </Form.Item>
          <Space size="large" align="start" wrap style={{ width: '100%' }}>
            <Form.Item name="phone" label="Телефон" rules={WINE_STORE_FORM_RULES.phone}>
              <Input placeholder="+7 (495) 123-45-67" style={{ width: 240 }} />
            </Form.Item>
            <Form.Item name="workingHours" label="Часы работы" rules={WINE_STORE_FORM_RULES.workingHours}>
              <Input placeholder="Пн-Вс: 10:00 - 22:00" style={{ width: 240 }} />
            </Form.Item>
          </Space>
        </Card>

        <Card title="Расположение" style={{ marginBottom: 24 }}>
          <Form.Item name="latitude" hidden rules={WINE_STORE_FORM_RULES.latitude}>
            <InputNumber />
          </Form.Item>
          <Form.Item name="longitude" hidden rules={WINE_STORE_FORM_RULES.longitude}>
            <InputNumber />
          </Form.Item>

          <WineStoreLocationPicker
            latitude={latitude}
            longitude={longitude}
            disabled={saving}
            onChange={(nextLatitude, nextLongitude) => {
              form.setFieldsValue({
                latitude: nextLatitude,
                longitude: nextLongitude,
              });
            }}
          />
        </Card>

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>
            Сохранить
          </Button>
          <Button onClick={() => navigate('/wine-stores')} disabled={saving}>
            Отмена
          </Button>
        </Space>
      </Form>
    </>
  );
}
