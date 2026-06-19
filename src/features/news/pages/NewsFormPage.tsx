import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { SectionPlaceholder } from '../../../components/SectionPlaceholder';

export function NewsFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  return (
    <>
      <PageHeader
        title={isEdit ? 'Редактирование новости' : 'Новая новость'}
        breadcrumbs={[
          { title: <a onClick={() => navigate('/news')}>Новости</a> },
          { title: isEdit ? id : 'Новая' },
        ]}
      />
      <SectionPlaceholder
        backend="ready"
        description="Форма новости: заголовок, текст, дата, фото."
        nextSteps={[
          'Собрать форму на AntD Form по полям News.',
          'PhotoUploader → news/files/upload.',
          'Сабмит → POST/PUT, редирект на /news.',
        ]}
        api={[
          { method: 'POST', path: '/api/v1/news', note: 'создание' },
          { method: 'PUT', path: '/api/v1/news', note: 'правка' },
        ]}
      />
    </>
  );
}
