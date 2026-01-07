
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Scissors, 
  BarChart3, 
  LayoutDashboard,
  Menu,
  X,
  Bell,
  Clock,
  Check,
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

const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Corte Feminino', duration: 60, price: 80, color: 'bg-rose-100' },
  { id: '2', name: 'Escova', duration: 30, price: 50, color: 'bg-sky-100' },
  { id: '3', name: 'Coloração', duration: 120, price: 150, color: 'bg-violet-100' },
  { id: '4', name: 'Manicure', duration: 45, price: 35, color: 'bg-emerald-100' },
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('glamour_theme');
    return saved === 'dark';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('glamour_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Persistence using LocalStorage
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('glamour_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('glamour_staff');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('glamour_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('glamour_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('glamour_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('glamour_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('glamour_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('glamour_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('glamour_session', JSON.stringify(currentUser));
      // Update global user database if editing
      const users = JSON.parse(localStorage.getItem('glamour_users') || '[]');
      const updatedUsers = users.map((u: User) => u.id === currentUser.id ? currentUser : u);
      localStorage.setItem('glamour_users', JSON.stringify(updatedUsers));
    } else {
      localStorage.removeItem('glamour_session');
    }
  }, [currentUser]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('glamour_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('glamour_theme', 'light');
    }
  }, [isDarkMode]);

  // Update clock every minute for notification checks
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Notification Logic
  const activeNotifications = useMemo(() => {
    const todayStr = currentTime.toISOString().split('T')[0];
    const nowHours = currentTime.getHours();
    const nowMinutes = currentTime.getMinutes();
    const nowInMinutes = nowHours * 60 + nowMinutes;

    return appointments.filter(apt => {
      if (apt.date !== todayStr || apt.status !== 'scheduled') return false;
      const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
      const aptInMinutes = aptHours * 60 + aptMinutes;
      const diff = aptInMinutes - nowInMinutes;
      return diff > 0 && diff <= 60;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, currentTime]);

  const handleLogout = () => {
    if (confirm('Deseja realmente sair da conta?')) {
      localStorage.removeItem('glamour_session');
      setCurrentUser(null);
      setActiveView('dashboard');
      setIsSidebarOpen(false);
      setIsNotifOpen(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const NavItem = ({ view, icon: Icon, label }: { view: ViewType, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveView(view); setIsSidebarOpen(false); }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
        activeView === view 
          ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/40' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  // Auth Guard: If no user, show the Login/Signup screen
  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300 shadow-xl dark:shadow-none">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="bg-rose-500 p-2 rounded-lg shadow-md">
            <Scissors className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Salon Manager</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="calendar" icon={CalendarIcon} label="Calendário" />
          <NavItem view="clients" icon={Users} label="Clientes" />
          <NavItem view="staff" icon={UserCheck} label="Funcionários" />
          <NavItem view="services" icon={Scissors} label="Serviços" />
          <NavItem view="reports" icon={BarChart3} label="Relatórios" />
        </nav>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <NavItem view="settings" icon={SettingsIcon} label="Configurações" />
          <button 
            onClick={toggleDarkMode}
            className="flex items-center space-x-3 w-full px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors group"
          >
            <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-rose-500 group-hover:text-white transition-colors">
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </span>
            <span className="font-medium text-sm">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors group"
          >
            <span className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg group-hover:bg-red-50 dark:group-hover:bg-red-900/20 group-hover:text-red-500 transition-colors">
               <LogOut size={20} />
            </span>
            <span className="font-medium text-sm">Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile Sidebar Content */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 z-50 transform transition-transform duration-300 lg:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } p-6 flex flex-col border-r dark:border-slate-800`}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <Scissors className="text-rose-500" size={20} />
            <h1 className="text-xl font-serif font-bold dark:text-white">Salon Manager</h1>
          </div>
          <button onClick={toggleSidebar} className="dark:text-slate-400"><X size={24} /></button>
        </div>
        <nav className="space-y-2 flex-1">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="calendar" icon={CalendarIcon} label="Calendário" />
          <NavItem view="clients" icon={Users} label="Clientes" />
          <NavItem view="staff" icon={UserCheck} label="Funcionários" />
          <NavItem view="services" icon={Scissors} label="Serviços" />
          <NavItem view="reports" icon={BarChart3} label="Relatórios" />
        </nav>
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-1">
           <NavItem view="settings" icon={SettingsIcon} label="Configurações" />
           <button 
            onClick={toggleDarkMode}
            className="flex items-center space-x-3 w-full px-4 py-3 text-slate-500 dark:text-slate-400 font-medium"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
           <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-slate-500 dark:text-slate-400 font-medium hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between lg:px-8 relative z-30 transition-colors duration-300">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md dark:text-slate-400">
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{currentUser.salonName}</h2>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100 capitalize leading-none">
                {activeView === 'dashboard' ? 'Início' : 
                 activeView === 'calendar' ? 'Calendário' :
                 activeView === 'clients' ? 'Clientes' :
                 activeView === 'staff' ? 'Funcionários' :
                 activeView === 'services' ? 'Serviços' : 
                 activeView === 'settings' ? 'Configurações' : 'Relatórios'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2 transition-colors relative rounded-full ${isNotifOpen ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <Bell size={20} />
                {activeNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Lembretes de Hoje</h3>
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Próxima Hora</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700">
                      {activeNotifications.length > 0 ? (
                        activeNotifications.map(apt => {
                          const client = clients.find(c => c.id === apt.clientId);
                          const service = services.find(s => s.id === apt.serviceId);
                          return (
                            <div key={apt.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <div className="flex items-start space-x-3">
                                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
                                  <Clock size={16} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{client?.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Horário às <span className="font-bold text-rose-500">{apt.time}</span> para {service?.name}.
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-slate-400">
                          <Check size={32} className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Tudo em dia! Sem horários na próxima hora.</p>
                        </div>
                      )}
                    </div>
                    {activeNotifications.length > 0 && (
                      <button 
                        onClick={() => setIsNotifOpen(false)}
                        className="w-full py-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-rose-500 transition-colors uppercase tracking-widest"
                      >
                        Fechar
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 lg:p-8">
          {activeView === 'dashboard' && (
            <Dashboard 
              appointments={appointments} 
              clients={clients} 
              services={services} 
              onNavigate={setActiveView}
            />
          )}
          {activeView === 'calendar' && (
            <Calendar 
              appointments={appointments} 
              setAppointments={setAppointments}
              clients={clients}
              services={services}
              staff={staff}
              salonName={currentUser.salonName}
              salonAddress={currentUser.address}
            />
          )}
          {activeView === 'clients' && (
            <ClientList 
              clients={clients} 
              setClients={setClients} 
              appointments={appointments}
              services={services}
            />
          )}
          {activeView === 'staff' && (
            <StaffList 
              staff={staff} 
              setStaff={setStaff} 
              appointments={appointments}
              services={services}
              clients={clients}
            />
          )}
          {activeView === 'services' && (
            <ServiceList 
              services={services} 
              setServices={setServices} 
            />
          )}
          {activeView === 'reports' && (
            <Reports 
              appointments={appointments} 
              services={services} 
              clients={clients}
              staff={staff}
            />
          )}
          {activeView === 'settings' && (
            <Settings 
              user={currentUser} 
              setUser={setCurrentUser} 
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
