interface StatusBadgeProps {
  status: 'upcoming' | 'active' | 'ended';
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const badges = {
    upcoming: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    ended: 'bg-gray-100 text-gray-800',
  };

  const labels = {
    upcoming: '即將開始',
    active: '進行中',
    ended: '已結束',
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${badges[status]} ${className}`}>
      {labels[status]}
    </span>
  );
}
