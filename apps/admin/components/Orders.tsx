'use client';

import { useState } from 'react';
import { Search, Eye, Trash2, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useAssignShiprocketAwbMutation, useCreateShiprocketShipmentMutation, useGetOrdersQuery, useRefreshShiprocketTrackingMutation, useUpdateOrderMutation, useRefundOrderMutation } from '@/lib/adminApi';
import { Modal, Button, Field, Textarea, Badge, statusTone } from '@bandhan/ui';
import toast from 'react-hot-toast';

type Order = import('@/lib/adminApi').AdminOrder;

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<Order['status']>('pending');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const { data: orders = [], refetch } = useGetOrdersQuery({ search: searchTerm || undefined, status: statusFilter || undefined, paymentStatus: paymentFilter || undefined, type: typeFilter || undefined, from: from || undefined, to: to || undefined });
  const [updateOrder, { isLoading: saving }] = useUpdateOrderMutation();
  const [createShipment, { isLoading: creatingShipment }] = useCreateShiprocketShipmentMutation();
  const [assignAwb, { isLoading: assigningAwb }] = useAssignShiprocketAwbMutation();
  const [refreshTracking, { isLoading: refreshingTracking }] = useRefreshShiprocketTrackingMutation();
  const [refundOrder, { isLoading: refunding }] = useRefundOrderMutation();

  const filteredOrders = orders;

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrder({ id: selectedOrder.id, orderStatus, status: orderStatus === 'cancelled' ? undefined : orderStatus }).unwrap();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleShipping = async (action: 'create' | 'awb' | 'track') => {
    if (!selectedOrder) return;
    try {
      if (action === 'create') await createShipment(selectedOrder.id).unwrap();
      if (action === 'awb') await assignAwb({ id: selectedOrder.id }).unwrap();
      if (action === 'track') await refreshTracking(selectedOrder.id).unwrap();
      await refetch();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Shiprocket request failed:', error);
    }
  };

  const openRefundModal = (order: Order) => {
    setRefundOrderId(order.id);
    setRefundAmount(String(order.amount));
    setRefundReason('');
  };

  const closeRefundModal = () => {
    setRefundOrderId(null);
    setRefundAmount('');
    setRefundReason('');
  };

  const handleRefund = async () => {
    if (!refundOrderId) return;
    try {
      await refundOrder({ id: refundOrderId, amount: Number(refundAmount), reason: refundReason }).unwrap();
      toast.success('Refund processed successfully');
      closeRefundModal();
      await refetch();
    } catch (error) {
      toast.error('Failed to process refund');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'admin-badge-pending',
      confirmed: 'admin-badge-active',
      completed: 'admin-badge-active',
      cancelled: 'admin-badge-inactive',
    };
    return colors[status] || 'admin-badge-pending';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Orders & Bookings</h1>
      </div>

      {selectedOrder && (
        <div className="card mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Order Details</h2>
              <p className="text-xs text-gray-500">{selectedOrder.orderNumber} • {selectedOrder.customer}</p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="admin-btn admin-btn-secondary">Close</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div><span className="font-semibold text-gray-700">Items:</span> {selectedOrder.items}</div>
            <div><span className="font-semibold text-gray-700">Type:</span> {selectedOrder.type}</div>
            <div><span className="font-semibold text-gray-700">Payment:</span> {selectedOrder.paymentStatus}</div>
            <div><span className="font-semibold text-gray-700">Amount:</span> ₹{selectedOrder.amount.toLocaleString()}</div>
            <div><span className="font-semibold text-gray-700">Date:</span> {selectedOrder.date}</div>
            <div>
              <label className="font-semibold text-gray-700 mr-2">Status:</label>
              <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as Order['status'])} className="admin-input">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <button onClick={handleUpdateOrder} disabled={saving} className="admin-btn admin-btn-primary">
            {saving ? 'Saving...' : 'Update Order'}
          </button>
          <div className="border-t pt-3 space-y-2">
            <h3 className="text-sm font-semibold">Shiprocket shipping</h3>
            {selectedOrder.shipping ? <div className="text-sm text-gray-700 space-y-1">
              <p>Status: {selectedOrder.shipping.status}{selectedOrder.shipping.courierName ? ` • ${selectedOrder.shipping.courierName}` : ''}{selectedOrder.shipping.awbCode ? ` • AWB ${selectedOrder.shipping.awbCode}` : ''}</p>
              <div className="flex flex-wrap gap-2">
                {!selectedOrder.shipping.awbCode && <button onClick={() => handleShipping('awb')} disabled={assigningAwb} className="admin-btn admin-btn-primary">{assigningAwb ? 'Assigning...' : 'Assign AWB & Label'}</button>}
                {selectedOrder.shipping.awbCode && <button onClick={() => handleShipping('track')} disabled={refreshingTracking} className="admin-btn admin-btn-secondary">{refreshingTracking ? 'Refreshing...' : 'Refresh Tracking'}</button>}
                {selectedOrder.shipping.labelUrl && <a href={selectedOrder.shipping.labelUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn-secondary">Open Label</a>}
                {selectedOrder.shipping.trackingUrl && <a href={selectedOrder.shipping.trackingUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn-secondary">Open Tracking</a>}
              </div>
            </div> : <button onClick={() => handleShipping('create')} disabled={creatingShipment} className="admin-btn admin-btn-primary">{creatingShipment ? 'Creating shipment...' : 'Create Shiprocket Shipment'}</button>}
          </div>
        </div>
      )}

      <div className="card mb-4 space-y-3">
        <div className="flex items-center">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input type="text" placeholder="Search by order number or customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm text-gray-700" />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5"><div className="flex items-center gap-2 text-xs text-gray-500"><SlidersHorizontal className="h-4 w-4" />Filters</div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-input"><option value="">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="admin-input"><option value="">All payments</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="admin-input"><option value="">All types</option><option value="product">Products</option><option value="service">Services</option><option value="rental">Rentals</option></select><button type="button" onClick={() => { setSearchTerm(''); setStatusFilter(''); setPaymentFilter(''); setTypeFilter(''); setFrom(''); setTo(''); }} className="admin-btn admin-btn-secondary">Clear filters</button></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><label className="text-xs text-gray-500">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="admin-input mt-1 w-full" /></label><label className="text-xs text-gray-500">To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="admin-input mt-1 w-full" /></label></div>
      </div>

      <div className="card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="font-semibold">{order.orderNumber}</td>
                <td>{order.customer}</td>
                <td className="text-gray-600 text-xs">{order.items}</td>
                <td className="font-medium">₹{order.amount.toLocaleString()}</td>
                <td>
                  <span className={`admin-badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td><Badge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</Badge></td>
                <td className="text-gray-600">{order.date}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => openOrder(order)} className="admin-btn admin-btn-secondary"><Eye className="w-3 h-3" /></button>
                    <button onClick={() => { setSelectedOrder(order); setOrderStatus('cancelled'); }} className="admin-btn admin-btn-danger"><Trash2 className="w-3 h-3" /></button>
                    {order.paymentStatus === 'paid' && (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<RotateCcw size={12} />}
                        onClick={() => openRefundModal(order)}
                      >
                        Refund
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!refundOrderId} onClose={closeRefundModal} title="Process Refund" size="sm">
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>Order ID:</strong> {orders.find(o => o.id === refundOrderId)?.orderNumber || refundOrderId}</p>
            <p><strong>Amount:</strong> ₹{refundAmount}</p>
          </div>
          <Field label="Refund Amount (₹)" required>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="bhn-input"
              min="1"
              max={orders.find(o => o.id === refundOrderId)?.amount || 0}
            />
          </Field>
          <Field label="Reason (optional)">
            <Textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Enter refund reason..."
              rows={3}
            />
          </Field>
        </div>
        <div slot="footer" className="flex justify-end gap-2">
          <Button variant="secondary" onClick={closeRefundModal}>Cancel</Button>
          <Button variant="danger" onClick={handleRefund} loading={refunding}>Process Refund</Button>
        </div>
      </Modal>
    </div>
  );
}
