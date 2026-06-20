import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  message,
} from 'antd';
import { getWineStores } from '../../../api/wineStores/requests';
import type { WineStore } from '../../../api/wineStores/interfaces';
import { PageHeader } from '../../../components/PageHeader';
import { EVENT_TYPE_OPTIONS } from '../eventType';
import {
  DEFAULT_FORM_VALUES,
  EVENT_FORM_RULES,
  toFormValues,
  toRequestBody,
  type EventFormValues,
} from '../eventForm';
import { useEvent } from '../hooks/useEvent';
import { useEventMutations } from '../hooks/useEventMutations';

export function EventFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form] = Form.useForm<EventFormValues>();
  const { event, loading, error } = useEvent(id);
  const { saving, create, update } = useEventMutations();
  const [wineStores, setWineStores] = useState<WineStore[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);

  const wineStoreId = Form.useWatch('wineStoreId', form);

  const selectedStore = useMemo(
    () => wineStores.find((store) => store.id === wineStoreId) ?? null,
    [wineStoreId, wineStores],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadStores() {
      setStoresLoading(true);
      try {
        const page = await getWineStores({ page: 0, size: 100 });
        if (!cancelled) {
          setWineStores(page.content);
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

  useEffect(() => {
    if (event) {
      form.setFieldsValue(toFormValues(event));
    }
  }, [form, event]);

  const handleSubmit = async (values: EventFormValues) => {
    const body = toRequestBody(values);

    try {
      if (isEdit && id) {
        await update(id, body);
        message.success('Мероприятие обновлено');
        navigate('/events');
      } else {
        const created = await create(body);
        message.success('Мероприятие создано');
        navigate(`/events/${created.id}`);
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Не удалось сохранить мероприятие';
      message.error(text);
    }
  };

  if (isEdit && loading) {
    return <Spin style={{ display: 'block', margin: '48px auto' }} />;
  }

  if (isEdit && (error || !event)) {
    return (
      <>
        <PageHeader
          title="Редактирование мероприятия"
          breadcrumbs={[
            { title: <a onClick={() => navigate('/events')}>Мероприятия</a> },
            { title: 'Ошибка' },
          ]}
        />
        <Card>{error ?? 'Мероприятие не найдено'}</Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isEdit ? 'Редактирование мероприятия' : 'Новое мероприятие'}
        breadcrumbs={[
          { title: <a onClick={() => navigate('/events')}>Мероприятия</a> },
          { title: isEdit ? event?.title ?? id : 'Новое' },
        ]}
      />

      <Form<EventFormValues>
        form={form}
        layout="vertical"
        initialValues={DEFAULT_FORM_VALUES}
        onFinish={(values) => void handleSubmit(values)}
      >
        <Card title="Основное" style={{ marginBottom: 16 }}>
          <Form.Item name="type" label="Тип" rules={EVENT_FORM_RULES.type}>
            <Select options={EVENT_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="title" label="Название" rules={EVENT_FORM_RULES.title}>
            <Input />
          </Form.Item>
          <Space size="large" style={{ display: 'flex' }} align="start">
            <Form.Item name="price" label="Цена" rules={EVENT_FORM_RULES.price}>
              <InputNumber min={0} style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="datetime" label="Дата и время" rules={EVENT_FORM_RULES.datetime}>
              <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: 240 }} />
            </Form.Item>
          </Space>
        </Card>

        <Card title="Место проведения" style={{ marginBottom: 16 }}>
          <Form.Item name="wineStoreId" label="Винотека" rules={EVENT_FORM_RULES.wineStoreId}>
            <Select
              showSearch
              loading={storesLoading}
              placeholder="Выберите винотеку"
              optionFilterProp="label"
              options={wineStores.map((store) => ({
                value: store.id,
                label: `${store.name} (${store.city})`,
              }))}
            />
          </Form.Item>
          {selectedStore && (
            <Descriptions size="small" column={1} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Город">{selectedStore.city}</Descriptions.Item>
              <Descriptions.Item label="Район">{selectedStore.district}</Descriptions.Item>
              <Descriptions.Item label="Адрес">{selectedStore.address ?? '—'}</Descriptions.Item>
            </Descriptions>
          )}
        </Card>

        <Card title="Регистрация" style={{ marginBottom: 16 }}>
          <Form.Item
            name="registrationLink"
            label="Ссылка на регистрацию"
            rules={EVENT_FORM_RULES.registrationLink}
          >
            <Input placeholder="https://..." />
          </Form.Item>
        </Card>

        <Form.Item name="description" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="smallCover" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="largeCover" hidden>
          <Input />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
          <Button onClick={() => navigate('/events')}>Отмена</Button>
        </Space>
      </Form>
    </>
  );
}
