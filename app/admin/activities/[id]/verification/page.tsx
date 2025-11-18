'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import AdminGuard from '@/components/auth/AdminGuard';
import { 
  Card, 
  CardHeader,
  CardBody, 
  Button, 
  Spinner,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input
} from '@heroui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faCheckCircle,
  faSearch,
  faCopy
} from '@fortawesome/free-solid-svg-icons';

interface VotedToken {
  uuid: string;
  voted_at: string;
}

interface VerificationData {
  activity_id: string;
  total_votes: number;
  voted_tokens: VotedToken[];
}

function VerificationPageContent() {
  const params = useParams();
  const activityId = params?.id as string;
  
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activityId) {
      fetchVerificationData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  const fetchVerificationData = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}/verification`, {
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || '無法載入驗票資料');
      }
    } catch (err) {
      console.error('Error fetching verification data:', err);
      setError('載入驗票資料時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const filteredTokens = data?.voted_tokens.filter(token => 
    token.uuid.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            as={Link}
            href={`/admin/activities/${activityId}`}
            isIconOnly
            variant="light"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
          </Button>
          <div>
            <h2 className="text-4xl font-bold text-neutral-900 mb-2">
              投票驗證
            </h2>
            <p className="text-neutral-600">查看已投票的 UUID 列表</p>
          </div>
        </div>

        {error && (
          <Card className="mb-6 bg-danger-50 border-danger-200">
            <CardBody>
              <p className="text-danger-800">{error}</p>
            </CardBody>
          </Card>
        )}

        {/* Stats Card */}
        <Card shadow="sm" className="glass-card mb-6">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">總投票數</p>
                <p className="text-4xl font-bold text-neutral-900">{data?.total_votes || 0}</p>
              </div>
              <div className="p-4 bg-success-100 rounded-xl">
                <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tokens Table */}
        <Card shadow="sm" className="glass-card">
          <CardHeader className="pb-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-neutral-900">已投票 UUID 列表</h3>
            <Input
              placeholder="搜尋 UUID..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<FontAwesomeIcon icon={faSearch} className="text-neutral-400" />}
              className="w-64"
              size="sm"
            />
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            {filteredTokens.length === 0 ? (
              <div className="text-center py-16 px-4">
                <p className="text-neutral-600 mb-6 text-lg">
                  {searchTerm ? '找不到符合的 UUID' : '目前沒有任何投票記錄'}
                </p>
              </div>
            ) : (
              <Table aria-label="已投票 UUID" removeWrapper>
                <TableHeader>
                  <TableColumn>#</TableColumn>
                  <TableColumn>UUID</TableColumn>
                  <TableColumn>投票時間</TableColumn>
                  <TableColumn>操作</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredTokens.map((token, index) => (
                    <TableRow key={token.uuid}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-neutral-100 px-2 py-1 rounded">
                          {token.uuid}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-neutral-600">
                          {formatDate(token.voted_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="flat"
                          isIconOnly
                          onPress={() => copyToClipboard(token.uuid)}
                          title="複製 UUID"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </Button>
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

export default function VerificationPage() {
  return (
    <AdminGuard>
      <VerificationPageContent />
    </AdminGuard>
  );
}
