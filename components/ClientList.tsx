
import React, { useState } from 'react';
import { Search, UserPlus, Phone, Mail, MoreHorizontal, Trash2, X, History, CheckCircle2, Calendar } from 'lucide-react';
import { Client, Appointment, Service } from '../types';
import { formatCurrency } from '../utils/helpers';

interface ClientListProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  appointments: Appointment[];
  services: Service[];
}

const ClientList: React.FC<ClientListProps> = ({ clients, setClients, appointments, services }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '' });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    const client: Client = {
      id: Math.random().toString(36).substr(2, 9),
      ...newClient,
      createdAt: new Date().toISOString()
    };
    setClients([...clients, client]);
    setIsAdding(false);
    setNewClient({ name: '', phone: '', email: '' });
  };

  const removeClient = (id: string) => {
    if (confirm('Deseja remover este cliente? Histórico de agendamentos não será excluído.')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const clientHistory = historyClient 
    ? appointments
        .filter(a => a.clientId === historyClient.id && a.status === 'completed')
        .sort((a, b) => {
          const dateComp = b.date.localeCompare(a.date);
          return dateComp !== 0 ? dateComp : b.time.localeCompare(a.time);
        })
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-slate-100 dark:placeholder-slate-600 transition-colors"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center space-x-2 bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-rose-900/30 hover:bg-rose-600 transition-all"
        >
          <UserPlus size={20} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Contato</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Total Atendimentos</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredClients.map(client => {
                const clientApts = appointments.filter(a => a.clientId === client.id);
                return (
                  <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-rose-500 dark:text-rose-400 font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{client.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Cliente desde {new Date(client.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Phone size={14} className="mr-2 text-slate-400 dark:text-slate-600" /> {client.phone}
                        </div>
                        {client.email && (
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Mail size={14} className="mr-2 text-slate-400 dark:text-slate-600" /> {client.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full text-xs font-bold">
                        {clientApts.length} atendimentos
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => setHistoryClient(client)}
                          className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                          title="Ver Histórico"
                        >
                          <History size={18} />
                        </button>
                        <button onClick={() => removeClient(client.id)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-600 italic">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {historyClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border dark:border-slate-800 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-rose-500 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  {historyClient.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-none">{historyClient.name}</h4>
                  <p className="text-[10px] text-rose-100 uppercase tracking-widest mt-1">Histórico de Atendimentos</p>
                </div>
              </div>
              <button onClick={() => setHistoryClient(null)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {clientHistory.length > 0 ? (
                <div className="space-y-4">
                  {clientHistory.map(apt => {
                    const service = services.find(s => s.id === apt.serviceId);
                    return (
                      <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center space-x-4">
                           <div className="text-center w-20">
                              <p className="text-xs font-black text-slate-800 dark:text-slate-100">{new Date(apt.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">{apt.time}</p>
                           </div>
                           <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                           <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{service?.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Concluído</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(service?.price || 0)}</p>
                           <div className="flex items-center justify-end space-x-1 text-[10px] text-slate-400 font-bold uppercase">
                              <CheckCircle2 size={10} className="text-emerald-500" />
                              <span>{apt.paymentMethod || 'Pago'}</span>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
                   <Calendar size={48} className="mb-4 opacity-20" />
                   <p className="font-medium text-sm">Nenhum atendimento concluído encontrado para este cliente.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
               <button 
                onClick={() => setHistoryClient(null)}
                className="px-6 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition-colors uppercase tracking-widest"
               >
                 Fechar
               </button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-rose-500 text-white">
              <h4 className="font-bold text-lg">Cadastrar Cliente</h4>
              <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddClient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none dark:text-slate-100"
                  value={newClient.name}
                  onChange={e => setNewClient({...newClient, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">Telefone (WhatsApp)</label>
                <input 
                  type="tel" 
                  required
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none dark:text-slate-100 dark:placeholder-slate-600"
                  value={newClient.phone}
                  onChange={e => setNewClient({...newClient, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">E-mail</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none dark:text-slate-100"
                  value={newClient.email}
                  onChange={e => setNewClient({...newClient, email: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-rose-900/30 hover:bg-rose-600 transition-colors mt-4"
              >
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
