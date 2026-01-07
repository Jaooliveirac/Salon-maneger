
export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  color: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'scheduled' | 'cancelled' | 'completed' | 'blocked';
  notes?: string;
  paymentMethod?: 'Dinheiro' | 'Cartão' | 'Pix';
}

export interface User {
  id: string;
  name: string;
  email: string;
  salonName: string;
  password?: string;
}

export type ViewType = 'dashboard' | 'calendar' | 'clients' | 'services' | 'reports';
