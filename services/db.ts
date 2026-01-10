
import { User } from '../types';

// Chaves para o localStorage
const KEYS = {
  USERS_REGISTRY: 'salon_users_registry', // Lista de todos os cadastrados
  SESSION: 'salon_current_session',       // Apenas o ID/Dados de quem está logado agora
};

export const db = {
  // Retorna a lista de todos os usuários cadastrados
  getRegisteredUsers(): User[] {
    const users = localStorage.getItem(KEYS.USERS_REGISTRY);
    return users ? JSON.parse(users) : [];
  },

  // Cadastro de novo usuário
  async signup(userData: User) {
    const users = this.getRegisteredUsers();
    
    // Verifica se o e-mail já existe
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'Este e-mail já está cadastrado.' };
    }

    const updatedUsers = [...users, userData];
    localStorage.setItem(KEYS.USERS_REGISTRY, JSON.stringify(updatedUsers));
    
    // Inicia a sessão automaticamente
    this.setSession(userData);
    return { success: true, user: userData };
  },

  // Login com validação de e-mail e senha
  async login(email: string, password?: string) {
    const users = this.getRegisteredUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      this.setSession(user);
      return { success: true, user };
    }
    
    return { success: false, error: 'E-mail ou senha incorretos.' };
  },

  // Gerenciamento de Sessão (Quem está logado agora)
  getSession(): User | null {
    const session = localStorage.getItem(KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  setSession(user: User | null) {
    if (user) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  },

  // Persistência de Dados vinculada ao Usuário (Individualizada por ID)
  getLocalData() {
    const user = this.getSession();
    if (!user) return { clients: [], staff: [], services: [], appointments: [] };

    const prefix = `salon_user_${user.id}`;
    return {
      clients: JSON.parse(localStorage.getItem(`${prefix}_clients`) || '[]'),
      staff: JSON.parse(localStorage.getItem(`${prefix}_staff`) || '[]'),
      services: JSON.parse(localStorage.getItem(`${prefix}_services`) || '[]'),
      appointments: JSON.parse(localStorage.getItem(`${prefix}_appointments`) || '[]')
    };
  },

  saveData(type: 'clients' | 'staff' | 'services' | 'appointments', data: any) {
    const user = this.getSession();
    if (!user) return;
    
    const prefix = `salon_user_${user.id}`;
    localStorage.setItem(`${prefix}_${type}`, JSON.stringify(data));
  }
};
