import { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Modal, Select, Space } from 'antd';
import { customFetch } from '../../../api/config/customFetch';
import type { CatalogReference } from '../../../api/products/attributes';

const requests = new Map<string, Promise<CatalogReference[]>>();
function load(kind: string) {
  let request = requests.get(kind);
  if (!request) {
    request = customFetch<CatalogReference[]>(`/api/v1/admin/products/attribute-references/${kind}`, { withAuth: true });
    requests.set(kind, request);
    request.catch(() => requests.delete(kind));
  }
  return request;
}
interface Props {
  kind: string;
  multiple?: boolean;
  value?: CatalogReference | CatalogReference[] | null;
  onChange?: (value: CatalogReference | CatalogReference[] | null) => void;
  id?: string;
}
export function AttributeReferenceSelect({ kind, multiple, value, onChange, id }: Props) {
  const [options, setOptions] = useState<CatalogReference[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<CatalogReference>();
  useEffect(() => {
    let active = true;
    load(kind).then(rows => { if (active) setOptions(rows); }).catch(() => { if (active) setError('Не удалось загрузить справочник'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind]);
  const selected = value == null ? [] : Array.isArray(value) ? value : [value];
  const all = [...options, ...selected.filter(item => !options.some(option => option.code === item.code))];
  async function save() {
    let values: CatalogReference;
    try { values = await form.validateFields(); } catch { return; }
    setSaving(true);
    try {
      const created = await customFetch<CatalogReference>(`/api/v1/admin/products/attribute-references/${kind}`, { method: 'POST', withAuth: true, body: { code: values.code.trim(), label: values.label.trim() } });
      requests.delete(kind);
      setOptions(await load(kind));
      onChange?.(multiple ? [...selected, created] : created);
      setOpen(false); form.resetFields(); setError(undefined);
    } catch (err) { setError(err instanceof Error ? err.message : 'Не удалось добавить значение'); }
    finally { setSaving(false); }
  }
  return <>
    <Space.Compact style={{ width: '100%' }}>
      <Select id={id} style={{ width: '100%' }} showSearch allowClear optionFilterProp="label" loading={loading}
        mode={multiple ? 'multiple' : undefined} placeholder="Не указано"
        value={multiple ? selected.map(item => item.code) : selected[0]?.code}
        options={all.map(item => ({ value: item.code, label: item.label }))}
        onChange={(codes: string | string[] | undefined) => {
          const list = codes == null ? [] : Array.isArray(codes) ? codes : [codes];
          const result = list.map(code => all.find(item => item.code === code)).filter((item): item is CatalogReference => !!item);
          onChange?.(multiple ? result : result[0] ?? null);
        }} />
      <Button onClick={() => { setError(undefined); setOpen(true); }}>Добавить</Button>
    </Space.Compact>
    {error && <Alert type="error" showIcon message={error} style={{ marginTop: 8 }} />}
    <Modal title="Новое значение справочника" open={open} onCancel={() => setOpen(false)} onOk={save} confirmLoading={saving} okText="Добавить" destroyOnHidden>
      <Form form={form} layout="vertical" component={false}>
        <Form.Item name="label" label="Название" rules={[{ required: true, whitespace: true, message: 'Укажите название' }]}><Input maxLength={160} /></Form.Item>
        <Form.Item name="code" label="Постоянный код" extra="Латинские буквы в нижнем регистре, цифры, дефис или подчёркивание. Например: sauvignon_blanc."
          rules={[{ required: true, pattern: /^[a-z0-9][a-z0-9_-]{0,79}$/, message: 'Укажите код латиницей без пробелов' }]}><Input maxLength={80} /></Form.Item>
      </Form>
      {error && <Alert type="error" message={error} />}
    </Modal>
  </>;
}
