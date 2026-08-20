'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  useCreateCommissionRuleMutation,
  useDeleteCommissionRuleMutation,
  useGetCommissionRulesQuery,
  useGetJobPostingFeeQuery,
  useUpdateCommissionRuleMutation,
  useUpdateJobPostingFeeMutation,
} from '@/lib/adminApi';

export default function Commissions() {
  const { data: rules = [] } = useGetCommissionRulesQuery();
  const { data: feeData } = useGetJobPostingFeeQuery();
  const [createRule] = useCreateCommissionRuleMutation();
  const [updateRule] = useUpdateCommissionRuleMutation();
  const [deleteRule] = useDeleteCommissionRuleMutation();
  const [updateFee, { isLoading: savingFee }] = useUpdateJobPostingFeeMutation();

  const [category, setCategory] = useState('');
  const [type, setType] = useState<'fixed' | 'percentage'>('percentage');
  const [value, setValue] = useState('');
  const [jobPostingFee, setJobPostingFee] = useState(String(feeData?.fee || 0));

  useEffect(() => {
    setJobPostingFee(String(feeData?.fee || 0));
  }, [feeData?.fee]);

  const handleCreateRule = async () => {
    const amount = Number(value);
    if (!category.trim() || amount <= 0) return;

    try {
      await createRule({ category: category.trim(), type, value: amount }).unwrap();
      setCategory('');
      setType('percentage');
      setValue('');
    } catch (error) {
      console.error('Unable to create commission rule:', error);
    }
  };

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      await updateRule({ id, isActive: !isActive }).unwrap();
    } catch (error) {
      console.error('Unable to update commission rule:', error);
    }
  };

  const removeRule = async (id: string) => {
    if (!confirm('Delete this commission rule?')) return;

    try {
      await deleteRule(id).unwrap();
    } catch (error) {
      console.error('Unable to delete commission rule:', error);
    }
  };

  const saveFee = async () => {
    const fee = Number(jobPostingFee);
    if (fee < 0) return;

    try {
      await updateFee({ fee }).unwrap();
    } catch (error) {
      console.error('Unable to update job posting fee:', error);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="admin-page-heading">Commission Rules</h1>
        <p className="admin-page-sub">Configure commission logic and default job posting fees.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="card space-y-3 md:col-span-2">
          <h2 className="text-lg font-semibold">New Rule</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" className="admin-input" />
            <select value={type} onChange={(event) => setType(event.target.value as 'fixed' | 'percentage')} className="admin-input">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
            <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Value" type="number" className="admin-input" />
          </div>
          <button onClick={handleCreateRule} className="admin-btn admin-btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Rule
          </button>
        </div>

        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Job Posting Fee</h2>
          <input
            value={jobPostingFee}
            onChange={(event) => setJobPostingFee(event.target.value)}
            className="w-full admin-input"
            type="number"
            min={0}
          />
          <button onClick={saveFee} disabled={savingFee} className="admin-btn admin-btn-success disabled:opacity-60">
            Save Fee
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="admin-table w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left">Category</th>
              <th className="text-left">Type</th>
              <th className="text-left">Value</th>
              <th className="text-left">Status</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{rule.category}</td>
                <td className="px-4 py-3 text-gray-700">{rule.type}</td>
                <td className="px-4 py-3 text-gray-700">{rule.type === 'percentage' ? `${rule.value}%` : `₹${rule.value}`}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleStatus(rule.id, rule.isActive)}
                    className={`admin-badge ${rule.isActive ? 'admin-badge-active' : 'admin-badge-inactive'}`}
                  >
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => removeRule(rule.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
