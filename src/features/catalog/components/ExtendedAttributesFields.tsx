import { Alert, Button, Card, Collapse, Form, Input, InputNumber, Select, Space } from 'antd';
import type { AttributeField } from '../attributeFields';
import { brandField, getAttributeFields, packagingField } from '../attributeFields';
import { AttributeReferenceSelect } from './AttributeReferenceSelect';

type FieldPath = (string | number)[];
function Fields({ fields, prefix, absolutePrefix = prefix }: { fields: AttributeField[]; prefix: FieldPath; absolutePrefix?: FieldPath }) {
  return <>{fields.map(field => {
    const name = [...prefix, field.key];
    const absolute = [...absolutePrefix, field.key];
    if (field.type === 'object') return <Collapse defaultActiveKey={[field.key]} key={field.key} style={{ marginBottom: 16 }} items={[{ key: field.key, label: field.label, forceRender: true, children: <Fields fields={field.fields || []} prefix={name} absolutePrefix={absolute} /> }]} />;
    if (field.type === 'list') return <Form.List key={field.key} name={name}>
      {(rows, { add, remove }) => <Card size="small" title={field.label} style={{ marginBottom: 16 }}>
        {rows.map(row => <Card size="small" key={row.key} style={{ marginBottom: 12 }} extra={<Button danger onClick={() => remove(row.name)}>Удалить строку</Button>}>
          <Fields fields={field.fields || []} prefix={[row.name]} absolutePrefix={[...absolute, row.name]} />
        </Card>)}
        <Space><Button onClick={() => add({})}>Добавить строку</Button><Button onClick={() => { if (rows.length) remove(rows.map(row => row.name)); }}>Очистить</Button></Space>
      </Card>}
    </Form.List>;
    const rules = field.type === 'number' ? [{ type: 'number' as const, min: field.min, max: field.max, message: `Допустимое значение: ${field.min}–${field.max}` }, ...(field.integer ? [{ type: 'integer' as const, message: 'Введите целое число' }] : [])] : [];
    return <Form.Item key={field.key} name={name} label={field.label} rules={rules}>
      {field.type === 'reference' || field.type === 'references' ? <AttributeReferenceSelect kind={field.kind!} multiple={field.type === 'references'} /> :
        field.type === 'number' ? <InputNumber min={field.min} max={field.max} precision={field.integer ? 0 : undefined} style={{ width: 220 }} placeholder="Не указано" /> :
        field.type === 'enum' ? <Select allowClear placeholder="Не указано" options={field.options?.map(option => ({ label: option.label, value: String(option.value) }))} /> :
        <Input.TextArea rows={2} maxLength={field.key === 'sourceId' ? 200 : 4000} />}
    </Form.Item>;
  })}</>;
}
export function ExtendedAttributesFields({ category }: { category: string }) {
  const subcategory = Form.useWatch<string>('subcategory');
  return <Card title="Дополнительные характеристики" style={{ marginBottom: 24 }}>
    <Alert type="info" showIcon message="Заполняйте только подтверждённые сведения. Неизвестные значения оставляйте пустыми. Для вкусовых оценок указывайте источник и известные границы шкалы." style={{ marginBottom: 20 }} />
    <Fields fields={[brandField, packagingField]} prefix={[]} />
    <Fields fields={getAttributeFields(category, subcategory)} prefix={['extendedDetails']} />
  </Card>;
}
