import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../components/PageHeader';
import { SectionPlaceholder } from '../../../components/SectionPlaceholder';

export function EventsListPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Мероприятия"
        subtitle="Дегустации и винные казино."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/events/new')}>
            Создать мероприятие
          </Button>
        }
      />
      <SectionPlaceholder
        backend="ready"
        description="CRUD мероприятий с фото и статусами. Бэк полностью готов — можно реализовывать фронт сразу."
        nextSteps={[
          'Фронт: api/events/* — getEvents(params), getEvent(id), create/update/delete.',
          'Заменить заглушку на <DataTable> (название, дата, статус, действия).',
          'Форма мероприятия + PhotoUploader на events/files.',
          'Бэк: навесить @RequiresAdmin на write-методы EventController (сейчас открыты любому authenticated).',
        ]}
        api={[
          { method: 'GET', path: '/api/v1/events/filter', note: 'список' },
          { method: 'POST', path: '/api/v1/events', note: 'создание' },
          { method: 'PUT', path: '/api/v1/events/{id}', note: 'правка' },
          { method: 'DELETE', path: '/api/v1/events/{id}', note: 'удаление' },
          { method: 'POST', path: '/events/files/upload', note: 'фото' },
        ]}
        files={['src/api/events/interfaces.ts', 'src/api/events/requests.ts']}
      />
    </>
  );
}
