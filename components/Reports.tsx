
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
import { Appointment, Service, Client, Staff } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Users, TrendingUp, Calendar, Filter, Star, Scissors, UserCheck } from 'lucide-react';

interface ReportsProps {
  appointments: Appointment[];
  services: Service[];
  clients: Client[];
  staff: Staff[];
}

type PeriodType = 'week' | 'month' | 'all';

const Reports: React.FC<ReportsProps> = ({ appointments, services, clients, staff }) => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');

  // Filter appointments based on period, service and staff
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter(a => {
      if (a.status !== 'completed') return false;
      if (serviceFilter !== 'all' && a.serviceId !== serviceFilter) return false;
      if (staffFilter !== 'all' && a.staffId !== staffFilter) return false;
      
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
  }, [appointments, period, serviceFilter, staffFilter]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Relatórios de Performance</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Filtre por período, serviço ou funcionário para análise profunda.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['week', 'month', 'all'].map((p) => (
              <button 
                key={p}
                onClick={() => setPeriod(p as PeriodType)}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all ${period === p ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-500' : 'text-slate-500'}`}
              >
                {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Tudo'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <select 
              className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded-xl px-4 py-2 text-slate-600 dark:text-slate-300 outline-none border-none focus:ring-2 focus:ring-rose-500 uppercase tracking-widest"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <option value="all">Todos Profissionais</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select 
              className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded-xl px-4 py-2 text-slate-600 dark:text-slate-300 outline-none border-none focus:ring-2 focus:ring-rose-500 uppercase tracking-widest"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="all">Todos Serviços</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-800 p-6 rounded-3xl text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
          <TrendingUp className="mb-4 opacity-80" size={28} />
          <p className="text-rose-100 text-[10px] font-bold uppercase tracking-wider">Faturamento</p>
          <p className="text-3xl font-black mt-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-rose-100 text-[10px] mt-4 font-medium italic opacity-80">
            {staffFilter !== 'all' ? `Produzido por ${staff.find(s => s.id === staffFilter)?.name}` : 'Produção total do salão'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <UserCheck className="text-sky-500 mb-4" size={28} />
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Ticket Médio</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">
            {formatCurrency(filteredAppointments.length > 0 ? totalRevenue / filteredAppointments.length : 0)}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-4 font-medium uppercase tracking-widest">{filteredAppointments.length} atendimentos</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <Calendar className="text-violet-500 mb-4" size={28} />
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Média Diária</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">
            {formatCurrency(timeSeriesData.length > 0 ? totalRevenue / timeSeriesData.length : 0)}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-4 font-medium uppercase tracking-widest">Baseado em {timeSeriesData.length} dias ativos</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
            <TrendingUp size={18} className="text-rose-500" />
            Evolução de Ganhos
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
            <Scissors size={18} className="text-violet-500" />
            Mix de Serviços Realizados
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
                   contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
            {serviceStats.map((s, i) => (
              <div key={s.name} className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: PIE_COLORS[i % PIE_COLORS.length]}}></div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{s.name} ({s.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
