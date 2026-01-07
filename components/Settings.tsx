
import React, { useState } from 'react';
import { User, Store, Mail, MapPin, Save, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsProps {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

const Settings: React.FC<SettingsProps> = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    salonName: user?.salonName || '',
    email: user?.email || '',
    address: user?.address || ''
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const updatedUser: UserType = {
      ...user,
      ...formData
    };
    
    setUser(updatedUser);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="flex items-center space-x-4 mb-10">
          <div className="bg-rose-500 p-3 rounded-2xl text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Configurações de Perfil</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie as informações públicas do seu salão.</p>
          </div>
        </div>

        {isSaved && (
          <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center space-x-3 text-sm font-bold border border-emerald-100 dark:border-emerald-800 animate-in fade-in slide-in-from-top-2">
            <ShieldCheck size={20} />
            <span>Alterações salvas com sucesso!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Seu Nome</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm dark:text-slate-100"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Nome do Salão</label>
              <div className="relative group">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm dark:text-slate-100"
                  value={formData.salonName}
                  onChange={e => setFormData({...formData, salonName: e.target.value})}
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Endereço Completo</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm dark:text-slate-100"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">E-mail de Contato</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm dark:text-slate-100"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center space-x-2 bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-rose-900/30 hover:bg-rose-600 hover:scale-[1.01] transition-all"
          >
            <Save size={20} />
            <span>Salvar Alterações</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
