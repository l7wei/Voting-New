'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/ui/loader';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Plus, AlertCircle, Edit, BarChart3, ClipboardCheck } from 'lucide-react';

interface Activity {
  _id: string;
  name: string;
  subtitle?: string;
  description?: string;
  rule: 'choose_one' | 'choose_all';
  open_from: string;
  open_to: string;
  users: string[];
  options: Option[];
}

interface Option {
  _id: string;
  title: string;
  description?: string;
}

interface NewOptionForm {
  title: string;
  description: string;
}

function ActivityDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    rule: 'choose_one' as 'choose_one' | 'choose_all',
    open_from: '',
    open_to: '',
  });
  
  // New option form
  const [showNewOption, setShowNewOption] = useState(false);
  const [newOption, setNewOption] = useState<NewOptionForm>({
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}?include_options=true`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setActivity(data.data);
        setFormData({
          name: data.data.name,
          subtitle: data.data.subtitle || '',
          description: data.data.description || '',
          rule: data.data.rule,
          open_from: new Date(data.data.open_from).toISOString().slice(0, 16),
          open_to: new Date(data.data.open_to).toISOString().slice(0, 16),
        });
      } else {
        setError(data.error || '無法載入活動資訊');
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError('載入活動時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('活動資訊已更新');
        fetchActivity();
      } else {
        setError(data.error || '更新活動失敗');
      }
    } catch (err) {
      console.error('Error updating activity:', err);
      setError('更新活動時發生錯誤');
    } finally {
      setSaving(false);
    }
  };

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const optionData = {
        activity_id: activityId,
        title: newOption.title,
        description: newOption.description,
      };

      const response = await fetch('/api/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(optionData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('選項已新增');
        setShowNewOption(false);
        setNewOption({
          title: '',
          description: '',
        });
        fetchActivity();
      } else {
        setError(data.error || '新增選項失敗');
      }
    } catch (err) {
      console.error('Error adding option:', err);
      setError('新增選項時發生錯誤');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm('確定要刪除此選項嗎？')) return;

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/options/${optionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('選項已刪除');
        fetchActivity();
      } else {
        setError(data.error || '刪除選項失敗');
      }
    } catch (err) {
      console.error('Error deleting option:', err);
      setError('刪除選項時發生錯誤');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async () => {
    if (!confirm('確定要刪除此活動嗎？此操作無法復原！')) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin');
      } else {
        setError(data.error || '刪除活動失敗');
        setSaving(false);
      }
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('刪除活動時發生錯誤');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-7xl px-6 py-12">
          <Loading text="載入中..." />
        </main>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-7xl px-6 py-8">
          <Card>
            <CardContent className="flex items-center gap-2 py-8">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive">找不到活動</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回後台
            </Link>
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/activities/${activityId}/results`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                查看統計
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/activities/${activityId}/verification`}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                驗票
              </Link>
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="flex items-center gap-2 py-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {successMessage && (
          <Card className="mb-6 border-green-500 bg-green-50">
            <CardContent className="flex items-center gap-2 py-4">
              <AlertCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-600">{successMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Activity Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              編輯活動資訊
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateActivity} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">活動名稱</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">活動小標</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">活動說明</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule">投票方式</Label>
                <select
                  id="rule"
                  value={formData.rule}
                  onChange={(e) => setFormData({ ...formData, rule: e.target.value as 'choose_one' | 'choose_all' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={saving}
                >
                  <option value="choose_one">單選</option>
                  <option value="choose_all">多選評分</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="open_from">開始時間</Label>
                  <Input
                    id="open_from"
                    type="datetime-local"
                    value={formData.open_from}
                    onChange={(e) => setFormData({ ...formData, open_from: e.target.value })}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="open_to">結束時間</Label>
                  <Input
                    id="open_to"
                    type="datetime-local"
                    value={formData.open_to}
                    onChange={(e) => setFormData({ ...formData, open_to: e.target.value })}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  儲存變更
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteActivity}
                  disabled={saving}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  刪除活動
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Options List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>選項管理 ({activity.options?.length || 0})</CardTitle>
              <Button onClick={() => setShowNewOption(!showNewOption)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                新增選項
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {/* Add New Option Form */}
            {showNewOption && (
              <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">新增選項</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddOption} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">選項標題 *</Label>
                      <Input
                        id="title"
                        value={newOption.title}
                        onChange={(e) => setNewOption({ ...newOption, title: e.target.value })}
                        placeholder="例：選項一"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="option-description">選項說明</Label>
                      <textarea
                        id="option-description"
                        value={newOption.description}
                        onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                        placeholder="例：詳細的選項說明..."
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving}>
                        <Plus className="mr-2 h-4 w-4" />
                        新增
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewOption(false)}
                      >
                        取消
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Options List */}
            {activity.options && activity.options.length > 0 ? (
              <div className="space-y-4">
                {activity.options.map((option, index) => (
                  <Card key={option._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                              {index + 1}
                            </span>
                          </div>
                          
                          <div className="mb-2">
                            <p className="font-semibold text-lg">{option.title}</p>
                            {option.description && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteOption(option._id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                尚未新增任何選項
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ActivityDetailPage() {
  return <ActivityDetailPageContent />;
}
