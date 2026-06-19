import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../components/PageHeader';
import { SectionPlaceholder } from '../../../components/SectionPlaceholder';

export function NewsListPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Новости"
        subtitle="Публикации для клиентского сайта."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/news/new')}>
            Создать новость
          </Button>
        }
      />
      <SectionPlaceholder
        backend="ready"
        description="CRUD новостей с фото. Бэк готов."
        nextSteps={[
          'Фронт: api/news/* — список, получение по id, create/update/delete.',
          'Заменить заглушку на <DataTable> (заголовок, дата, действия).',
          'Форма новости + PhotoUploader на news/files.',
          'Бэк: закрыть write-методы NewsController ролью @RequiresAdmin.',
        ]}
        api={[
          { method: 'GET', path: '/api/v1/news', note: 'список' },
          { method: 'POST', path: '/api/v1/news', note: 'создание' },
          { method: 'PUT', path: '/api/v1/news', note: 'правка' },
          { method: 'DELETE', path: '/api/v1/news/id', note: 'удаление' },
          { method: 'POST', path: '/news/files/upload', note: 'фото' },
        ]}
        files={['src/api/news/interfaces.ts', 'src/api/news/requests.ts']}
      />
    </>
  );
}
