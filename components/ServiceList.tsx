
import React, { useState } from 'react';
import { Plus, Scissors, Clock, DollarSign, Trash2, X } from 'lucide-react';
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

  // Helper for numeric only input for price
  const handlePriceChange = (value: string) => {
    // Only allow numbers and one dot
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setNewService({ ...newService, price: Number(cleanValue) || 0 });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cardápio de Serviços</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie o que seu salão oferece aos clientes.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-rose-900/30 flex items-center space-x-2 hover:scale-105 transition-all"
        >
          <Plus size={20} />
          <span>Novo Serviço</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 relative group transition-all hover:shadow-md transition-colors duration-300">
            <div className={`w-12 h-12 rounded-2xl ${service.color} flex items-center justify-center mb-4 border border-black/5 dark:border-white/10 shadow-inner`}>
              <Scissors size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{service.name}</h3>
            
            <div className="flex space-x-4 mb-6">
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <Clock size={14} className="mr-1 text-slate-400 dark:text-slate-600" />
                {service.duration} min
              </div>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <DollarSign size={14} className="mr-1 text-slate-400 dark:text-slate-600" />
                Preço Base
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-2xl font-black text-rose-500 dark:text-rose-400">{formatCurrency(service.price)}</span>
              <button 
                onClick={() => removeService(service.id)}
                className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-rose-500 text-white">
              <h4 className="font-bold text-lg">Novo Serviço</h4>
              <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddService} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">Nome do Serviço</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Corte e Barba"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none dark:text-slate-100 dark:placeholder-slate-600"
                  value={newService.name}
                  onChange={e => setNewService({...newService, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">Duração (min)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none dark:text-slate-100"
                    value={newService.duration}
                    onChange={e => setNewService({...newService, duration: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">Preço (R$)</label>
                  <input 
                    type="text" 
                    required
                    inputMode="decimal"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none dark:text-slate-100"
                    value={newService.price}
                    onChange={e => handlePriceChange(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">Cor de Exibição</label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {COLORS.map(colorClass => (
                    <button
                      key={colorClass}
                      type="button"
                      onClick={() => setNewService({...newService, color: colorClass})}
                      className={`w-10 h-10 rounded-xl ${colorClass} border-2 transition-all flex items-center justify-center ${
                        newService.color === colorClass 
                          ? 'border-rose-500 scale-110 shadow-lg' 
                          : 'border-slate-200 dark:border-slate-700 hover:scale-105'
                      }`}
                    >
                       <div className="w-2 h-2 rounded-full bg-current opacity-20"></div>
                    </button>
                  ))}
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-rose-900/30 hover:bg-rose-600 transition-colors mt-4"
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

export default ServiceList;
