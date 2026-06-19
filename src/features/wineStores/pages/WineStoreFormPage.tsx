import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { SectionPlaceholder } from '../../../components/SectionPlaceholder';

export function WineStoreFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  return (
    <>
      <PageHeader
        title={isEdit ? 'Редактирование винотеки' : 'Новая винотека'}
        breadcrumbs={[
          { title: <a onClick={() => navigate('/wine-stores')}>Винотеки</a> },
          { title: isEdit ? id : 'Новая' },
        ]}
      />
      <SectionPlaceholder
        backend="ready"
        description="Форма винотеки: название, город, адрес, координаты (lat/lng), часы работы."
        nextSteps={[
          'Собрать форму на AntD Form по полям WineStore / WineStorePoint.',
          'Координаты вводить вручную; интеграцию Yandex Maps добавить позже.',
          'Сабмит → POST/PUT, редирект на /wine-stores.',
        ]}
        api={[
          { method: 'POST', path: '/api/v1/wine-stores', note: 'создание' },
          { method: 'PUT', path: '/api/v1/wine-stores/{id}', note: 'правка' },
          { method: 'GET', path: '/api/v1/wine-stores/{id}', note: 'загрузка для редактирования' },
        ]}
      />
    </>
  );
}
