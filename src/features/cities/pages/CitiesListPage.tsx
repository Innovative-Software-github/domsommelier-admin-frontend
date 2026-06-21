import { useState } from 'react';
import { Button, Popconfirm, Space, Tag, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { DataTable } from '../../../components/DataTable';
import { PageHeader } from '../../../components/PageHeader';
import type { City } from '../../../api/cities/interfaces';
import { useCities } from '../hooks/useCities';
import { useCityMutations } from '../hooks/useCityMutations';
import { CityFormModal } from '../components/CityFormModal';
import { toCityRequestBody, type CityFormValues } from '../cityForm';

export function CitiesListPage() {
  const { cities, loading, error, refetch } = useCities();
  const { saving, create, update, remove } = useCityMutations();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<City | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (city: City) => {
    setEditing(city);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (values: CityFormValues) => {
    const body = toCityRequestBody(values);

    try {
      if (editing) {
        await update(editing.id, body);
        message.success('Город обновлён');
      } else {
        await create(body);
        message.success('Город создан');
      }
      closeModal();
      refetch();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Не удалось сохранить город');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await remove(id);
      message.success('Город удалён');
      refetch();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Не удалось удалить город');
    }
  };

  const columns: ColumnsType<City> = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => <Tag>{slug}</Tag>,
    },
    {
      title: 'Порядок',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 120,
    },
    {
      title: 'Статус',
      dataIndex: 'active',
      key: 'active',
      width: 140,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'default'}>{active ? 'Активен' : 'Скрыт'}</Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space onClick={(event) => event.stopPropagation()}>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            Изменить
          </Button>
          <Popconfirm
            title="Удалить город?"
            description="Винотеки с этим slug останутся без привязки к справочнику."
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true, loading: saving }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Города"
        subtitle="Справочник городов присутствия. Управляет выбором города на витрине и фильтрацией ассортимента."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Добавить город
          </Button>
        }
      />

      {error && <div style={{ color: '#cf1322', marginBottom: 16 }}>{error}</div>}

      <DataTable rowKey="id" columns={columns} dataSource={cities} loading={loading} />

      <CityFormModal
        open={modalOpen}
        city={editing}
        saving={saving}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />
    </>
  );
}
