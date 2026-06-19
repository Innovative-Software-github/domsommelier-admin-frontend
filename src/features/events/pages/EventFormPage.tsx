import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { SectionPlaceholder } from '../../../components/SectionPlaceholder';

export function EventFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  return (
    <>
      <PageHeader
        title={isEdit ? 'Редактирование мероприятия' : 'Новое мероприятие'}
        breadcrumbs={[
          { title: <a onClick={() => navigate('/events')}>Мероприятия</a> },
          { title: isEdit ? id : 'Новое' },
        ]}
      />
      <SectionPlaceholder
        backend="ready"
        description="Форма мероприятия: название, описание, дата/время, место, статус, фото."
        nextSteps={[
          'Собрать форму на AntD Form по полям Event.',
          'PhotoUploader → events/files/upload.',
          'Сабмит → POST/PUT, редирект на /events.',
        ]}
        api={[
          { method: 'POST', path: '/api/v1/events', note: 'создание' },
          { method: 'PUT', path: '/api/v1/events/{id}', note: 'правка' },
          { method: 'GET', path: '/api/v1/events/{id}', note: 'загрузка для редактирования' },
        ]}
      />
    </>
  );
}
