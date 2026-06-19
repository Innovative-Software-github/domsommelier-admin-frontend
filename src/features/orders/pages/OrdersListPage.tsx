import { PageHeader } from '../../../components/PageHeader';
import { SectionPlaceholder } from '../../../components/SectionPlaceholder';

export function OrdersListPage() {
  return (
    <>
      <PageHeader
        title="Заказы"
        subtitle="Список всех заказов магазина с фильтрами и сменой статуса."
      />
      <SectionPlaceholder
        backend="needs-work"
        description="Флагманский раздел MVP. Таблица всех заказов: №, дата, клиент, телефон, винотека, сумма, статус. Фильтры по статусу/винотеке/датам, серверная пагинация, переход в деталь."
        nextSteps={[
          'Бэк: добавить AdminOrderController (GET /api/v1/admin/orders) под @RequiresAdmin с фильтрами и пагинацией.',
          'Фронт: api/orders/{interfaces,requests}.ts — getOrders(params): Page<AdminOrderListDto>.',
          'Заменить эту заглушку на <DataTable> с колонками и тулбаром фильтров.',
          'Клик по строке → навигация на /orders/:id.',
        ]}
        api={[
          { method: 'GET', path: '/api/v1/admin/orders', note: 'новый — список всех заказов' },
          { method: 'GET', path: '/api/v1/admin/order-statuses', note: 'новый — справочник статусов' },
        ]}
        files={[
          'src/api/orders/interfaces.ts',
          'src/api/orders/requests.ts',
          'src/features/orders/hooks/useOrders.ts',
        ]}
      />
    </>
  );
}
