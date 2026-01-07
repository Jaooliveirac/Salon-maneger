
import React, { useState } from 'react';
import { Plus, Scissors, Clock, DollarSign, Trash2 } from 'lucide-react';
import { Service } from '../types';
import { formatCurrency, COLORS } from '../utils/helpers';

interface ServiceListProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, setServices }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    duration: 60,
    price: 0,
    color: COLORS[0]
  });

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const service: Service = {
      id: Math.random().toString(36).substr(2, 9),
      name: newService.name!,
      duration: Number(newService.duration),
      price: Number(newService.price),
      color: newService.color!
    };
    setServices([...services, service]);
    setIsAdding(false);
    setNewService({ name: '', duration: 60, price: 0, color: COLORS[0] });
  };

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cardápio de Serviços</h2>
          <p className="text-slate-500 text-sm">Gerencie o que seu salão oferece aos clientes.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-rose-200 flex items-center space-x-2 hover:scale-105 transition-all"
        >
          <Plus size={20} />
          <span>Novo Serviço</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative group transition-all hover:shadow-md">
            <div className={`w-12 h-12 rounded-2xl ${service.color} flex items-center justify-center mb-4`}>
              <Scissors size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{service.name}</h3>
            
            <div className="flex space-x-4 mb-6">
              <div className="flex items-center text-xs text-slate-500">
                <Clock size={14} className="mr-1 text-slate-400" />
                {service.duration} min
              </div>
              <div className="flex items-center text-xs text-slate-500">
                <DollarSign size={14} className="mr-1 text-slate-400" />
                Preço Base
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-2xl font-black text-rose-500">{formatCurrency(service.price)}</span>
              <button 
                onClick={() => removeService(service.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-500 text-white">
              <h4 className="font-bold text-lg">Novo Serviço</h4>
              <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-white/20 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddService} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Nome do Serviço</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Corte e Barba"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  value={newService.name}
                  onChange={e => setNewService({...newService, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Duração (min)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    value={newService.duration}
                    onChange={e => setNewService({...newService, duration: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Preço (R$)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    value={newService.price}
                    onChange={e => setNewService({...newService, price: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Cor de Exibição</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewService({...newService, color})}
                      className={`w-8 h-8 rounded-lg ${color} border-2 ${newService.color === color ? 'border-rose-500 scale-110' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors mt-4"
              >
                Salvar Serviço
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default ServiceList;
