export const COLOUR_CONFIG = {
  cool_blue: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    bgMed: 'bg-blue-100',
    text: 'text-blue-600',
    textDark: 'text-blue-800',
    border: 'border-blue-300',
    fill: 'bg-blue-500',
    hex: '#3b82f6',
    emoji: '🔵',
    gradient: 'from-blue-400 to-blue-600',
  },
  earth_green: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
    bgMed: 'bg-green-100',
    text: 'text-green-600',
    textDark: 'text-green-800',
    border: 'border-green-300',
    fill: 'bg-green-500',
    hex: '#22c55e',
    emoji: '🟢',
    gradient: 'from-green-400 to-green-600',
  },
  sunshine_yellow: {
    bg: 'bg-yellow-400',
    bgLight: 'bg-yellow-50',
    bgMed: 'bg-yellow-100',
    text: 'text-yellow-600',
    textDark: 'text-yellow-800',
    border: 'border-yellow-300',
    fill: 'bg-yellow-400',
    hex: '#eab308',
    emoji: '🟡',
    gradient: 'from-yellow-300 to-yellow-500',
  },
  fiery_red: {
    bg: 'bg-red-500',
    bgLight: 'bg-red-50',
    bgMed: 'bg-red-100',
    text: 'text-red-600',
    textDark: 'text-red-800',
    border: 'border-red-300',
    fill: 'bg-red-500',
    hex: '#ef4444',
    emoji: '🔴',
    gradient: 'from-red-400 to-red-600',
  },
};

export function colourConfig(key) {
  return COLOUR_CONFIG[key] || COLOUR_CONFIG['cool_blue'];
}
