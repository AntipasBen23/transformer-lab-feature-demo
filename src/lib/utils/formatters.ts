// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format large numbers (1000 -> 1K, 1000000 -> 1M)
export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toFixed(0);
};

// Format percentage
export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Format date to readable string
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

// Format date with time
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Format duration in hours to readable string
export const formatDuration = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const days = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  return h > 0 ? `${days}d ${h}h` : `${days}d`;
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(date);
};

// Calculate ROI score (higher is better)
export const calculateROI = (accuracyGain: number, cost: number): number => {
  return (accuracyGain / cost) * 100;
};

// Get status color for badges
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'running':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'failed':
      return 'bg-red-500';
    case 'queued':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

// Get efficiency rating based on utilization
export const getEfficiencyRating = (utilization: number): {
  label: string;
  color: string;
} => {
  if (utilization >= 70) return { label: 'Excellent', color: 'text-green-500' };
  if (utilization >= 50) return { label: 'Good', color: 'text-blue-500' };
  if (utilization >= 30) return { label: 'Fair', color: 'text-yellow-500' };
  return { label: 'Poor', color: 'text-red-500' };
};