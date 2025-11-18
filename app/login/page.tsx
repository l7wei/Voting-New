'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardBody, Input, Button, Select, SelectItem, Divider, Spinner } from '@heroui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faIdCard, faUserTag, faKey, faBolt } from '@fortawesome/free-solid-svg-icons';

function MockLoginForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    userid: '',
    name: '',
    inschool: 'true',
    uuid: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.userid || !formData.name) {
        setError('請填寫學號和姓名');
        setLoading(false);
        return;
      }

      const uuid = formData.uuid || generateUUID();
      const code = `mock_code_${Date.now()}`;

      const mockOAuthData = {
        Userid: formData.userid,
        name: formData.name,
        inschool: formData.inschool,
        uuid: uuid,
        timestamp: Date.now(),
      };

      await fetch('/api/mock/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, data: mockOAuthData }),
      });

      const redirectUri = searchParams.get('redirect_uri') || `${window.location.origin}/api/auth/callback`;
      window.location.href = `${redirectUri}?code=${code}`;
    } catch (err) {
      console.error('Login error:', err);
      setError('登入時發生錯誤');
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    setFormData({
      userid: '110000114',
      name: '測試學生',
      inschool: 'true',
      uuid: generateUUID(),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Card className="w-full max-w-md" shadow="lg">
        <CardHeader className="flex flex-col items-center pb-0 pt-8">
          <div className="p-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-4">
            <FontAwesomeIcon icon={faUserCircle} className="text-5xl text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
            模擬 OAuth 登入
          </h1>
          <p className="text-default-600">請輸入您的資訊以模擬 OAuth 認證</p>
        </CardHeader>
        
        <Divider className="my-4" />

        <CardBody>
          {error && (
            <Card className="mb-4 border-danger" shadow="none">
              <CardBody className="py-3">
                <p className="text-danger text-sm">{error}</p>
              </CardBody>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="學號 (userid)"
              placeholder="例如: 110000114"
              value={formData.userid}
              onValueChange={(value) => setFormData({ ...formData, userid: value })}
              isRequired
              variant="bordered"
              startContent={<FontAwesomeIcon icon={faIdCard} className="text-default-400" />}
            />

            <Input
              label="姓名 (name)"
              placeholder="例如: 王小明"
              value={formData.name}
              onValueChange={(value) => setFormData({ ...formData, name: value })}
              isRequired
              variant="bordered"
              startContent={<FontAwesomeIcon icon={faUserTag} className="text-default-400" />}
            />

            <Select
              label="在校狀態 (inschool)"
              selectedKeys={[formData.inschool]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setFormData({ ...formData, inschool: value });
              }}
              isRequired
              variant="bordered"
            >
              <SelectItem key="true">在校 (true)</SelectItem>
              <SelectItem key="false">離校 (false)</SelectItem>
            </Select>

            <Input
              label="UUID (選填，留空自動生成)"
              placeholder="自動生成 UUID"
              value={formData.uuid}
              onValueChange={(value) => setFormData({ ...formData, uuid: value })}
              variant="bordered"
              startContent={<FontAwesomeIcon icon={faKey} className="text-default-400" />}
            />

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                type="submit" 
                color="primary" 
                size="lg"
                isLoading={loading}
                className="font-semibold"
              >
                {loading ? '登入中...' : '登入'}
              </Button>
              
              <Button 
                type="button" 
                variant="flat" 
                size="lg"
                onPress={handleAutoFill}
                startContent={<FontAwesomeIcon icon={faBolt} />}
              >
                快速填入測試資料
              </Button>
            </div>
          </form>

          <Card className="mt-6 bg-primary-50" shadow="none">
            <CardBody>
              <p className="text-sm text-default-700 mb-2 font-semibold">
                說明：
              </p>
              <ul className="text-xs text-default-600 space-y-1 list-disc list-inside">
                <li>此頁面僅用於開發環境模擬 OAuth 登入</li>
                <li>正式環境將使用真實的 OAuth 認證</li>
                <li>UUID 會自動生成用於匿名投票</li>
              </ul>
            </CardBody>
          </Card>
        </CardBody>
      </Card>
    </div>
  );
}

export default function MockLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <Card className="w-full max-w-md" shadow="lg">
          <CardBody className="text-center py-12">
            <Spinner size="lg" label="載入中..." />
          </CardBody>
        </Card>
      </div>
    }>
      <MockLoginForm />
    </Suspense>
  );
}
