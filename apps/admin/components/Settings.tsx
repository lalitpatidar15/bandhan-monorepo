'use client';

import { useEffect, useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { type AdminSettings, useGetSettingsHistoryQuery, useGetSettingsQuery, useUpdateSettingsMutation } from '@/lib/adminApi';

export default function Settings() {
  const [settings, setSettings] = useState<AdminSettings>({
    platformName: 'Bandhan',
    supportEmail: 'support@bandhan.com',
    supportPhone: '+91-9999-999-999',
    maxUploadSize: 50,
    maintenanceMode: false,
    emailNotifications: true,
    twoFactorAuth: false,
    apiRateLimit: 1000,
    jobPostingFee: 499,
    serviceFee: 150,
    taxRate: 0.08,
    platformFee: 50,
    gstRate: 0.18,
    defaultCurrency: 'INR',
    jwtExpiry: '7d',
    otpExpiryMinutes: 10,
    paginationLimit: 12,
    rentalReturnWindowHours: 24,
    defaultReturnPolicy: '7-day return policy',
  });

  const [saved, setSaved] = useState(false);
  const { data } = useGetSettingsQuery();
  const { data: historyData } = useGetSettingsHistoryQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  useEffect(() => {
    if (data?.data) {
      setSettings(data.data);
    }
  }, [data]);

  const handleChange = (field: keyof AdminSettings, value: AdminSettings[keyof AdminSettings]) => {
    setSettings({ ...settings, [field]: value });
  };

  const updateOptionList = (field: "jobIndustries" | "companySizes" | "courseLevels" | "eventTypes" | "jobCategories" | "jobTypes" | "experienceLevels" | "courseCategories" | "serviceTypes" | "venueTypes", raw: string) => {
    const values = raw.split("\n").map((item) => item.trim()).filter(Boolean);
    handleChange("catalogFilters", { ...(settings.catalogFilters || {}), [field]: values });
  };

  const handleSave = async () => {
    try {
      await updateSettings(settings).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="admin-page-heading">Settings</h1>
        <p className="admin-page-sub">Manage platform configuration</p>
      </div>

      {saved && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
          ✓ Settings saved successfully
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Platform</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
              <input type="text" value={settings.platformName} onChange={(e) => handleChange('platformName', e.target.value)} className="w-full admin-input focus:outline-none focus:border-purple-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
              <input type="text" value={settings.defaultCurrency || 'INR'} onChange={(e) => handleChange('defaultCurrency', e.target.value)} className="w-full admin-input focus:outline-none focus:border-purple-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Return Policy</label>
              <input type="text" value={settings.defaultReturnPolicy || '7-day return policy'} onChange={(e) => handleChange('defaultReturnPolicy', e.target.value)} className="w-full admin-input focus:outline-none focus:border-purple-600" />
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Contact</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input type="email" value={settings.supportEmail} onChange={(e) => handleChange('supportEmail', e.target.value)} className="w-full admin-input focus:outline-none focus:border-purple-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
              <input type="tel" value={settings.supportPhone} onChange={(e) => handleChange('supportPhone', e.target.value)} className="w-full admin-input focus:outline-none focus:border-purple-600" />
            </div>
          </div>
        </div>

        {/* Fees & Pricing */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Fees &amp; Pricing</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Fee (₹)</label>
              <input type="number" value={settings.serviceFee ?? 150} onChange={(e) => handleChange('serviceFee', Number(e.target.value))} className="w-full admin-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (decimal, e.g. 0.08 = 8%)</label>
              <input type="number" step="0.01" value={settings.taxRate ?? 0.08} onChange={(e) => handleChange('taxRate', Number(e.target.value))} className="w-full admin-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee (₹)</label>
              <input type="number" value={settings.platformFee ?? 50} onChange={(e) => handleChange('platformFee', Number(e.target.value))} className="w-full admin-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (decimal, e.g. 0.18 = 18%)</label>
              <input type="number" step="0.01" value={settings.gstRate ?? 0.18} onChange={(e) => handleChange('gstRate', Number(e.target.value))} className="w-full admin-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Posting Fee (₹)</label>
              <input type="number" value={settings.jobPostingFee ?? 499} onChange={(e) => handleChange('jobPostingFee', Number(e.target.value))} className="w-full admin-input" />
            </div>
          </div>
        </div>

        {/* Security & Limits */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Security &amp; Limits</h3>
          <div className="space-y-4">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.twoFactorAuth} onChange={(e) => handleChange('twoFactorAuth', e.target.checked)} className="w-4 h-4 text-purple-600" />
              <span className="ml-3 text-sm">Two-Factor Authentication</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => handleChange('emailNotifications', e.target.checked)} className="w-4 h-4 text-purple-600" />
              <span className="ml-3 text-sm">Email Notifications</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => handleChange('maintenanceMode', e.target.checked)} className="w-4 h-4 text-purple-600" />
              <span className="ml-3 text-sm">Maintenance Mode</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Rate Limit (req/hr)</label>
              <input type="number" value={settings.apiRateLimit} onChange={(e) => handleChange('apiRateLimit', Number(e.target.value))} className="w-full admin-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Upload Size (MB)</label>
              <input type="number" value={settings.maxUploadSize} onChange={(e) => handleChange('maxUploadSize', Number(e.target.value))} className="w-full admin-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pagination Limit</label>
              <input type="number" value={settings.paginationLimit ?? 12} onChange={(e) => handleChange('paginationLimit', Number(e.target.value))} className="w-full admin-input" />
            </div>
          </div>
        </div>

        {/* Session & Expiry */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Session &amp; Expiry</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">JWT Token Expiry (e.g. 7d, 24h)</label>
              <input type="text" value={settings.jwtExpiry || '7d'} onChange={(e) => handleChange('jwtExpiry', e.target.value)} className="w-full admin-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP Expiry (minutes)</label>
              <input type="number" value={settings.otpExpiryMinutes ?? 10} onChange={(e) => handleChange('otpExpiryMinutes', Number(e.target.value))} className="w-full admin-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental Return Window (hours)</label>
              <input type="number" value={settings.rentalReturnWindowHours ?? 24} onChange={(e) => handleChange('rentalReturnWindowHours', Number(e.target.value))} className="w-full admin-input" />
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-lg mb-2">Portal dropdown options</h3>
          <p className="mb-4 text-sm text-gray-600">One option per line. These values are versioned with the rest of the admin settings and are served to portal forms from the API.</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {([['eventTypes', 'Event types'], ['jobCategories', 'Job categories'], ['jobTypes', 'Job types'], ['experienceLevels', 'Experience levels'], ['courseCategories', 'Course categories'], ['courseLevels', 'Course levels'], ['serviceTypes', 'Service categories'], ['venueTypes', 'Venue types'], ['companySizes', 'Company sizes']] as const).map(([field, label]) => (
              <label key={field} className="block text-sm font-medium text-gray-700">{label}
                <textarea rows={7} value={(settings.catalogFilters?.[field] || []).join('\n')} onChange={(event) => updateOptionList(field, event.target.value)} className="mt-2 w-full admin-input" />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card mt-6 border-2 border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-800 mb-4">
              These actions are irreversible. Please be careful.
            </p>
            <div className="space-y-2">
              <button type="button" disabled title="Not implemented intentionally to avoid destructive accidental actions" className="admin-btn admin-btn-danger text-sm opacity-60 cursor-not-allowed">
                Reset All Data
              </button>
              <button type="button" disabled title="Not implemented intentionally to avoid destructive accidental actions" className="admin-btn admin-btn-danger text-sm ml-2 opacity-60 cursor-not-allowed">
                Delete Database
              </button>
              <p className="text-xs text-red-700">Destructive admin actions are intentionally disabled until a reviewed recovery flow exists.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8">
        <button onClick={handleSave} disabled={isSaving} className="admin-btn admin-btn-primary inline-flex items-center gap-2 text-lg disabled:opacity-60">
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
      <div className="card mt-6">
        <h3 className="font-semibold text-lg mb-2">Configuration history</h3>
        <p className="text-sm text-gray-600 mb-3">Current version: {settings.version ?? 1}. The latest 100 changes are retained.</p>
        <div className="space-y-2 text-sm">
          {(historyData?.data || []).slice(0, 10).map((entry) => <div key={`${entry.version}-${entry.changedAt}`} className="rounded border border-gray-200 p-3"><div className="font-medium">Version {entry.version} · {new Date(entry.changedAt).toLocaleString()}</div><div className="text-gray-600">{Object.keys(entry.changes).join(', ')}</div></div>)}
          {!historyData?.data?.length && <p className="text-gray-500">No setting changes have been recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}
