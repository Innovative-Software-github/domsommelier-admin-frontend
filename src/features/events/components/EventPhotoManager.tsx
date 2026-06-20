import { useState } from 'react';
import {
  Button,
  Image,
  Input,
  Popconfirm,
  Space,
  Table,
  Upload,
  message,
} from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload';
import { getEventPhotoUrl } from '../../../api/events/photos';
import type { EventPhoto } from '../../../api/events/interfaces';
import { useEventPhotos } from '../hooks/useEventPhotos';

interface EventPhotoManagerProps {
  eventId: string;
}

function resolvePhotoPreview(photo: EventPhoto): string {
  if (photo.url) {
    return photo.url.startsWith('http') ? photo.url : `/api-back${photo.url}`;
  }
  return getEventPhotoUrl(photo.id);
}

export function EventPhotoManager({ eventId }: EventPhotoManagerProps) {
  const { photos, loading, uploading, error, upload, remove } = useEventPhotos(eventId);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [description, setDescription] = useState('');

  const handleUpload = async () => {
    const files: File[] = [];
    for (const item of fileList) {
      if (item.originFileObj) {
        files.push(item.originFileObj);
      }
    }

    if (files.length === 0) {
      message.warning('Выберите файлы для загрузки');
      return;
    }

    try {
      await upload(files, description.trim());
      message.success('Фото загружены');
      setFileList([]);
      setDescription('');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Не удалось загрузить фото';
      message.error(text);
    }
  };

  const handleDelete = async (photoId: string) => {
    try {
      await remove(photoId);
      message.success('Фото удалено');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Не удалось удалить фото';
      message.error(text);
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space wrap align="start">
        <Upload
          multiple
          fileList={fileList}
          beforeUpload={() => false}
          onChange={({ fileList: nextList }) => setFileList(nextList)}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>Выбрать файлы</Button>
        </Upload>
        <Input
          placeholder="Описание фото"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          style={{ width: 240 }}
        />
        <Button type="primary" loading={uploading} onClick={() => void handleUpload()}>
          Загрузить
        </Button>
      </Space>

      {error && <div style={{ color: '#cf1322' }}>{error}</div>}

      <Table
        rowKey="id"
        loading={loading}
        dataSource={photos}
        pagination={false}
        locale={{ emptyText: 'Фото ещё не загружены' }}
        columns={[
          {
            title: 'Превью',
            key: 'preview',
            width: 100,
            render: (_, record) => (
              <Image
                src={resolvePhotoPreview(record)}
                alt={record.name}
                width={64}
                height={64}
                style={{ objectFit: 'cover' }}
              />
            ),
          },
          {
            title: 'Имя файла',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: 'Описание',
            dataIndex: 'description',
            key: 'description',
            render: (value: string | null) => value || '—',
          },
          {
            title: 'Действия',
            key: 'actions',
            width: 120,
            render: (_, record) => (
              <Popconfirm
                title="Удалить фото?"
                okText="Удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
                onConfirm={() => void handleDelete(record.id)}
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  Удалить
                </Button>
              </Popconfirm>
            ),
          },
        ]}
      />
    </Space>
  );
}
