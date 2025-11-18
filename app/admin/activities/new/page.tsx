'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminGuard from '@/components/auth/AdminGuard';
import { Card, CardBody, CardHeader, Button, Input, Select, SelectItem } from '@heroui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function NewActivityPageContent() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'candidate',
    rule: 'choose_all' as 'choose_all' | 'choose_one',
    open_from: '',
    open_to: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const openFrom = new Date(formData.open_from);
      const openTo = new Date(formData.open_to);
      
      if (openFrom >= openTo) {
        setError('開始時間必須早於結束時間');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/admin/activities/${data.data._id}`);
      } else {
        setError(data.error || '建立活動失敗');
      }
    } catch (err) {
      console.error('Error creating activity:', err);
      setError('建立活動時發生錯誤');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="glass-card-strong sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              as={Link}
              href="/admin"
              isIconOnly
              variant="light"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">新增投票活動</h1>
              <p className="text-neutral-600 mt-1 text-sm">建立新的投票活動</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-danger-50 border-danger-200">
            <CardBody>
              <p className="text-danger-800">{error}</p>
            </CardBody>
          </Card>
        )}

        {/* Form */}
        <Card className="glass-card">
          <CardHeader className="pb-4">
            <h2 className="text-xl font-bold text-neutral-900">活動資訊</h2>
          </CardHeader>
          <CardBody className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="活動名稱"
                placeholder="例如：第30屆學生會正副會長選舉"
                value={formData.name}
                onValueChange={(value) => handleChange('name', value)}
                isRequired
                variant="bordered"
                labelPlacement="outside"
                size="lg"
              />

              <Input
                label="活動類型"
                placeholder="例如：candidate（候選人）"
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
                isRequired
                variant="bordered"
                labelPlacement="outside"
                size="lg"
                description="建議使用英文類型，如：candidate（候選人）、referendum（公投）等"
              />

              <Select
                label="投票方式"
                selectedKeys={[formData.rule]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  handleChange('rule', selected);
                }}
                isRequired
                variant="bordered"
                labelPlacement="outside"
                size="lg"
              >
                <SelectItem key="choose_all">
                  多選評分（對每位候選人表達支持/反對/無意見）
                </SelectItem>
                <SelectItem key="choose_one">
                  單選（只能選擇一位候選人）
                </SelectItem>
              </Select>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="datetime-local"
                  label="開始時間"
                  value={formData.open_from}
                  onValueChange={(value) => handleChange('open_from', value)}
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                  size="lg"
                />

                <Input
                  type="datetime-local"
                  label="結束時間"
                  value={formData.open_to}
                  onValueChange={(value) => handleChange('open_to', value)}
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                  size="lg"
                />
              </div>

              <Card className="bg-neutral-50 border-neutral-200">
                <CardBody className="flex flex-row gap-3">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-primary text-xl flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-neutral-700">
                    <p className="font-semibold mb-2">注意事項</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>建立活動後，您可以新增候選人和選項</li>
                      <li>開始時間必須早於結束時間</li>
                      <li>投票僅在開始時間和結束時間之間開放</li>
                    </ul>
                  </div>
                </CardBody>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  as={Link}
                  href="/admin"
                  variant="bordered"
                  size="lg"
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  isLoading={submitting}
                  className="flex-1"
                >
                  建立活動
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

export default function NewActivityPage() {
  return (
    <AdminGuard>
      <NewActivityPageContent />
    </AdminGuard>
  );
}
