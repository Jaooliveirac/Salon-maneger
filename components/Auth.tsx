
import React, { useState } from 'react';
import { Scissors, Mail, Lock, User as UserIcon, Store, ChevronRight, Loader2 } from 'lucide-react';
import { User } from '../types';
import { db } from '../services/db';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ email: '', password: '', name: '', salonName: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulação de delay para melhor UX
    setTimeout(async () => {
      try {
        if (mode === 'login') {
          const res = await db.login(form.email, form.password);
          if (res.success) onLogin(res.user);
          else setError(res.error || '');
        } else {
          const newUser = { id: Math.random().toString(36).substr(2, 9), ...form };
          const res = await db.signup(newUser);
          if (res.success) onLogin(res.user);
          else setError('Erro ao criar conta.');
        }
      } catch (e) {
        setError('Ocorreu um erro inesperado.');
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-rose-500 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-rose-200 dark:shadow-rose-900/20">
            <Scissors size={42} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">
            Salon Manager
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {mode === 'login' ? 'Gerencie seu salão de forma profissional.' : 'Comece sua jornada com a gente.'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                  <input type="text" required placeholder="Seu Nome" className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="relative group">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                  <input type="text" required placeholder="Nome do Salão" className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none" value={form.salonName} onChange={e => setForm({...form, salonName: e.target.value})} />
                </div>
              </>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
              <input type="email" required placeholder="E-mail" className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
              <input type="password" required placeholder="Senha" className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-rose-600 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <span>{mode === 'login' ? 'Acessar Painel' : 'Criar Conta Grátis'}</span>}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
            >
              {mode === 'login' ? 'Novo por aqui? Cadastre-se' : 'Já é membro? Faça Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
