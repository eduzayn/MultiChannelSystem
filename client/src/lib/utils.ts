import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const userRoles = {
  ADMIN: "admin",
  SUPERVISOR: "supervisor",
  AGENT: "agent",
} as const;

export type UserRole = typeof userRoles[keyof typeof userRoles];

export function hasAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export const formatNumber = (number: number) => {
  return new Intl.NumberFormat('pt-BR').format(number);
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

export const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Agora mesmo';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Há ${diffInMonths} mês${diffInMonths > 1 ? 'es' : ''}`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `Há ${diffInYears} ano${diffInYears > 1 ? 's' : ''}`;
};
