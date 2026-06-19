import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { SectionPlaceholder } from '../../../components/SectionPlaceholder';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Карточка клиента"
        breadcrumbs={[
          { title: <a onClick={() => navigate('/customers')}>Клиенты</a> },
          { title: id },
        ]}
      />
      <SectionPlaceholder
        backend="none"
        description="Профиль клиента: ФИО, контакты, роль, основная винотека, история заказов."
        nextSteps={[
          'Бэк: GET /api/v1/admin/customers/{id} с вложенными заказами.',
          'Фронт: Descriptions с данными + Table заказов клиента.',
          'Ссылки из заказов на /orders/:id.',
        ]}
        api={[
          { method: 'GET', path: '/api/v1/admin/customers/{id}', note: 'новый' },
        ]}
      />
    </>
  );
}
