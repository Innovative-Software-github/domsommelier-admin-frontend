import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import type { WineStoreLocationPickerProps } from './WineStoreLocationPicker';

const WineStoreLocationPickerLazy = lazy(() =>
  import('./WineStoreLocationPicker').then((module) => ({
    default: module.WineStoreLocationPicker,
  })),
);

export function WineStoreLocationPicker(props: WineStoreLocationPickerProps) {
  return (
    <Suspense fallback={<Spin style={{ display: 'block', margin: '48px auto' }} />}>
      <WineStoreLocationPickerLazy {...props} />
    </Suspense>
  );
}
