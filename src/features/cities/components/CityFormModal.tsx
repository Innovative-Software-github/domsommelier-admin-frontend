import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Switch } from 'antd';
import type { City } from '../../../api/cities/interfaces';
import {
  CITY_FORM_RULES,
  DEFAULT_CITY_FORM_VALUES,
  toCityFormValues,
  type CityFormValues,
} from '../cityForm';

interface CityFormModalProps {
  open: boolean;
  /** null → создание нового города, иначе редактирование. */
  city: City | null;
  saving: boolean;
  onSubmit: (values: CityFormValues) => void;
  onCancel: () => void;
}

export function CityFormModal({ open, city, saving, onSubmit, onCancel }: CityFormModalProps) {
  const [form] = Form.useForm<CityFormValues>();
  const isEdit = Boolean(city);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (city) {
      form.setFieldsValue(toCityFormValues(city));
    } else {
      form.resetFields();
    }
  }, [open, city, form]);

  return (
    <Modal
      open={open}
      title={isEdit ? 'Редактирование города' : 'Новый город'}
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
    >
      <Form<CityFormValues>
        form={form}
        layout="vertical"
        initialValues={DEFAULT_CITY_FORM_VALUES}
        onFinish={onSubmit}
        disabled={saving}
      >
        <Form.Item name="name" label="Название" rules={CITY_FORM_RULES.name}>
          <Input placeholder="Москва" />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug"
          tooltip="Латинский идентификатор для API, cookie и URL: moscow, saint-petersburg"
          rules={CITY_FORM_RULES.slug}
        >
          <Input placeholder="moscow" />
        </Form.Item>

        <Form.Item name="sortOrder" label="Порядок отображения" rules={CITY_FORM_RULES.sortOrder}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="active" label="Активен (показывать на витрине)" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
