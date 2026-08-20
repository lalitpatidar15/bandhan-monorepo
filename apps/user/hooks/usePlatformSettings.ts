import { useEffect } from 'react';
import { useGetPlatformSettingsQuery } from '@/store/api/authApi';

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  serviceFee: number;
  taxRate: number;
  platformFee: number;
  gstRate: number;
  defaultCurrency: string;
  maxUploadSize: number;
  defaultReturnPolicy: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'Bandhan',
  supportEmail: 'support@bandhan.com',
  supportPhone: '+91-9999-999-999',
  serviceFee: 150,
  taxRate: 0.08,
  platformFee: 50,
  gstRate: 0.18,
  defaultCurrency: 'INR',
  maxUploadSize: 50,
  defaultReturnPolicy: '7-day return policy',
};

let cachedSettings: PlatformSettings | null = null;

export function usePlatformSettings(): PlatformSettings {
  const { data } = useGetPlatformSettingsQuery();

  const settings = data?.success && data?.data
    ? { ...DEFAULT_SETTINGS, ...data.data }
    : (cachedSettings || DEFAULT_SETTINGS);

  useEffect(() => {
    if (data?.success && data?.data) {
      cachedSettings = { ...DEFAULT_SETTINGS, ...data.data };
    }
  }, [data]);

  return settings;
}
