
import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Scissors, 
  BarChart3, 
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  UserCheck,
  Settings as SettingsIcon
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import ClientList from './components/ClientList';
import StaffList from './components/StaffList';
import ServiceList from './components/ServiceList';
import Reports from './components/Reports';
import Auth from './components/Auth';
import Settings from './components/Settings';
import { Client, Service, Appointment, ViewType, User, Staff } from './types';
import { db } from './services/db';

const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Corte Feminino', duration: 60, price: 80, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: '2', name: 'Escova', duration: 30, price: 50, color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { id: '3', name: 'Coloração', duration: 120, price: 150, color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { id: '4', name: 'Manicure', duration: 45, price: 35, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('glamour_theme') === 'dark');
  const [currentUser, setCurrentUser] = useState<User | null>(() => db.getSession());
  
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Carregar dados iniciais do localStorage
  useEffect(() => {
    if (currentUser) {
      const localData = db.getLocalData();
      setClients(localData.clients);
      setStaff(localData.staff);
      setServices(localData.services.length > 0 ? localData.services : INITIAL_SERVICES);
      setAppointments(localData.appointments);
    }
  }, [currentUser]);

  // Salvar automaticamente no localStorage quando houver mudanças
  useEffect(() => { if (currentUser) db.saveData('clients', clients); }, [clients, currentUser]);
  useEffect(() => { if (currentUser) db.saveData('staff', staff); }, [staff, currentUser]);
  useEffect(() => { if (currentUser) db.saveData('services', services); }, [services, currentUser]);
  useEffect(() => { if (currentUser) db.saveData('appointments', appointments); }, [appointments, currentUser]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('glamour_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      db.setSession(null);
      setCurrentUser(null);
      setActiveView('dashboard');
    }
  };

  if (!currentUser) {
    return <Auth onLogin={(user) => { db.setSession(user); setCurrentUser(user); }} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Sidebar Overlay Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 shadow-xl transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-rose-500 rounded-xl text-white shadow-lg">
                <Scissors size={24} />
             </div>
             <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Salon Manager</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        <nav className="space-y-1 flex-1 overflow-y-auto">
          <button onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }} className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${activeView === 'dashboard' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> <span className="font-medium">Dashboard</span>
          </button>
          <button onClick={() => { setActiveView('calendar'); setIsSidebarOpen(false); }} className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${activeView === 'calendar' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <CalendarIcon size={20} /> <span className="font-medium">Calendário</span>
          </button>
          <button onClick={() => { setActiveView('clients'); setIsSidebarOpen(false); }} className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${activeView === 'clients' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <Users size={20} /> <span className="font-medium">Clientes</span>
          </button>
          <button onClick={() => { setActiveView('staff'); setIsSidebarOpen(false); }} className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${activeView === 'staff' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <UserCheck size={20} /> <span className="font-medium">Equipe</span>
          </button>
          <button onClick={() => { setActiveView('services'); setIsSidebarOpen(false); }} className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${activeView === 'services' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <Scissors size={20} /> <span className="font-medium">Serviços</span>
          </button>
          <button onClick={() => { setActiveView('reports'); setIsSidebarOpen(false); }} className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${activeView === 'reports' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <BarChart3 size={20} /> <span className="font-medium">Relatórios</span>
          </button>
          <button onClick={() => { setActiveView('settings'); setIsSidebarOpen(false); }} className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${activeView === 'settings' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <SettingsIcon size={20} /> <span className="font-medium">Configurações</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center space-x-3 w-full px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium text-sm">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={20} /> <span className="font-medium text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between lg:px-8 relative z-30 shadow-sm">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest leading-none mb-1">{currentUser.salonName}</h2>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100 capitalize leading-none">{activeView}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Status: Online</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center font-bold text-rose-500 border border-rose-100 dark:border-rose-800/50">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 lg:p-8">
          {activeView === 'dashboard' && <Dashboard appointments={appointments} clients={clients} services={services} onNavigate={setActiveView} />}
          {activeView === 'calendar' && <Calendar appointments={appointments} setAppointments={setAppointments} clients={clients} services={services} staff={staff} salonName={currentUser.salonName} salonAddress={currentUser.address} />}
          {activeView === 'clients' && <ClientList clients={clients} setClients={setClients} appointments={appointments} services={services} />}
          {activeView === 'staff' && <StaffList staff={staff} setStaff={setStaff} appointments={appointments} services={services} clients={clients} />}
          {activeView === 'services' && <ServiceList services={services} setServices={setServices} />}
          {activeView === 'reports' && <Reports appointments={appointments} services={services} clients={clients} staff={staff} />}
          {activeView === 'settings' && <Settings user={currentUser} setUser={setCurrentUser} />}
        </section>
      </main>
    </div>
  );
};

export default App;
