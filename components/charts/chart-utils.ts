// Color utility functions to avoid inline styles
export const getColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    '#2563eb': 'chart-color-primary',
    '#059669': 'chart-color-secondary', 
    '#dc2626': 'chart-color-accent',
    '#ea580c': 'chart-color-warning',
    '#16a34a': 'chart-color-success',
    '#0891b2': 'chart-color-info',
    '#7c3aed': 'chart-color-purple',
    '#eab308': 'chart-color-yellow',
    // Sport theme specific colors
    '#10b981': 'sport-color-tennis',
    '#f59e0b': 'sport-color-basketball',
    '#ef4444': 'sport-color-badminton', 
    '#3b82f6': 'sport-color-swimming',
    '#8b5cf6': 'sport-color-football',
    '#06b6d4': 'sport-color-volleyball'
  };
  
  return colorMap[color] || 'sport-color-default';
};

export const getTextColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    '#2563eb': 'chart-text-primary',
    '#059669': 'chart-text-secondary',
    '#dc2626': 'chart-text-accent', 
    '#ea580c': 'chart-text-warning',
    '#16a34a': 'chart-text-success',
    '#0891b2': 'chart-text-info',
    '#7c3aed': 'chart-text-purple',
    '#eab308': 'chart-text-yellow'
  };
  
  return colorMap[color] || 'chart-text-primary';
};
