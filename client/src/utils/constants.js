const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_URL = rawUrl.endsWith('/api') || rawUrl.endsWith('/api/')
  ? rawUrl
  : `${rawUrl.replace(/\/$/, '')}/api`;

export const AMENITY_ICONS = {
  'cctv': 'Camera',
  'ev_charging': 'Zap',
  'covered': 'Home',
  'security': 'Shield',
  'wheelchair': 'Accessibility',
  'restroom': 'Bath',
  'car_wash': 'Droplets',
  'valet': 'UserCheck',
  'lighting': 'Lightbulb',
  'WiFi': 'Wifi',
  'wifi': 'Wifi',
  '24/7': 'Clock',
  'handicap': 'Accessibility',
  'fire_safety': 'Flame',
  'air_pump': 'Wind',
};

export const VEHICLE_TYPES = ['car', 'bike', 'suv'];

export const SLOT_TYPES = ['compact', 'standard', 'large', 'handicap', 'ev'];

export const DEFAULT_CENTER = [10.0261, 76.3125]; // Kochi

export const DEFAULT_ZOOM = 12;

export const PRICE_RANGE = { min: 0, max: 200 };

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
