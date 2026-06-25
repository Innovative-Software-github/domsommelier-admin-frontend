import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Form, Input, Space, Spin, message } from 'antd';
import { PageHeader } from '../../../components/PageHeader';
import { NewsCoverManager } from '../components/NewsCoverManager';
import {
  DEFAULT_NEWS_FORM_VALUES,
  NEWS_FORM_RULES,
  toFormValues,
  toRequestBody,
  type NewsFormValues,
} from '../newsForm';
import { useNewsItem } from '../hooks/useNewsItem';
import { useNewsMutations } from '../hooks/useNewsMutations';

export function NewsFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form] = Form.useForm<NewsFormValues>();
  const { news, loading, error } = useNewsItem(id);
  const { saving, create, update } = useNewsMutations();
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    if (news) {
      form.setFieldsValue(toFormValues(news));
      setCoverUrl(news.coverUrl);
    }
  }, [form, news]);

  const handleSubmit = async (values: NewsFormValues) => {
    const body = toRequestBody(values);

    try {
      if (isEdit && id) {
        await update(id, body);
        message.success('Новость обновлена');
        navigate('/news');
      } else {
        const created = await create(body);
        message.success('Новость создана. Теперь можно добавить обложку.');
        navigate(`/news/${created.id}`);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Не удалось сохранить новость');
    }
  };

  if (isEdit && loading) {
    return <Spin style={{ display: 'block', margin: '48px auto' }} />;
  }

  if (isEdit && (error || !news)) {
    return (
      <>
        <PageHeader
          title="Редактирование новости"
          breadcrumbs={[
            { title: <a onClick={() => navigate('/news')}>Новости</a> },
            { title: 'Ошибка' },
          ]}
        />
        <Card>{error ?? 'Новость не найдена'}</Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isEdit ? 'Редактирование новости' : 'Новая новость'}
        breadcrumbs={[
          { title: <a onClick={() => navigate('/news')}>Новости</a> },
          { title: isEdit ? news?.title ?? id : 'Новая' },
        ]}
      />

      <Form<NewsFormValues>
        form={form}
        layout="vertical"
        initialValues={DEFAULT_NEWS_FORM_VALUES}
        onFinish={(values) => void handleSubmit(values)}
      >
        <Card title="Основное" style={{ marginBottom: 16 }}>
          <Form.Item name="title" label="Заголовок" rules={NEWS_FORM_RULES.title}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Текст" rules={NEWS_FORM_RULES.description}>
            <Input.TextArea rows={5} />
          </Form.Item>
        </Card>

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
          <Button onClick={() => navigate('/news')}>Отмена</Button>
        </Space>
      </Form>

      {isEdit && id && (
        <Card title="Обложка" style={{ marginTop: 16 }}>
          <NewsCoverManager newsId={id} coverUrl={coverUrl} onChange={setCoverUrl} />
        </Card>
      )}
    </>
  );
}
