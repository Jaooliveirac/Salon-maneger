
import React, { useState } from 'react';
// Added Calendar as CalendarIcon to the imports
import { ChevronLeft, ChevronRight, Plus, X, MessageSquare, Trash2, CheckCircle, Lock, Calendar as CalendarIcon, CreditCard, Banknote, QrCode } from 'lucide-react';
import { Client, Service, Appointment } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, formatDate, formatCurrency, generateWhatsAppLink } from '../utils/helpers';

interface CalendarProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  clients: Client[];
  services: Service[];
}

const Calendar: React.FC<CalendarProps> = ({ appointments, setAppointments, clients, services }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [newApt, setNewApt] = useState<Partial<Appointment>>({
    clientId: '',
    serviceId: '',
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

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  const dayCells = [];
  for (let i = 0; i < firstDay; i++) {
    dayCells.push(<div key={`empty-${i}`} className="h-24 lg:h-32 bg-slate-50/50"></div>);
  }

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.clientId && newApt.status !== 'blocked') return;
    
    const appointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: newApt.clientId || 'system-block',
      serviceId: newApt.serviceId || 'block',
      date: selectedDate,
      time: newApt.time || '09:00',
      status: (newApt.status as any) || 'scheduled',
      notes: newApt.notes,
      paymentMethod: (newApt.paymentMethod as any)
    };

    setAppointments(prev => [...prev, appointment]);
    setIsModalOpen(false);
    setNewApt({ clientId: '', serviceId: '', time: '09:00', status: 'scheduled', paymentMethod: 'Pix' });
  };

  const cancelAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const completeAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a));
  };

  const dayApts = appointments.filter(a => a.date === selectedDate);

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Calendar Grid */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{monthNames[month]} {year}</h2>
          <div className="flex space-x-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 hover:bg-slate-100 rounded-lg text-sm font-semibold">Hoje</button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center py-3 bg-slate-50 border-b border-slate-100">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <span key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</span>
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
                className={`h-24 lg:h-32 border-b border-r border-slate-50 cursor-pointer transition-all flex flex-col p-2 group ${
                  isSelected ? 'bg-rose-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-rose-500 text-white' : isSelected ? 'text-rose-600' : 'text-slate-600'
                  }`}>
                    {day}
                  </span>
                  {count > 0 && (
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md font-bold group-hover:bg-rose-200 group-hover:text-rose-700">
                      {count}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {appointments.filter(a => a.date === dateStr).slice(0, 3).map(a => (
                    <div key={a.id} className="text-[10px] truncate px-1 rounded bg-white border border-slate-100 text-slate-500">
                      {a.time} - {a.status === 'blocked' ? 'Bloqueado' : clients.find(c => c.id === a.clientId)?.name}
                    </div>
                  ))}
                  {count > 3 && <div className="text-[9px] text-center text-slate-400">+{count - 3} mais</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Details Sidebar */}
      <div className="w-full lg:w-96 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">Horários</h3>
            <p className="text-xs text-slate-500">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200 hover:scale-105 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {dayApts.length > 0 ? (
            dayApts.sort((a,b) => a.time.localeCompare(b.time)).map(apt => {
              const client = clients.find(c => c.id === apt.clientId);
              const service = services.find(s => s.id === apt.serviceId);
              const isBlocked = apt.status === 'blocked';

              return (
                <div key={apt.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 group hover:border-rose-200 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-400">{apt.time}</span>
                      {isBlocked ? (
                        <span className="flex items-center space-x-1 text-slate-600 font-bold text-sm">
                          <Lock size={14} /> <span>Indisponível</span>
                        </span>
                      ) : (
                        <span className="font-bold text-slate-800">{client?.name}</span>
                      )}
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isBlocked && (
                        <>
                          <a 
                            href={generateWhatsAppLink(client?.phone || '', `Olá ${client?.name}, confirmamos seu horário no Glamour Salon em ${new Date(apt.date).toLocaleDateString()} às ${apt.time} para ${service?.name}.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-lg"
                            title="Confirmar via WhatsApp"
                          >
                            <MessageSquare size={16} />
                          </a>
                          <button 
                            onClick={() => completeAppointment(apt.id)}
                            className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg"
                            title="Marcar como Concluído"
                          >
                            <CheckCircle size={16} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => cancelAppointment(apt.id)}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg"
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {!isBlocked && (
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${service?.color || 'bg-slate-300'}`}></div>
                          <span className="text-xs text-slate-500 uppercase tracking-wider">{service?.name}</span>
                        </div>
                        {apt.paymentMethod && (
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="text-[10px] text-slate-400 font-medium">Pagamento: {apt.paymentMethod}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{formatCurrency(service?.price || 0)}</span>
                    </div>
                  )}
                  {apt.notes && <p className="mt-2 text-[10px] text-slate-400 italic">"{apt.notes}"</p>}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 py-10">
              <CalendarIcon size={48} strokeWidth={1} />
              <p className="mt-2 text-sm">Sem agendamentos</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-500 text-white">
              <h4 className="font-bold text-lg">Novo Registro</h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Tipo</label>
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setNewApt({...newApt, status: 'scheduled'})}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newApt.status !== 'blocked' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                    >
                      Agendamento
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewApt({...newApt, status: 'blocked'})}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newApt.status === 'blocked' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                    >
                      Bloqueio
                    </button>
                  </div>
                </div>

                {newApt.status !== 'blocked' && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Cliente</label>
                      <select 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        value={newApt.clientId}
                        onChange={e => setNewApt({...newApt, clientId: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Serviço</label>
                      <select 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        value={newApt.serviceId}
                        onChange={e => setNewApt({...newApt, serviceId: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>)}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Forma de Pagamento</label>
                      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                        {[
                          { id: 'Dinheiro', icon: Banknote },
                          { id: 'Cartão', icon: CreditCard },
                          { id: 'Pix', icon: QrCode }
                        ].map((method) => (
                          <button 
                            key={method.id}
                            type="button"
                            onClick={() => setNewApt({...newApt, paymentMethod: method.id as any})}
                            className={`flex items-center justify-center space-x-2 py-2 text-[10px] font-bold rounded-lg transition-all ${newApt.paymentMethod === method.id ? 'bg-white shadow-sm text-rose-500' : 'text-slate-500 hover:bg-white/50'}`}
                          >
                            <method.icon size={14} />
                            <span>{method.id}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Horário</label>
                  <input 
                    type="time" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                    value={newApt.time}
                    onChange={e => setNewApt({...newApt, time: e.target.value})}
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Observações</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm h-20 resize-none"
                    placeholder="Detalhes opcionais..."
                    value={newApt.notes}
                    onChange={e => setNewApt({...newApt, notes: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors"
              >
                Confirmar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
