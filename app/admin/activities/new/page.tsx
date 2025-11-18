'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Input, Select, SelectItem, Divider } from '@heroui/react';

export default function NewActivityPage() {
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
      // Validate dates
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
        // Navigate to the activity management page
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              as={Link}
              href="/admin"
              isIconOnly
              variant="light"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">新增投票活動</h1>
              <p className="text-gray-600 mt-1 text-sm">建立新的投票活動</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-danger-200 bg-danger-50">
            <CardBody>
              <p className="text-danger-800">{error}</p>
            </CardBody>
          </Card>
        )}

        {/* Form */}
        <Card className="border-none bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <h2 className="text-xl font-bold text-gray-900">活動資訊</h2>
          </CardHeader>
          <Divider />
          <CardBody className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Activity Name */}
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

              {/* Activity Type */}
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

              {/* Voting Rule */}
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

              {/* Date/Time Inputs */}
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

              {/* Info Box */}
              <Card className="border-primary-200 bg-primary-50">
                <CardBody className="flex flex-row gap-3">
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-primary-900">
                    <p className="font-semibold mb-2">注意事項：</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>建立活動後，您可以新增候選人和選項</li>
                      <li>開始時間必須早於結束時間</li>
                      <li>投票僅在開始時間和結束時間之間開放</li>
                      <li>活動建立後仍可編輯，但建議在投票開始前完成所有設定</li>
                    </ul>
                  </div>
                </CardBody>
              </Card>

              {/* Submit Buttons */}
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
