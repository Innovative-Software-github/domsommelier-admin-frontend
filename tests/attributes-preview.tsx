// Isolated manual UI fixture. Network requests are mocked; no catalog writes occur.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Form, Select } from 'antd';
import { tokenStorage } from '../src/auth/tokenStorage';
import { ExtendedAttributesFields } from '../src/features/catalog/components/ExtendedAttributesFields';
import { extraWriteValues } from '../src/features/catalog/attributeValues';
import { validateAttributeValues } from '../src/features/catalog/attributeValidation';
tokenStorage.getToken = () => 'local-preview-fixture';
const references: Record<string, { code: string; label: string }[]> = { brand: [{ code: 'camus', label: 'Camus' }], region: [{ code: 'cognac', label: 'Коньяк' }] };
window.fetch = async (input, init) => {
  const kind = String(input).split('/').at(-1)!;
  if (!String(input).includes('/attribute-references/')) return new Response('{}', { status: 404 });
  if (init?.method === 'POST') { const value = JSON.parse(String(init.body)); references[kind] = [...references[kind] || [], value]; return Response.json(value); }
  return Response.json(references[kind] || []);
};
function Preview() {
  const [form] = Form.useForm();
  const [category, setCategory] = React.useState('spirit');
  const [result, setResult] = React.useState('');
  return <main style={{ margin: '24px auto', padding: 16, maxWidth: 900 }}>
    <h1>Проверка формы характеристик</h1>
    <Select value={category} onChange={value => { form.resetFields(); setCategory(value); }} options={[{value:'wine',label:'Вино'},{value:'spirit',label:'Крепкое'},{value:'champagne_and_sparkling',label:'Игристое'}]} />
    <Form form={form} layout="vertical" initialValues={{ subcategory: 'Виски' }} onFinish={values => {
      const payload = extraWriteValues(category, values.subcategory, values);
      const issues = validateAttributeValues(payload);
      if (issues.length) form.setFields(issues);
      setResult(JSON.stringify(issues.length ? issues : payload, null, 2));
    }}>
      {category === 'spirit' && <Form.Item name="subcategory" label="Подкатегория"><Select options={[{value:'Виски',label:'Виски'},{value:'Коньяк',label:'Коньяк'}]} /></Form.Item>}
      <ExtendedAttributesFields category={category} />
      <Button htmlType="submit">Проверить сохранение</Button>
    </Form><pre>{result}</pre>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
