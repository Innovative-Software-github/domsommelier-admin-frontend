import { useState } from 'react';
import { Button, Image, Popconfirm, Space, Upload, message } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload';
import { deleteNewsCover, uploadNewsCover } from '../../../api/news/cover';

interface NewsCoverManagerProps {
  newsId: string;
  coverUrl: string | null;
  onChange: (coverUrl: string | null) => void;
}

function resolveCoverPreview(url: string): string {
  return url.startsWith('http') ? url : `/api-back${url}`;
}

/** Управление единственной обложкой новости: загрузка, превью, удаление. */
export function NewsCoverManager({ newsId, coverUrl, onChange }: NewsCoverManagerProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [busy, setBusy] = useState(false);

  const handleUpload = async () => {
    const file = fileList[0]?.originFileObj;
    if (!file) {
      message.warning('Выберите изображение');
      return;
    }

    setBusy(true);
    try {
      const updated = await uploadNewsCover(newsId, file);
      onChange(updated.coverUrl);
      setFileList([]);
      message.success('Обложка загружена');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Не удалось загрузить обложку');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      const updated = await deleteNewsCover(newsId);
      onChange(updated.coverUrl);
      message.success('Обложка удалена');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Не удалось удалить обложку');
    } finally {
      setBusy(false);
    }
  };

  if (coverUrl) {
    return (
      <Space align="start" size="middle" wrap>
        <Image
          src={resolveCoverPreview(coverUrl)}
          alt="Обложка"
          width={200}
          height={140}
          style={{ objectFit: 'cover' }}
        />
        <Popconfirm
          title="Удалить обложку?"
          okText="Удалить"
          cancelText="Отмена"
          okButtonProps={{ danger: true, loading: busy }}
          onConfirm={() => void handleRemove()}
        >
          <Button danger icon={<DeleteOutlined />} loading={busy}>
            Удалить обложку
          </Button>
        </Popconfirm>
      </Space>
    );
  }

  return (
    <Space wrap align="start">
      <Upload
        fileList={fileList}
        beforeUpload={() => false}
        maxCount={1}
        accept="image/*"
        onChange={({ fileList: nextList }) => setFileList(nextList.slice(-1))}
      >
        <Button icon={<UploadOutlined />}>Выбрать изображение</Button>
      </Upload>
      <Button type="primary" loading={busy} onClick={() => void handleUpload()}>
        Загрузить обложку
      </Button>
    </Space>
  );
}
