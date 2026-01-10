
import { User } from '../types';

// Chaves para o localStorage
const KEYS = {
  USER: 'salon_user',
  CLIENTS: 'salon_clients',
  STAFF: 'salon_staff',
  SERVICES: 'salon_services',
  APPOINTMENTS: 'salon_appointments'
};

export const db = {
  // Autenticação Local Simulada
  async signup(userData: any) {
    localStorage.setItem(KEYS.USER, JSON.stringify(userData));
    return { success: true, user: userData };
  },

  async login(email: string, password: string) {
    const savedUser = localStorage.getItem(KEYS.USER);
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.email === email) {
        return { success: true, user };
      }
    }
    return { success: false, error: 'Usuário não encontrado ou senha incorreta.' };
  },

  getSession(): User | null {
    const session = localStorage.getItem(KEYS.USER);
    return session ? JSON.parse(session) : null;
  },

  setSession(user: User | null) {
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  },

  // Persistência de Dados em Lote (substitui o fetchCloudData)
  getLocalData() {
    return {
      clients: JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]'),
      staff: JSON.parse(localStorage.getItem(KEYS.STAFF) || '[]'),
      services: JSON.parse(localStorage.getItem(KEYS.SERVICES) || '[]'),
      appointments: JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]')
    };
  },

  saveData(type: 'clients' | 'staff' | 'services' | 'appointments', data: any) {
    localStorage.setItem(`salon_${type}`, JSON.stringify(data));
  }
};
