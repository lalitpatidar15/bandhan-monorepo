'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Crosshair, Search } from 'lucide-react';
import { useAppDispatch } from '@/hooks';
import { setLocation } from '@/store/slices/locationSlice';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useLazyReverseGeocodeQuery } from '@/store/api/locationApi';
import Image from 'next/image';

const POPULAR_CITIES = [
  { city: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  { city: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
];

export default function LocationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [triggerReverseGeocode] = useLazyReverseGeocodeQuery();
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');

  const save = (loc: {
    city: string;
    state: string;
    pincode: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    dispatch(
      setLocation({
        city: loc.city,
        state: loc.state,
        pincode: loc.pincode,
        country: loc.country || 'India',
        latitude: loc.latitude,
        longitude: loc.longitude,
      }),
    );
    router.replace('/');
  };

  const useCurrent = () => {
    setDetecting(true);
    setError('');
    if (!navigator.geolocation) {
      setError('Location services are not supported on this device.');
      setDetecting(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const result = await triggerReverseGeocode({ latitude, longitude });
          const data = result.data;
          save({
            city: data?.city || data?.locality || 'Your city',
            state: data?.principalSubdivision || '',
            pincode: data?.postcode || '',
            latitude,
            longitude,
          });
        } catch {
          save({
            city: 'Your city',
            state: '',
            pincode: '',
            latitude,
            longitude,
          });
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setError('Permission denied. Please search for your city instead.');
        setDetecting(false);
      },
    );
  };

  const submitManual = () => {
    setError('');
    if (!city.trim() || !pincode.trim()) {
      setError('Please enter both city and pincode.');
      return;
    }
    save({ city: city.trim(), state: '', pincode: pincode.trim() });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FAF5EE] to-[#F1E6DA] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E7E1D8] bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col items-center text-center">
          <Image src="/Group.png" alt="Bandhan" width={192} height={48} className="h-12 w-auto" priority />
          <h1 className="mt-3 text-xl font-bold text-[#1C1A16]">Select your location</h1>
          <p className="mt-1 text-sm text-gray-500">
            We&apos;ll show products, services and venues near you.
          </p>
        </div>

        <Button
          variant="primary"
          fullWidth
          onClick={useCurrent}
          loading={detecting}
          icon={<Crosshair className="h-4 w-4" />}
        >
          {detecting ? 'Detecting…' : 'Use current location'}
        </Button>

        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-[#E7E1D8]" /> OR {' '}
          <span className="h-px flex-1 bg-[#E7E1D8]" />
        </div>

        <div className="space-y-3">
          <Input
            label="Search city"
            placeholder="e.g. Indore"
            value={city}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
          />
          <Input
            label="Enter pincode"
            placeholder="e.g. 452001"
            value={pincode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPincode(e.target.value)}
          />
          <Button variant="outline" fullWidth onClick={submitManual} icon={<Search className="h-4 w-4" />}>
            Confirm location
          </Button>
        </div>

        {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-gray-500">Popular cities</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map((c) => (
              <button
                key={c.city}
                onClick={() => save(c)}
                className="flex items-center gap-1.5 rounded-full border border-[#E7E1D8] bg-[#FAF5EE] px-3 py-1.5 text-xs text-[#4b4540] transition hover:border-[#924C2B] hover:text-[#924C2B]"
              >
                <MapPin className="h-3.5 w-3.5 text-[#924C2B]" />
                {c.city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
