
import React, { useState, useRef } from 'react';
import { Search, UserPlus, Phone, Mail, Trash2, X, Briefcase, TrendingUp, Calendar as CalendarIcon, History, CheckCircle2, Camera, User } from 'lucide-react';
import { Staff, Appointment, Service, Client } from '../types';
import { formatCurrency, COLORS } from '../utils/helpers';

interface StaffListProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  appointments: Appointment[];
  services: Service[];
  clients: Client[];
}

const StaffList: React.FC<StaffListProps> = ({ staff, setStaff, appointments, services, clients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [historyStaff, setHistoryStaff] = useState<Staff | null>(null);
  const [newStaff, setNewStaff] = useState({ name: '', role: '', phone: '', email: '', color: COLORS[0], photo: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStaff(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.role) return;
    const staffMember: Staff = {
      id: Math.random().toString(36).substr(2, 9),
      ...newStaff,
      createdAt: new Date().toISOString()
    };
    setStaff([...staff, staffMember]);
    setIsAdding(false);
    setNewStaff({ name: '', role: '', phone: '', email: '', color: COLORS[0], photo: '' });
  };

  const removeStaff = (id: string) => {
    if (confirm('Deseja remover este funcionário? O histórico de atendimentos será preservado.')) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  const staffHistory = historyStaff 
    ? appointments
        .filter(a => a.staffId === historyStaff.id && a.status === 'completed')
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
            placeholder="Buscar por nome ou cargo..."
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
          <span>Novo Funcionário</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredStaff.map(member => {
          const memberApts = appointments.filter(a => a.staffId === member.id && a.status === 'completed');
          const revenue = memberApts.reduce((acc, apt) => {
            const service = services.find(s => s.id === apt.serviceId);
            return acc + (service?.price || 0);
          }, 0);

          return (
            <div key={member.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 relative group transition-all hover:shadow-md">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {member.photo ? (
                      <img 
                        src={member.photo} 
                        alt={member.name} 
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 shadow-sm"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-2xl ${member.color} flex items-center justify-center text-rose-600 dark:text-rose-400 font-black text-xl`}>
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{member.name}</h3>
                      <div className="flex items-center text-xs text-rose-500 font-bold uppercase tracking-wider">
                        <Briefcase size={12} className="mr-1" />
                        {member.role}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeStaff(member.id)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Total Atendidos</p>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon size={14} className="text-sky-500" />
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{memberApts.length}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Produção Total</p>
                    <div className="flex items-center space-x-2">
                      <TrendingUp size={14} className="text-emerald-500" />
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(revenue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-48 pt-6 md:pt-0 md:pl-6 md:border-l border-slate-100 dark:border-slate-800 flex flex-col justify-center space-y-3">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Phone size={14} className="mr-2 text-slate-400" />
                  {member.phone}
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Mail size={14} className="mr-2 text-slate-400" />
                  <span className="truncate">{member.email}</span>
                </div>
                <button 
                  onClick={() => setHistoryStaff(member)}
                  className="w-full mt-2 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-600 dark:text-slate-400 hover:text-rose-500 text-xs font-bold rounded-xl transition-all uppercase tracking-wider flex items-center justify-center space-x-2"
                >
                  <History size={14} />
                  <span>Ver Histórico</span>
                </button>
              </div>
            </div>
          );
        })}
        {filteredStaff.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-600 italic">
            Nenhum funcionário encontrado.
          </div>
        )}
      </div>

      {/* History Modal */}
      {historyStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border dark:border-slate-800 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-800 text-white">
              <div className="flex items-center space-x-3">
                {historyStaff.photo ? (
                   <img src={historyStaff.photo} className="w-10 h-10 rounded-xl object-cover" alt="" />
                ) : (
                  <div className={`w-10 h-10 rounded-xl ${historyStaff.color} flex items-center justify-center text-rose-600 font-bold`}>
                    {historyStaff.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-lg leading-none">{historyStaff.name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Histórico de Atendimentos</p>
                </div>
              </div>
              <button onClick={() => setHistoryStaff(null)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {staffHistory.length > 0 ? (
                <div className="space-y-4">
                  {staffHistory.map(apt => {
                    const client = clients.find(c => c.id === apt.clientId);
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
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{client?.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{service?.name}</p>
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
                   <History size={48} className="mb-4 opacity-20" />
                   <p className="font-medium text-sm">Nenhum atendimento concluído encontrado.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
               <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                  Total Produzido: <span className="text-slate-800 dark:text-slate-100 ml-1">{formatCurrency(staffHistory.reduce((acc, apt) => acc + (services.find(s => s.id === apt.serviceId)?.price || 0), 0))}</span>
               </div>
               <button 
                onClick={() => setHistoryStaff(null)}
                className="px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-widest"
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
              <h4 className="font-bold text-lg">Cadastrar Funcionário</h4>
              <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-rose-500 transition-all overflow-hidden relative group"
                >
                  {newStaff.photo ? (
                    <img src={newStaff.photo} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <>
                      <Camera className="text-slate-400 group-hover:text-rose-500 mb-1" size={24} />
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Foto</span>
                    </>
                  )}
                  {newStaff.photo && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={20} />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none dark:text-slate-100"
                  value={newStaff.name}
                  onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">Cargo / Especialidade</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Cabeleireiro Senior"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none dark:text-slate-100 dark:placeholder-slate-600"
                  value={newStaff.role}
                  onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">Telefone</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none dark:text-slate-100"
                    value={newStaff.phone}
                    onChange={e => setNewStaff({...newStaff, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">Cor de Fundo</label>
                  <div className="flex gap-2 mt-2">
                    {COLORS.slice(0, 5).map(c => (
                      <button 
                        key={c}
                        type="button"
                        onClick={() => setNewStaff({...newStaff, color: c})}
                        className={`w-6 h-6 rounded-full ${c} border-2 ${newStaff.color === c ? 'border-rose-500 scale-110' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">E-mail</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none dark:text-slate-100"
                  value={newStaff.email}
                  onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-rose-900/30 hover:bg-rose-600 transition-colors mt-4"
              >
                Cadastrar Profissional
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
