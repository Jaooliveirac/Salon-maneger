
import React from 'react';
import { Appointment, Client, Service } from '../types';
import { Scissors, Users, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface DashboardProps {
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  onNavigate: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ appointments, clients, services, onNavigate }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === today && a.status === 'scheduled');
  
  const totalRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((acc, curr) => {
      const service = services.find(s => s.id === curr.serviceId);
      return acc + (service?.price || 0);
    }, 0);

  const stats = [
    { label: 'Hoje', value: todayAppointments.length, icon: Calendar, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Clientes', value: clients.length, icon: Users, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Serviços', value: services.length, icon: Scissors, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'Receita Total', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors duration-300">
            <div className={`${stat.bg} p-3 rounded-xl`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Próximos Atendimentos</h3>
            <button 
              onClick={() => onNavigate('calendar')}
              className="text-sm text-rose-500 font-semibold hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {todayAppointments.length > 0 ? (
              todayAppointments.sort((a,b) => a.time.localeCompare(b.time)).map((apt) => {
                const client = clients.find(c => c.id === apt.clientId);
                const service = services.find(s => s.id === apt.serviceId);
                return (
                  <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="text-center w-16">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{apt.time}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Hoje</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{client?.name || 'Cliente Desconhecido'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{service?.name}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${service?.color || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {formatCurrency(service?.price || 0)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-slate-400 dark:text-slate-600">
                Nenhum agendamento para hoje.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 transition-colors duration-300">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate('calendar')}
              className="w-full py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-slate-600 dark:text-slate-400 text-sm font-semibold transition-all flex items-center justify-center space-x-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900"
            >
              <Calendar size={18} />
              <span>Novo Agendamento</span>
            </button>
            <button 
              onClick={() => onNavigate('clients')}
              className="w-full py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50 dark:hover:bg-sky-900/10 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl text-slate-600 dark:text-slate-400 text-sm font-semibold transition-all flex items-center justify-center space-x-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-900"
            >
              <Users size={18} />
              <span>Cadastrar Cliente</span>
            </button>
            <button 
              onClick={() => onNavigate('reports')}
              className="w-full py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl text-slate-600 dark:text-slate-400 text-sm font-semibold transition-all flex items-center justify-center space-x-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-900"
            >
              <TrendingUp size={18} />
              <span>Ver Balanço Mensal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
