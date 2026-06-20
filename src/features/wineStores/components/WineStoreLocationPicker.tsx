import { InputNumber, Space, Typography } from 'antd';
import { Map, Placemark, YMaps, ZoomControl } from '@pbe/react-yandex-maps';
import { useMemo, useRef } from 'react';

const MAP_ZOOM = 14;
const MARKER_COLOR = '#680a08';

export interface WineStoreLocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
  disabled?: boolean;
}

type YMapsEvent = {
  get: (name: 'coords') => number[];
};

type PlacemarkInstance = {
  geometry: {
    getCoordinates: () => number[];
  };
  events: {
    add: (eventName: string, handler: () => void) => void;
  };
};

export function WineStoreLocationPicker({
  latitude,
  longitude,
  onChange,
  disabled = false,
}: WineStoreLocationPickerProps) {
  const mapState = useMemo(
    () => ({
      center: [latitude, longitude] as [number, number],
      zoom: MAP_ZOOM,
    }),
    [latitude, longitude],
  );

  const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY as string | undefined;
  const ymapsQuery = apiKey ? { apikey: apiKey } : undefined;
  const dragHandlerAttachedRef = useRef(false);

  const handleMapClick = (event: YMapsEvent) => {
    if (disabled) {
      return;
    }
    const [nextLatitude, nextLongitude] = event.get('coords');
    onChange(nextLatitude, nextLongitude);
  };

  const handlePlacemarkRef = (instance: PlacemarkInstance | null) => {
    if (!instance || dragHandlerAttachedRef.current) {
      return;
    }

    instance.events.add('dragend', () => {
      if (disabled) {
        return;
      }
      const [nextLatitude, nextLongitude] = instance.geometry.getCoordinates();
      onChange(nextLatitude, nextLongitude);
    });
    dragHandlerAttachedRef.current = true;
  };

  return (
    <div>
      <Space style={{ marginBottom: 12 }} wrap>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">Широта</Typography.Text>
          <InputNumber
            value={latitude}
            min={-90}
            max={90}
            step={0.0001}
            disabled={disabled}
            onChange={(value) => {
              if (typeof value === 'number') {
                onChange(value, longitude);
              }
            }}
          />
        </Space>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">Долгота</Typography.Text>
          <InputNumber
            value={longitude}
            min={-180}
            max={180}
            step={0.0001}
            disabled={disabled}
            onChange={(value) => {
              if (typeof value === 'number') {
                onChange(latitude, value);
              }
            }}
          />
        </Space>
      </Space>

      <div style={{ height: 360, borderRadius: 8, overflow: 'hidden' }}>
        <YMaps query={ymapsQuery}>
          <Map
            width="100%"
            height="360px"
            state={mapState}
            onClick={handleMapClick}
            modules={['control.ZoomControl', 'geoObject.addon.balloon']}
          >
            <ZoomControl options={{ position: { right: 10, top: 10 } }} />
            <Placemark
              geometry={[latitude, longitude]}
              options={{
                draggable: !disabled,
                preset: 'islands#circleIcon',
                iconColor: MARKER_COLOR,
              }}
              instanceRef={(ref) => handlePlacemarkRef(ref as unknown as PlacemarkInstance | null)}
            />
          </Map>
        </YMaps>
      </div>
    </div>
  );
}
