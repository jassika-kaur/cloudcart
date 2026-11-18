import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Eye
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import API from '../../services/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await API.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${Number(stats.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-emerald-500 text-emerald-500',
      bgLight: 'bg-emerald-50'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500 text-blue-500',
      bgLight: 'bg-blue-50'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-purple-500 text-purple-500',
      bgLight: 'bg-purple-50'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-amber-500 text-amber-500',
      bgLight: 'bg-amber-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Executive Overview</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time metrics, revenue performance, order fulfillments, and inventory warnings.
        </p>
      </div>

      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.bgLight} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${card.color.split(' ')[1]}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Monthly Revenue Chart (Recharts) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue & Sales Trends</h3>
            <p className="text-xs text-slate-400">Monthly gross sales trajectory</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% MoM
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.monthlySales || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#7c3aed"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Recent Orders & Low Stock Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Order #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{order.orderNumber}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{order.user?.name || 'Customer'}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">${Number(order.totalAmount).toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link to="/admin/orders" className="text-purple-600 hover:text-purple-800">
                        <Eye className="w-4 h-4 ml-auto" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low-Stock Inventory Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Low-Stock Warnings</h3>
          </div>

          <div className="space-y-3">
            {(!data?.lowStockProducts || data.lowStockProducts.length === 0) ? (
              <p className="text-xs text-slate-400 py-4 text-center">All inventory levels are healthy.</p>
            ) : (
              data.lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/40 border border-amber-200/60">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images && p.images[0]}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[140px] sm:max-w-xs">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.categoryName}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-extrabold">
                    {p.stock} units left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
