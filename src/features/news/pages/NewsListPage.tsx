import { useNavigate } from 'react-router-dom';
import { Button, Image, Popconfirm, Space, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { News } from '../../../api/news/interfaces';
import { DataTable } from '../../../components/DataTable';
import { PageHeader } from '../../../components/PageHeader';
import { formatDateTime } from '../../../shared/format';
import { useNewsList } from '../hooks/useNewsList';
import { useNewsMutations } from '../hooks/useNewsMutations';

function resolveCoverPreview(url: string): string {
  return url.startsWith('http') ? url : `/api-back${url}`;
}

export function NewsListPage() {
  const navigate = useNavigate();
  const { params, page, loading, error, setPageNumber, refetch } = useNewsList();
  const { remove, saving } = useNewsMutations();

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      message.success('Новость удалена');
      refetch();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Не удалось удалить новость');
    }
  };

  const columns: ColumnsType<News> = [
    {
      title: 'Обложка',
      key: 'cover',
      width: 96,
      render: (_, record) =>
        record.coverUrl ? (
          <Image
            src={resolveCoverPreview(record.coverUrl)}
            alt={record.title}
            width={64}
            height={48}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          '—'
        ),
    },
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Опубликовано',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 200,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space onClick={(event) => event.stopPropagation()}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/news/${record.id}`)}
          >
            Изменить
          </Button>
          <Popconfirm
            title="Удалить новость?"
            description="Операция необратима. Обложка также будет удалена."
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true, loading: saving }}
            onConfirm={() => void handleDelete(record.id)}
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
        title="Новости"
        subtitle="Публикации для свайпера на главной странице сайта."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/news/new')}>
            Создать новость
          </Button>
        }
      />

      {error && <div style={{ color: '#cf1322', marginBottom: 16 }}>{error}</div>}

      <DataTable
        rowKey="id"
        columns={columns}
        dataSource={page?.content}
        loading={loading}
        total={page?.totalElements}
        page={page?.number ?? params.page ?? 0}
        pageSize={page?.size ?? params.size ?? 10}
        onPageChange={setPageNumber}
        onRow={(record) => ({
          onClick: () => navigate(`/news/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </>
  );
}
