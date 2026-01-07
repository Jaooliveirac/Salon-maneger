
import React, { useState } from 'react';
import { Scissors, Mail, Lock, User as UserIcon, Store, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [salonName, setSalonName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users = JSON.parse(localStorage.getItem('glamour_users') || '[]');
    const user = users.find((u: User) => u.email === email && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('E-mail ou senha incorretos.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('glamour_users') || '[]');
    if (users.some((u: User) => u.email === email)) {
      setError('Este e-mail já está cadastrado.');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      salonName,
      password
    };

    localStorage.setItem('glamour_users', JSON.stringify([...users, newUser]));
    setSuccessMsg('Conta criada com sucesso! Faça login para continuar.');
    setMode('login');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users = JSON.parse(localStorage.getItem('glamour_users') || '[]');
    const userExists = users.some((u: User) => u.email === email);
    
    if (userExists) {
      setSuccessMsg(`Um e-mail de recuperação foi enviado para ${email}`);
      setTimeout(() => setMode('login'), 3000);
    } else {
      setError('E-mail não encontrado em nossa base.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans">
      {/* Decorative backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-[1000px] grid lg:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden z-10 border border-white/20 backdrop-blur-sm">
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col justify-between bg-rose-500 p-12 text-white relative">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Scissors className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Glamour</h1>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-5xl font-serif font-bold leading-tight">O futuro do seu salão começa aqui.</h2>
            <p className="text-rose-100 text-lg">Gerencie agendamentos, clientes e finanças em uma única plataforma elegante e intuitiva.</p>
          </div>

          <div className="flex items-center space-x-4">
             <div className="flex -space-x-3">
               {[1,2,3].map(i => <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-rose-500" alt="User" />)}
             </div>
             <p className="text-sm text-rose-100 font-medium">+ de 500 profissionais já usam</p>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            {mode === 'login' && (
              <>
                <h3 className="text-3xl font-serif font-bold text-slate-800 mb-2">Bem-vindo</h3>
                <p className="text-slate-400">Entre com suas credenciais para gerenciar seu salão.</p>
              </>
            )}
            {mode === 'signup' && (
              <>
                <h3 className="text-3xl font-serif font-bold text-slate-800 mb-2">Crie sua conta</h3>
                <p className="text-slate-400">Comece agora a profissionalizar seu atendimento.</p>
              </>
            )}
            {mode === 'forgot' && (
              <>
                <button onClick={() => setMode('login')} className="flex items-center space-x-2 text-rose-500 font-bold text-sm mb-4 hover:underline">
                  <ArrowLeft size={16} /> <span>Voltar ao login</span>
                </button>
                <h3 className="text-3xl font-serif font-bold text-slate-800 mb-2">Recuperar senha</h3>
                <p className="text-slate-400">Informe seu e-mail para receber as instruções.</p>
              </>
            )}
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center space-x-3 text-sm font-bold border border-emerald-100 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 animate-in shake">
              {error}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgot} className="space-y-5">
            {mode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Seu Nome</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Maria Silva"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-sm"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nome do Salão</label>
                  <div className="relative group">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Glamour Studio"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-sm"
                      value={salonName}
                      onChange={e => setSalonName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-sm"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }} className="text-[10px] font-bold text-rose-500 hover:underline uppercase tracking-widest">Esqueci a senha</button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-sm"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center space-x-2 mt-4"
            >
              <span>
                {mode === 'login' ? 'Entrar no Dashboard' : mode === 'signup' ? 'Finalizar Cadastro' : 'Enviar Link de Recuperação'}
              </span>
              <ChevronRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center">
            {mode === 'login' ? (
              <p className="text-sm text-slate-400">
                Não tem uma conta?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }} className="text-rose-500 font-bold hover:underline">Cadastre seu salão</button>
              </p>
            ) : mode === 'signup' ? (
              <p className="text-sm text-slate-400">
                Já é cadastrado?{' '}
                <button onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }} className="text-rose-500 font-bold hover:underline">Faça login</button>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
