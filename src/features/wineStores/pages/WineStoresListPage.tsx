import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../components/PageHeader';
import { SectionPlaceholder } from '../../../components/SectionPlaceholder';

export function WineStoresListPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Винотеки"
        subtitle="Точки самовывоза и их гео-координаты."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/wine-stores/new')}>
            Добавить винотеку
          </Button>
        }
      />
      <SectionPlaceholder
        backend="ready"
        description="CRUD винотек с адресом и точками на карте. Бэк готов."
        nextSteps={[
          'Фронт: api/wineStores/* — getAll(page,size), getById, create/update/delete.',
          'Заменить заглушку на <DataTable> (название, адрес, город, действия).',
          'Форма винотеки + ввод координат (карта — позже).',
          'Бэк: закрыть write-методы WineStoreController ролью @RequiresAdmin.',
        ]}
        api={[
          { method: 'GET', path: '/api/v1/wine-stores', note: 'список (page,size)' },
          { method: 'POST', path: '/api/v1/wine-stores', note: 'создание' },
          { method: 'PUT', path: '/api/v1/wine-stores/{id}', note: 'правка' },
          { method: 'DELETE', path: '/api/v1/wine-stores/{id}', note: 'удаление' },
        ]}
        files={['src/api/wineStores/interfaces.ts', 'src/api/wineStores/requests.ts']}
      />
    </>
  );
}
