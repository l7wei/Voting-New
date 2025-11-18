'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import AdminGuard from '@/components/auth/AdminGuard';
import { 
  Card, 
  CardHeader,
  CardBody, 
  Button, 
  Chip, 
  Spinner, 
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@heroui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faUsers, 
  faRotate,
  faClipboardList,
  faCheckCircle,
  faClock,
  faPencil,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';

interface Activity {
  _id: string;
  name: string;
  type: string;
  rule: 'choose_all' | 'choose_one';
  open_from: string;
  open_to: string;
  users: string[];
  options: string[];
}

function AdminDashboardContent() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();

      if (data.success) {
        setActivities(data.data);
      } else {
        setError(data.error || '無法載入投票活動');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('載入投票活動時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (activity: Activity) => {
    const now = new Date();
    const openFrom = new Date(activity.open_from);
    const openTo = new Date(activity.open_to);

    if (now < openFrom) {
      return <Chip color="warning" variant="flat" size="sm" startContent={<FontAwesomeIcon icon={faClock} />}>即將開始</Chip>;
    } else if (now > openTo) {
      return <Chip color="default" variant="flat" size="sm">已結束</Chip>;
    } else {
      return <Chip color="success" variant="flat" size="sm" startContent={<FontAwesomeIcon icon={faCheckCircle} />}>進行中</Chip>;
    }
  };

  const activeCount = activities.filter(a => {
    const now = new Date();
    return now >= new Date(a.open_from) && now <= new Date(a.open_to);
  }).length;

  const completedCount = activities.filter(a => new Date() > new Date(a.open_to)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <Header />
        <main className="container mx-auto max-w-7xl px-6 py-12">
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" label="載入中..." />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />

      <main className="container mx-auto max-w-7xl px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-neutral-900 mb-2">
            管理員後台
          </h2>
          <p className="text-neutral-600">投票系統管理控制台</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card shadow="sm" className="glass-card">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">總活動數</p>
                  <p className="text-4xl font-bold text-neutral-900">{activities.length}</p>
                </div>
                <div className="p-4 bg-neutral-100 rounded-xl">
                  <FontAwesomeIcon icon={faClipboardList} className="text-3xl text-primary" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card shadow="sm" className="glass-card">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">進行中</p>
                  <p className="text-4xl font-bold text-success-600">{activeCount}</p>
                </div>
                <div className="p-4 bg-neutral-100 rounded-xl">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-success-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card shadow="sm" className="glass-card">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">已結束</p>
                  <p className="text-4xl font-bold text-neutral-500">{completedCount}</p>
                </div>
                <div className="p-4 bg-neutral-100 rounded-xl">
                  <FontAwesomeIcon icon={faClock} className="text-3xl text-neutral-500" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-danger">
            <CardBody>
              <p className="text-danger">{error}</p>
            </CardBody>
          </Card>
        )}

        {/* Quick Actions */}
        <Card shadow="sm" className="mb-8 glass-card">
          <CardHeader className="pb-4">
            <h3 className="text-xl font-bold text-neutral-900">快速操作</h3>
          </CardHeader>
          <Divider />
          <CardBody className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button 
                as={Link}
                href="/admin/activities/new" 
                color="primary"
                size="lg"
                startContent={<FontAwesomeIcon icon={faPlus} />}
              >
                新增投票活動
              </Button>
              <Button 
                as={Link}
                href="/admin/voters" 
                variant="flat"
                size="lg"
                startContent={<FontAwesomeIcon icon={faUsers} />}
              >
                管理投票人名單
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="bordered"
                size="lg"
                startContent={<FontAwesomeIcon icon={faRotate} />}
              >
                重新整理
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Activities Table */}
        <Card shadow="sm" className="glass-card">
          <CardHeader className="pb-4">
            <h3 className="text-xl font-bold text-neutral-900">投票活動列表</h3>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            {activities.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-full mb-4">
                  <FontAwesomeIcon icon={faClipboardList} className="text-4xl text-primary" />
                </div>
                <p className="text-neutral-600 mb-6 text-lg">目前沒有任何投票活動</p>
                <Button 
                  as={Link}
                  href="/admin/activities/new" 
                  color="primary"
                  startContent={<FontAwesomeIcon icon={faPlus} />}
                >
                  新增第一個活動
                </Button>
              </div>
            ) : (
              <Table aria-label="活動列表" removeWrapper>
                <TableHeader>
                  <TableColumn>活動名稱</TableColumn>
                  <TableColumn>狀態</TableColumn>
                  <TableColumn>投票方式</TableColumn>
                  <TableColumn>候選人數</TableColumn>
                  <TableColumn>已投票</TableColumn>
                  <TableColumn>操作</TableColumn>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity._id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{activity.name}</div>
                          <div className="text-xs text-default-500">{activity.type}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusChip(activity)}</TableCell>
                      <TableCell className="text-sm">
                        {activity.rule === 'choose_all' ? '多選評分' : '單選'}
                      </TableCell>
                      <TableCell>{activity.options?.length || 0}</TableCell>
                      <TableCell>{activity.users?.length || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            as={Link}
                            href={`/admin/activities/${activity._id}`}
                            size="sm"
                            color="primary"
                            variant="flat"
                            startContent={<FontAwesomeIcon icon={faPencil} />}
                          >
                            管理
                          </Button>
                          <Button
                            as={Link}
                            href={`/admin/activities/${activity._id}/results`}
                            size="sm"
                            variant="flat"
                            startContent={<FontAwesomeIcon icon={faChartBar} />}
                          >
                            統計
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
