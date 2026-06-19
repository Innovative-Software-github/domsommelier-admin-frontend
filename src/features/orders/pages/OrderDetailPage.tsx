import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { SectionPlaceholder } from '../../../components/SectionPlaceholder';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={`Заказ ${id ?? ''}`}
        subtitle="Детали заказа, позиции, клиент и смена статуса."
        breadcrumbs={[
          { title: <a onClick={() => navigate('/orders')}>Заказы</a> },
          { title: id },
        ]}
      />
      <SectionPlaceholder
        backend="needs-work"
        description="Карточка заказа: данные клиента и доставки, список позиций (OrderItem), сумма, промокод. Select статуса с кнопкой «Сохранить» и кнопка «Отменить» (Popconfirm)."
        nextSteps={[
          'Бэк: GET /api/v1/admin/orders/{id} (OrderFullDto без проверки владельца) и PATCH /{id}/status.',
          'Фронт: requests getOrder(id), updateOrderStatus(id, status), cancelOrder(id).',
          'Собрать карточку из Descriptions + Table позиций.',
          'Обработать 409 при недопустимом переходе статуса (тост-ошибка).',
        ]}
        api={[
          { method: 'GET', path: '/api/v1/admin/orders/{id}', note: 'детали заказа' },
          { method: 'PATCH', path: '/api/v1/admin/orders/{id}/status', note: 'смена статуса' },
          { method: 'POST', path: '/api/v1/orders/{id}/cancel', note: 'существует' },
        ]}
        files={['src/features/orders/hooks/useOrderMutations.ts']}
      />
    </>
  );
}
