interface Activity {
  _id: string;
  open_from: string;
  open_to: string;
}

export function getStatusBadge(activity: Activity) {
  const now = new Date();
  const openFrom = new Date(activity.open_from);
  const openTo = new Date(activity.open_to);

  if (now < openFrom) {
    return <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">即將開始</span>;
  } else if (now > openTo) {
    return <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-medium">已結束</span>;
  } else {
    return <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">進行中</span>;
  }
}

export function isActivityActive(activity: Activity): boolean {
  const now = new Date();
  const openFrom = new Date(activity.open_from);
  const openTo = new Date(activity.open_to);
  return now >= openFrom && now <= openTo;
}
