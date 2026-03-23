export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Chat Nest';

export const PLAN_LIMITS = {
  free: 100,
  pro: 10000,
  team: 50000
};

export const NAV_LINKS = [
  { to: '/', label: 'Landing' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/billing', label: 'Billing' },
  { to: '/settings', label: 'Settings' }
];
