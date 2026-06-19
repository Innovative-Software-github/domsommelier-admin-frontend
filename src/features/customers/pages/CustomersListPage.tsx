import { PageHeader } from '../../../components/PageHeader';
import { SectionPlaceholder } from '../../../components/SectionPlaceholder';

export function CustomersListPage() {
  return (
    <>
      <PageHeader
        title="Клиенты"
        subtitle="Просмотр клиентов и их заказов (read-only)."
      />
      <SectionPlaceholder
        backend="none"
        description="Список клиентов с поиском по email/телефону и переходом в карточку. На первом этапе — только чтение."
        nextSteps={[
          'Бэк: GET /api/v1/admin/customers (пагинация, поиск) и GET /{id} под @RequiresAdmin.',
          'Фронт: api/customer/* расширить admin-запросами.',
          'Заменить заглушку на <DataTable> (ФИО, email, телефон, роль).',
          'Опционально: смена роли клиента.',
        ]}
        api={[
          { method: 'GET', path: '/api/v1/admin/customers', note: 'новый — список' },
          { method: 'GET', path: '/api/v1/admin/customers/{id}', note: 'новый — карточка' },
        ]}
        files={['src/api/customer/requests.ts']}
      />
    </>
  );
}
