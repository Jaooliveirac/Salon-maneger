
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Appointment, Service, Client } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Users, TrendingUp, Calendar, Filter, Star, Scissors } from 'lucide-react';

interface ReportsProps {
  appointments: Appointment[];
  services: Service[];
  clients: Client[];
}

type PeriodType = 'week' | 'month' | 'all';

const Reports: React.FC<ReportsProps> = ({ appointments, services, clients }) => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  // Filter appointments based on period
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter(a => {
      if (a.status !== 'completed') return false;
      if (serviceFilter !== 'all' && a.serviceId !== serviceFilter) return false;
      
      const aptDate = new Date(a.date);
      if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return aptDate >= weekAgo;
      }
      if (period === 'month') {
        return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [appointments, period, serviceFilter]);

  // Aggregate data for services
  const serviceStats = useMemo(() => {
    return services.map(s => {
      const count = filteredAppointments.filter(a => a.serviceId === s.id).length;
      return { 
        id: s.id,
        name: s.name, 
        count, 
        revenue: count * s.price,
        color: s.color 
      };
    }).filter(s => s.count > 0).sort((a, b) => b.revenue - a.revenue);
  }, [services, filteredAppointments]);

  // Client Insights
  const clientInsights = useMemo(() => {
    const insights = clients.map(client => {
      const clientApts = appointments.filter(a => a.clientId === client.id && a.status === 'completed');
      const totalSpend = clientApts.reduce((acc, apt) => {
        const service = services.find(s => s.id === apt.serviceId);
        return acc + (service?.price || 0);
      }, 0);
      
      const serviceCounts = clientApts.reduce((acc, apt) => {
        acc[apt.serviceId] = (acc[apt.serviceId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Fix: Cast explicitly to number to satisfy TypeScript arithmetic check for b[1] - a[1]
      const favoriteServiceId = Object.entries(serviceCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0];
      const favoriteService = services.find(s => s.id === favoriteServiceId)?.name || 'Nenhum';

      return {
        id: client.id,
        name: client.name,
        frequency: clientApts.length,
        totalSpend,
        favoriteService
      };
    }).filter(c => c.frequency > 0);

    return {
      topByFrequency: [...insights].sort((a, b) => b.frequency - a.frequency).slice(0, 5),
      topBySpend: [...insights].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5)
    };
  }, [clients, appointments, services]);

  // Time-series data for chart
  const timeSeriesData = useMemo(() => {
    const dataMap: Record<string, { date: string, label: string, revenue: number, count: number }> = {};
    
    filteredAppointments.forEach(apt => {
      const service = services.find(s => s.id === apt.serviceId);
      const rev = service?.price || 0;
      if (!dataMap[apt.date]) {
        dataMap[apt.date] = { 
          date: apt.date, 
          label: new Date(apt.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          revenue: 0, 
          count: 0 
        };
      }
      dataMap[apt.date].revenue += rev;
      dataMap[apt.date].count += 1;
    });

    return Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredAppointments, services]);

  const PIE_COLORS = ['#f43f5e', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
  const totalRevenue = filteredAppointments.reduce((acc, apt) => {
    const service = services.find(s => s.id === apt.serviceId);
    return acc + (service?.price || 0);
  }, 0);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header & Global Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatórios Detalhados</h2>
          <p className="text-slate-500 text-sm">Acompanhe a performance financeira e o engajamento dos clientes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${period === 'week' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-500'}`}
            >
              Semanal
            </button>
            <button 
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${period === 'month' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-500'}`}
            >
              Mensal
            </button>
            <button 
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${period === 'all' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-500'}`}
            >
              Tudo
            </button>
          </div>
          <select 
            className="bg-slate-100 text-xs font-bold rounded-xl px-4 py-2 text-slate-600 outline-none border-none focus:ring-2 focus:ring-rose-500"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            <option value="all">Todos os Serviços</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Main Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-3xl text-white shadow-lg shadow-rose-200">
          <TrendingUp className="mb-4 opacity-80" size={28} />
          <p className="text-rose-100 text-sm font-medium uppercase tracking-wider">Faturamento no Período</p>
          <p className="text-3xl font-black mt-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-rose-100 text-xs mt-4">Baseado em {filteredAppointments.length} atendimentos</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <Calendar className="text-sky-500 mb-4" size={28} />
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Média por Dia</p>
          <p className="text-3xl font-black text-slate-800 mt-1">
            {formatCurrency(timeSeriesData.length > 0 ? totalRevenue / timeSeriesData.length : 0)}
          </p>
          <p className="text-slate-400 text-xs mt-4">Ativo por {timeSeriesData.length} dias</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <Users className="text-violet-500 mb-4" size={28} />
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Ticket Médio</p>
          <p className="text-3xl font-black text-slate-800 mt-1">
            {formatCurrency(filteredAppointments.length > 0 ? totalRevenue / filteredAppointments.length : 0)}
          </p>
          <p className="text-slate-400 text-xs mt-4">Gasto médio por cliente</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
            <TrendingUp size={18} className="text-rose-500" />
            Evolução Financeira
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
            <Scissors size={18} className="text-violet-500" />
            Serviços Mais Realizados
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {serviceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
            {serviceStats.map((s, i) => (
              <div key={s.name} className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: PIE_COLORS[i % PIE_COLORS.length]}}></div>
                <span className="text-xs font-medium text-slate-600">{s.name} ({s.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Star size={18} className="text-amber-500" />
              Top Clientes (Frequência)
            </h3>
            <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-1 rounded-full font-bold uppercase">Mais Fiéis</span>
          </div>
          <div className="divide-y divide-slate-100">
            {clientInsights.topByFrequency.map((client, i) => (
              <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-200">
                    {i + 1}º
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{client.name}</p>
                    <p className="text-[10px] text-slate-400">Gosta de: <span className="text-rose-400 font-semibold">{client.favoriteService}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">{client.frequency} visitas</p>
                  <p className="text-[10px] text-slate-400">Total: {formatCurrency(client.totalSpend)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              Top Clientes (Faturamento)
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full font-bold uppercase">Maiores Gastos</span>
          </div>
          <div className="divide-y divide-slate-100">
            {clientInsights.topBySpend.map((client, i) => (
              <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-200">
                    {i + 1}º
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{client.name}</p>
                    <p className="text-[10px] text-slate-400">Freq: {client.frequency} atendimentos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-600">{formatCurrency(client.totalSpend)}</p>
                  <p className="text-[10px] text-slate-400">Ticket: {formatCurrency(client.totalSpend / client.frequency)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Service Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Performance por Serviço</h3>
          <p className="text-xs text-slate-400 mt-1">Análise detalhada de rentabilidade e volume.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-8 py-4">Serviço</th>
                <th className="px-8 py-4">Volume</th>
                <th className="px-8 py-4">Faturamento</th>
                <th className="px-8 py-4">% Total</th>
                <th className="px-8 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {serviceStats.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${s.color}`}></div>
                      <span className="font-bold text-slate-700">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 font-medium">{s.count} vezes</td>
                  <td className="px-8 py-5 font-black text-slate-800">{formatCurrency(s.revenue)}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[80px] overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${(s.revenue / totalRevenue) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{Math.round((s.revenue / totalRevenue) * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${s.count > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {s.count > 5 ? 'ALTA DEMANDA' : 'ESTÁVEL'}
                    </span>
                  </td>
                </tr>
              ))}
              {serviceStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-400 italic">
                    Nenhum dado disponível para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
