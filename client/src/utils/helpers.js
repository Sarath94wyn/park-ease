import { format, formatDistanceToNow, differenceInHours, differenceInMinutes } from 'date-fns';

export const formatCurrency = (amount) => {
  if (amount == null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return '';
  }
};

export const formatTime = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'hh:mm a');
  } catch {
    return '';
  }
};

export const formatDateTime = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd MMM yyyy, hh:mm a');
  } catch {
    return '';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
};

export const formatDuration = (hours) => {
  if (!hours || hours <= 0) return '0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const calculateDuration = (start, end) => {
  if (!start || !end) return 0;
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const totalMinutes = differenceInMinutes(endDate, startDate);
    return totalMinutes / 60;
  } catch {
    return 0;
  }
};

export const calculateAmount = (duration, pricePerHour) => {
  if (!duration || !pricePerHour) return 0;
  return Math.ceil(duration * pricePerHour);
};

export const getAvailabilityColor = (available, total) => {
  if (!total || total === 0) return 'text-slate-400';
  const percentage = (available / total) * 100;
  if (percentage > 50) return 'text-emerald-400';
  if (percentage > 20) return 'text-amber-400';
  return 'text-rose-400';
};

export const getAvailabilityBgColor = (available, total) => {
  if (!total || total === 0) return 'bg-slate-500';
  const percentage = (available / total) * 100;
  if (percentage > 50) return 'bg-emerald-500';
  if (percentage > 20) return 'bg-amber-500';
  return 'bg-rose-500';
};

export const getAvailabilityText = (available, total) => {
  if (!total || total === 0) return 'No slots';
  if (available === 0) return 'Full';
  const percentage = (available / total) * 100;
  if (percentage > 50) return 'Available';
  if (percentage > 20) return 'Filling Fast';
  return 'Almost Full';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const getDistanceText = (meters) => {
  if (meters == null) return '';
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'confirmed':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'pending':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'cancelled':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    case 'completed':
      return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

export const getParkingImageUrl = (name) => {
  const lotName = name?.toLowerCase() || '';
  
  // Real parking images uploaded by user (copied to public/parking_slots/)
  const images = {
    lot1: '/parking_slots/parking_lot_1.jpg', // Crowded outdoor parking lot (high angle)
    lot2: '/parking_slots/parking_lot_2.jpg', // Underground garage (G zone blue columns)
    lot3: '/parking_slots/parking_lot_3.jpg', // Red brick outdoor parking slots (empty slots)
    lot4: '/parking_slots/parking_lot_4.jpg', // Indoor modern underground parking with green guide lines
    lot5: '/parking_slots/parking_lot_5.jpg', // Outdoor parking lot with yellow slots
  };

  if (lotName.includes('mall') || lotName.includes('phoenix') || lotName.includes('lulu') || lotName.includes('focus')) {
    return images.lot4; // Indoor modern garage
  }
  if (lotName.includes('metro') || lotName.includes('underground') || lotName.includes('basement')) {
    return images.lot2; // Underground deck
  }
  if (lotName.includes('station') || lotName.includes('terminus') || lotName.includes('hub') || lotName.includes('central')) {
    return images.lot1; // Crowded transit lot
  }
  if (lotName.includes('beach') || lotName.includes('fort kochi') || lotName.includes('open') || lotName.includes('ground')) {
    return images.lot3; // Brick outdoor lot
  }
  if (lotName.includes('infopark') || lotName.includes('itpl') || lotName.includes('cyberpark') || lotName.includes('technopark')) {
    return images.lot5; // Yellow slot IT park lot
  }
  if (lotName.includes('premium') || lotName.includes('kowdiar') || lotName.includes('plaza')) {
    return images.lot4; // Modern indoor
  }

  // Fallback based on name length for variety
  const code = lotName.length % 5;
  if (code === 0) return images.lot1;
  if (code === 1) return images.lot2;
  if (code === 2) return images.lot3;
  if (code === 3) return images.lot4;
  return images.lot5;
};
