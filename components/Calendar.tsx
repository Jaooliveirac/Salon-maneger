
import React, { useState, useMemo } from 'react';
/* Added Clock and MessageSquare to the imports from lucide-react */
import { ChevronLeft, ChevronRight, Plus, X, MessageSquare, Trash2, CheckCircle, Lock, Calendar as CalendarIcon, CreditCard, Banknote, QrCode, User, Check, Search, List, Grid3X3, Clock } from 'lucide-react';
import { Client, Service, Appointment, Staff } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, formatDate, formatCurrency, generateWhatsAppLink } from '../utils/helpers';

interface CalendarProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  clients: Client[];
  services: Service[];
  staff: Staff[];
  salonName: string;
  salonAddress: string;
}

const Calendar: React.FC<CalendarProps> = ({ appointments, setAppointments, clients, services, staff, salonName, salonAddress }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Search state for client selection
  const [clientSearch, setClientSearch] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);

  // Form state
  const [newApt, setNewApt] = useState<Partial<Appointment>>({
    clientId: '',
    serviceId: '',
    staffId: '',
    time: '09:00',
    status: 'scheduled',
    notes: '',
    paymentMethod: 'Pix'
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Gerar horários de 30 em 30 minutos
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 7; h <= 21; h++) {
      const hour = h.toString().padStart(2, '0');
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  }, []);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  const dayCells = [];
  for (let i = 0; i < firstDay; i++) {
    dayCells.push(<div key={`empty-${i}`} className="h-24 lg:h-32 bg-slate-50/50 dark:bg-slate-900/50"></div>);
  }

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.clientId && newApt.status !== 'blocked') return;
    
    const appointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: newApt.clientId || 'system-block',
      serviceId: newApt.serviceId || 'block',
      staffId: newApt.staffId || 'block',
      date: selectedDate,
      time: newApt.time || '09:00',
      status: (newApt.status as any) || 'scheduled',
      notes: newApt.notes,
      paymentMethod: (newApt.paymentMethod as any)
    };

    setAppointments(prev => [...prev, appointment]);
    setIsModalOpen(false);
    resetForm();
    setViewMode('list');
  };

  const resetForm = () => {
    setNewApt({ clientId: '', serviceId: '', staffId: staff[0]?.id || '', time: '09:00', status: 'scheduled', paymentMethod: 'Pix' });
    setClientSearch('');
    setShowClientResults(false);
  };

  const handleGridCellClick = (time: string, staffId: string) => {
    const existing = appointments.find(a => a.date === selectedDate && a.time === time && a.staffId === staffId);
    if (existing) return;

    setNewApt({ ...newApt, time, staffId, status: 'scheduled' });
    setIsModalOpen(true);
  };

  const cancelAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const completeAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a));
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };

  const handleWhatsAppConfirm = (apt: Appointment) => {
    const client = clients.find(c => c.id === apt.clientId);
    const service = services.find(s => s.id === apt.serviceId);
    const professional = staff.find(s => s.id === apt.staffId);
    
    if (!client) return;

    // Formatar data para DD/MM/YYYY
    const dateObj = new Date(apt.date + 'T12:00:00');
    const formattedDate = dateObj.toLocaleDateString('pt-BR');

    const message = `Olá ${client.name}, confirmamos seu horário no ${salonName} em ${formattedDate} às ${apt.time} com o/a profissional ${professional?.name} para ${service?.name}.`;
    
    window.open(generateWhatsAppLink(client.phone, message), '_blank');
  };

  const dayApts = appointments.filter(a => a.date === selectedDate);
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.phone.includes(clientSearch)
  );
  const selectedClient = clients.find(c => c.id === newApt.clientId);

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Success Toast */}
      {showFeedback && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 z-[150] animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-white/20 p-1 rounded-full"><Check size={16} /></div>
          <span className="font-bold text-sm">Marcado como concluído</span>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{monthNames[month]} {year}</h2>
          <div className="flex space-x-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg dark:text-slate-400"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold dark:text-slate-400">Hoje</button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg dark:text-slate-400"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <span key={d} className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {dayCells}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(new Date(year, month, day));
            const isToday = formatDate(new Date()) === dateStr;
            const isSelected = selectedDate === dateStr;
            const count = appointments.filter(a => a.date === dateStr).length;

            return (
              <div 
                key={day} 
                onClick={() => setSelectedDate(dateStr)}
                className={`h-24 lg:h-32 border-b border-r border-slate-50 dark:border-slate-800 cursor-pointer transition-all flex flex-col p-2 group ${
                  isSelected ? 'bg-rose-50 dark:bg-rose-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-rose-500 text-white' : isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {day}
                  </span>
                  {count > 0 && (
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md font-bold group-hover:bg-rose-200 dark:group-hover:bg-rose-900">
                      {count}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {appointments.filter(a => a.date === dateStr).slice(0, 3).map(a => (
                    <div key={a.id} className={`text-[10px] truncate px-1 rounded border ${a.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                      {a.time} - {a.status === 'blocked' ? 'Bloqueado' : clients.find(c => c.id === a.clientId)?.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Details Sidebar with WhatsApp Integration */}
      <div className="w-full lg:w-[480px] bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[600px] transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Agenda do Dia</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
            </div>
            <div className="flex flex-col items-end space-y-3">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}
                  title="Ver Lista"
                >
                  <List size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}
                  title="Ver Grade"
                >
                  <Grid3X3 size={18} />
                </button>
              </div>
              
              <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-rose-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 dark:shadow-rose-950/20 whitespace-nowrap flex items-center space-x-2"
              >
                <Plus size={14} strokeWidth={3} />
                <span>Novo Agendamento</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {viewMode === 'list' ? (
            <div className="p-4 space-y-3">
              {dayApts.length > 0 ? (
                dayApts.sort((a,b) => a.time.localeCompare(b.time)).map(apt => {
                  const client = clients.find(c => c.id === apt.clientId);
                  const service = services.find(s => s.id === apt.serviceId);
                  const professional = staff.find(s => s.id === apt.staffId);
                  const isCompleted = apt.status === 'completed';

                  return (
                    <div key={apt.id} className={`p-4 rounded-2xl border transition-all group ${isCompleted ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-400">{apt.time}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{apt.status === 'blocked' ? 'Bloqueado' : client?.name}</span>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {apt.status !== 'blocked' && (
                            <button 
                              onClick={() => handleWhatsAppConfirm(apt)} 
                              className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-lg"
                              title="Confirmar via WhatsApp"
                            >
                              <MessageSquare size={16} />
                            </button>
                          )}
                          {apt.status !== 'blocked' && !isCompleted && (
                            <button onClick={() => completeAppointment(apt.id)} className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle size={16} /></button>
                          )}
                          <button onClick={() => cancelAppointment(apt.id)} className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      {apt.status !== 'blocked' && (
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                           <span>{service?.name} • {professional?.name}</span>
                           <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(service?.price || 0)}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 text-slate-300"><CalendarIcon size={48} className="mx-auto mb-2 opacity-20" /><p>Nenhum agendamento</p></div>
              )}
            </div>
          ) : (
            <div className="p-0 h-full flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-20 bg-white dark:bg-slate-900 shadow-sm">
                    <tr>
                      <th className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 w-16 text-[10px] font-black uppercase text-slate-400">Hora</th>
                      {staff.map(s => (
                        <th key={s.id} className="p-2 border-b border-slate-100 dark:border-slate-800 min-w-[100px] text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">
                          <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full mb-1 ${s.color} flex items-center justify-center text-[8px]`}>{s.name[0]}</div>
                            <span className="truncate w-full text-center">{s.name.split(' ')[0]}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(slot => (
                      <tr key={slot} className="group">
                        <td className="p-2 text-center text-[11px] font-bold text-slate-400 border-r border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">{slot}</td>
                        {staff.map(s => {
                          const apt = appointments.find(a => a.date === selectedDate && a.time === slot && a.staffId === s.id);
                          const isOccupied = !!apt;
                          
                          return (
                            <td 
                              key={`${slot}-${s.id}`} 
                              onClick={() => handleGridCellClick(slot, s.id)}
                              className={`p-1 border-b border-r border-slate-50 dark:border-slate-800 h-12 relative cursor-pointer transition-all ${
                                isOccupied ? 'bg-slate-50 dark:bg-slate-800/20' : 'hover:bg-rose-50 dark:hover:bg-rose-900/10'
                              }`}
                            >
                              {isOccupied ? (
                                <div className={`h-full w-full rounded-lg p-1 text-[8px] flex flex-col justify-center border relative group/slot ${
                                  apt.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700' : 'bg-white dark:bg-slate-700 border-slate-200 text-slate-600 dark:text-slate-300 shadow-sm'
                                }`}>
                                  <span className="font-bold truncate">{apt.status === 'blocked' ? 'BLOQUEADO' : clients.find(c => c.id === apt.clientId)?.name}</span>
                                  {apt.status !== 'blocked' && <span className="opacity-70">{services.find(serv => serv.id === apt.serviceId)?.name}</span>}
                                  
                                  {/* WhatsApp Quick Action on Grid */}
                                  {apt.status !== 'blocked' && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleWhatsAppConfirm(apt); }}
                                      className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1 rounded-full opacity-0 group-hover/slot:opacity-100 transition-opacity shadow-sm"
                                    >
                                      <MessageSquare size={8} />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <Plus size={14} className="text-rose-300" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal (Details Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-rose-500 text-white">
              <h4 className="font-bold text-lg">Finalizar Agendamento</h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 mb-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-xl"><Clock size={16} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Horário e Profissional</p>
                    <div className="flex space-x-2 mt-1">
                      <select 
                        className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 dark:text-slate-100 focus:ring-0 outline-none"
                        value={newApt.time}
                        onChange={e => setNewApt({...newApt, time: e.target.value})}
                      >
                        {timeSlots.map(t => <option key={t} value={t} className="bg-white dark:bg-slate-800">{t}</option>)}
                      </select>
                      <span className="text-slate-400">com</span>
                      <select 
                        className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 dark:text-slate-100 focus:ring-0 outline-none"
                        value={newApt.staffId}
                        onChange={e => setNewApt({...newApt, staffId: e.target.value})}
                      >
                        {staff.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-slate-800">{s.name}</option>)}
                        {staff.length === 0 && <option value="">Nenhum Profissional</option>}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">Cliente</label>
                  <div className="relative">
                    <input 
                      type="text" required placeholder="Buscar cliente..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-slate-100"
                      value={selectedClient ? selectedClient.name : clientSearch}
                      onChange={(e) => { setClientSearch(e.target.value); setNewApt(prev => ({ ...prev, clientId: '' })); setShowClientResults(true); }}
                      onFocus={() => setShowClientResults(true)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                  {showClientResults && !selectedClient && clientSearch.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                       {filteredClients.map(c => (
                         <button key={c.id} type="button" onClick={() => { setNewApt(prev => ({ ...prev, clientId: c.id })); setShowClientResults(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex flex-col border-b border-slate-50 dark:border-slate-700 last:border-0">
                            <span className="font-bold text-slate-800 dark:text-slate-100">{c.name}</span>
                            <span className="text-[10px] text-slate-400">{c.phone}</span>
                         </button>
                       ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">Serviço</label>
                  <select 
                    required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-slate-100"
                    value={newApt.serviceId}
                    onChange={e => setNewApt({...newApt, serviceId: e.target.value})}
                  >
                    <option value="">Selecione o serviço...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">Pagamento</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    {['Dinheiro', 'Cartão', 'Pix'].map(m => (
                      <button key={m} type="button" onClick={() => setNewApt({...newApt, paymentMethod: m as any})} className={`py-2 text-[10px] font-bold rounded-lg transition-all ${newApt.paymentMethod === m ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500'}`}>{m}</button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-rose-900/30 hover:bg-rose-600 transition-colors mt-4">Confirmar Agendamento</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
