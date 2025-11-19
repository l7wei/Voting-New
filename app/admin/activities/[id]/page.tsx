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
  type: string;
  rule: 'choose_one' | 'choose_all';
  open_from: string;
  open_to: string;
  users: string[];
  options: Option[];
}

interface Option {
  _id: string;
  type: string;
  candidate?: {
    name: string;
    department: string;
    college: string;
  };
  vice1?: {
    name: string;
    department: string;
    college: string;
  };
  vice2?: {
    name: string;
    department: string;
    college: string;
  };
}

interface NewOptionForm {
  type: string;
  candidate_name: string;
  candidate_department: string;
  candidate_college: string;
  vice1_name: string;
  vice1_department: string;
  vice1_college: string;
  vice2_name: string;
  vice2_department: string;
  vice2_college: string;
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
    type: '',
    rule: 'choose_one' as 'choose_one' | 'choose_all',
    open_from: '',
    open_to: '',
  });
  
  // New option form
  const [showNewOption, setShowNewOption] = useState(false);
  const [newOption, setNewOption] = useState<NewOptionForm>({
    type: '候選人',
    candidate_name: '',
    candidate_department: '',
    candidate_college: '',
    vice1_name: '',
    vice1_department: '',
    vice1_college: '',
    vice2_name: '',
    vice2_department: '',
    vice2_college: '',
  });

  useEffect(() => {
    fetchActivity();
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
          type: data.data.type,
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
      const optionData: Record<string, unknown> = {
        activity_id: activityId,
        type: newOption.type,
      };

      if (newOption.candidate_name) {
        optionData.candidate = {
          name: newOption.candidate_name,
          department: newOption.candidate_department,
          college: newOption.candidate_college,
        };
      }

      if (newOption.vice1_name) {
        optionData.vice1 = {
          name: newOption.vice1_name,
          department: newOption.vice1_department,
          college: newOption.vice1_college,
        };
      }

      if (newOption.vice2_name) {
        optionData.vice2 = {
          name: newOption.vice2_name,
          department: newOption.vice2_department,
          college: newOption.vice2_college,
        };
      }

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
        setSuccessMessage('候選人已新增');
        setShowNewOption(false);
        setNewOption({
          type: '候選人',
          candidate_name: '',
          candidate_department: '',
          candidate_college: '',
          vice1_name: '',
          vice1_department: '',
          vice1_college: '',
          vice2_name: '',
          vice2_department: '',
          vice2_college: '',
        });
        fetchActivity();
      } else {
        setError(data.error || '新增候選人失敗');
      }
    } catch (err) {
      console.error('Error adding option:', err);
      setError('新增候選人時發生錯誤');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm('確定要刪除此候選人嗎？')) return;

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
        setSuccessMessage('候選人已刪除');
        fetchActivity();
      } else {
        setError(data.error || '刪除候選人失敗');
      }
    } catch (err) {
      console.error('Error deleting option:', err);
      setError('刪除候選人時發生錯誤');
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
                  <Label htmlFor="type">活動類型</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    disabled={saving}
                  />
                </div>
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
              <CardTitle>候選人管理 ({activity.options?.length || 0})</CardTitle>
              <Button onClick={() => setShowNewOption(!showNewOption)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                新增候選人
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {/* Add New Option Form */}
            {showNewOption && (
              <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">新增候選人</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddOption} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">類型</Label>
                      <Input
                        id="type"
                        value={newOption.type}
                        onChange={(e) => setNewOption({ ...newOption, type: e.target.value })}
                        placeholder="例：候選人"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">正選候選人</h4>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <Input
                          placeholder="姓名 *"
                          value={newOption.candidate_name}
                          onChange={(e) => setNewOption({ ...newOption, candidate_name: e.target.value })}
                          required
                        />
                        <Input
                          placeholder="系所"
                          value={newOption.candidate_department}
                          onChange={(e) => setNewOption({ ...newOption, candidate_department: e.target.value })}
                        />
                        <Input
                          placeholder="學院"
                          value={newOption.candidate_college}
                          onChange={(e) => setNewOption({ ...newOption, candidate_college: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">副選候選人 1（選填）</h4>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <Input
                          placeholder="姓名"
                          value={newOption.vice1_name}
                          onChange={(e) => setNewOption({ ...newOption, vice1_name: e.target.value })}
                        />
                        <Input
                          placeholder="系所"
                          value={newOption.vice1_department}
                          onChange={(e) => setNewOption({ ...newOption, vice1_department: e.target.value })}
                        />
                        <Input
                          placeholder="學院"
                          value={newOption.vice1_college}
                          onChange={(e) => setNewOption({ ...newOption, vice1_college: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">副選候選人 2（選填）</h4>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <Input
                          placeholder="姓名"
                          value={newOption.vice2_name}
                          onChange={(e) => setNewOption({ ...newOption, vice2_name: e.target.value })}
                        />
                        <Input
                          placeholder="系所"
                          value={newOption.vice2_department}
                          onChange={(e) => setNewOption({ ...newOption, vice2_department: e.target.value })}
                        />
                        <Input
                          placeholder="學院"
                          value={newOption.vice2_college}
                          onChange={(e) => setNewOption({ ...newOption, vice2_college: e.target.value })}
                        />
                      </div>
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
                            <span className="text-sm text-muted-foreground">{option.type}</span>
                          </div>
                          
                          {option.candidate && (
                            <div className="mb-2">
                              <p className="font-semibold">{option.candidate.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {option.candidate.department} | {option.candidate.college}
                              </p>
                            </div>
                          )}

                          {option.vice1 && (
                            <div className="ml-4 mb-1 text-sm">
                              <span className="text-muted-foreground">副選 1: </span>
                              <span>{option.vice1.name}</span>
                              <span className="text-muted-foreground"> ({option.vice1.department})</span>
                            </div>
                          )}

                          {option.vice2 && (
                            <div className="ml-4 text-sm">
                              <span className="text-muted-foreground">副選 2: </span>
                              <span>{option.vice2.name}</span>
                              <span className="text-muted-foreground"> ({option.vice2.department})</span>
                            </div>
                          )}
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
                尚未新增任何候選人
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
