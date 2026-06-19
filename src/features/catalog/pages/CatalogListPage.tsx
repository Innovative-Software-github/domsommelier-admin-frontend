import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../components/PageHeader';
import { SectionPlaceholder } from '../../../components/SectionPlaceholder';

export function CatalogListPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Каталог"
        subtitle="Товары по категориям: вино, крепкий, игристое, слабоалкогольное, снеки, аксессуары."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/catalog/new')}>
            Добавить товар
          </Button>
        }
      />
      <SectionPlaceholder
        backend="none"
        description="Список товаров с переключением категории (Tabs/Segmented), поиском и пагинацией. Каждая категория имеет свой набор полей (полиморфные продукты)."
        nextSteps={[
          'Бэк: реализовать write-API CRUD продуктов под /api/v1/admin/products/{category} (@RequiresAdmin).',
          'Бэк: эндпоинт управления складом (StorageHistory).',
          'Фронт: api/products/* — getProducts(category, params), создание/редактирование/удаление.',
          'Чтение списка можно начать уже сейчас через существующий POST /api/v1/products/filter.',
        ]}
        api={[
          { method: 'POST', path: '/api/v1/products/filter', note: 'существует — чтение/фильтры' },
          { method: 'POST', path: '/api/v1/admin/products/{category}', note: 'новый — создание' },
          { method: 'PUT', path: '/api/v1/admin/products/{category}/{id}', note: 'новый — правка' },
          { method: 'DELETE', path: '/api/v1/admin/products/{category}/{id}', note: 'новый' },
        ]}
        files={['src/api/products/interfaces.ts', 'src/api/products/requests.ts']}
      />
    </>
  );
}
