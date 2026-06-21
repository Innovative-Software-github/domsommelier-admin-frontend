import { useState } from 'react';
import { Button, Image, Popconfirm, Space, Spin, Upload, message } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload';
import { getProductPhotoUrl } from '../../../api/products/photos';
import { useProductPhotos } from '../hooks/useProductPhotos';

interface ProductPhotoManagerProps {
  productId: string;
}

export function ProductPhotoManager({ productId }: ProductPhotoManagerProps) {
  const { photos, loading, uploading, error, upload, remove } = useProductPhotos(productId);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleUpload = async () => {
    const files = fileList
      .map((item) => item.originFileObj)
      .filter((file): file is NonNullable<typeof file> => Boolean(file)) as File[];
    if (files.length === 0) {
      return;
    }
    try {
      await upload(files);
      setFileList([]);
      message.success('Фото загружены');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Не удалось загрузить фото');
    }
  };

  const handleRemove = async (photoId: string) => {
    try {
      await remove(photoId);
      message.success('Фото удалено');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Не удалось удалить фото');
    }
  };

  return (
    <>
      {error && <div style={{ color: '#cf1322', marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <Spin />
      ) : (
        <Space wrap size={12} style={{ marginBottom: 16 }}>
          {photos.length === 0 && <span style={{ color: '#999' }}>Фото пока нет</span>}
          {photos.map((photo) => (
            <div key={photo.id} style={{ position: 'relative', lineHeight: 0 }}>
              <Image
                width={120}
                height={120}
                style={{ objectFit: 'cover', borderRadius: 8 }}
                src={getProductPhotoUrl(productId, photo.name)}
              />
              <Popconfirm
                title="Удалить фото?"
                okText="Удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleRemove(photo.id)}
              >
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  style={{ position: 'absolute', top: 4, right: 4 }}
                />
              </Popconfirm>
            </div>
          ))}
        </Space>
      )}

      <div>
        <Upload
          multiple
          accept="image/*"
          listType="picture"
          fileList={fileList}
          beforeUpload={() => false}
          onChange={({ fileList: next }) => setFileList(next)}
        >
          <Button icon={<UploadOutlined />}>Выбрать фото</Button>
        </Upload>
        <Button
          type="primary"
          style={{ marginTop: 12 }}
          loading={uploading}
          disabled={fileList.length === 0}
          onClick={handleUpload}
        >
          Загрузить
        </Button>
      </div>
    </>
  );
}
