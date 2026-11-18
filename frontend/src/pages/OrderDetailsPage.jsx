import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  CreditCard,
  ArrowLeft,
  XCircle,
  AlertCircle
} from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleSimulatePayment = async () => {
    try {
      const res = await API.put(`/orders/${id}/pay`);
      if (res.data.success) {
        showToast('Simulated payment received! Order confirmed.', 'success');
        fetchOrder();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment simulation failed';
      showToast(msg, 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
        <Link to="/orders" className="mt-4 inline-block px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
          Back to Orders
        </Link>
      </div>
    );
  }

  const milestones = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStep = milestones.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link & Header */}
      <div>
        <Link
          to="/orders"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
            Status: {order.orderStatus}
          </span>
        </div>
      </div>

      {/* Visual Tracking Milestones */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-6">Delivery Progress</h3>
        {isCancelled ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-medium">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>This order was cancelled. Any authorized payments have been refunded.</span>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2 relative">
            {milestones.map((milestone, idx) => {
              const isCompleted = currentStep >= idx;
              const isCurrent = currentStep === idx;
              return (
                <div key={milestone} className="flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition duration-300 ${
                      isCompleted
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-2 ${
                      isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {milestone}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Info & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Ordered Items</h3>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.name}</p>
                      <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline notes */}
          {order.statusTimeline && order.statusTimeline.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900">Activity Log</h3>
              <div className="space-y-3">
                {order.statusTimeline.map((tl, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1 shrink-0"></div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {tl.status} - <span className="font-normal text-slate-400">{new Date(tl.timestamp).toLocaleString()}</span>
                      </p>
                      {tl.note && <p className="text-slate-500 mt-0.5">{tl.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Shipping & Payment Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-600">
              <MapPin className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Delivery Address</h4>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
              <p className="pt-1 text-slate-500">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Payment Status & Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <CreditCard className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Payment Summary</h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Method</span>
                <span className="font-semibold text-slate-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Status</span>
                <span className={`font-bold ${order.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-indigo-600">${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            {!order.isPaid && order.orderStatus !== 'Cancelled' && (
              <button
                onClick={handleSimulatePayment}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Simulate Online Payment Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
