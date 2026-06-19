import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { SectionPlaceholder } from '../../../components/SectionPlaceholder';

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  return (
    <>
      <PageHeader
        title={isEdit ? 'Редактирование товара' : 'Новый товар'}
        breadcrumbs={[
          { title: <a onClick={() => navigate('/catalog')}>Каталог</a> },
          { title: isEdit ? id : 'Новый' },
        ]}
      />
      <SectionPlaceholder
        backend="none"
        description="Форма товара: общие поля (название, цена, страна, описание, остаток) + специфичные для категории. Загрузка фото через products/files."
        nextSteps={[
          'Бэк: CRUD продуктов с учётом полиморфных полей категории.',
          'Фронт: динамическая форма по выбранной категории.',
          'Подключить PhotoUploader к POST /products/files/upload.',
          'Сабмит → create/update, затем редирект на /catalog.',
        ]}
        api={[
          { method: 'POST', path: '/api/v1/admin/products/{category}', note: 'новый' },
          { method: 'POST', path: '/products/files/upload', note: 'существует — загрузка фото' },
        ]}
        files={['src/components/PhotoUploader.tsx', 'src/components/EntityForm.tsx']}
      />
    </>
  );
}
