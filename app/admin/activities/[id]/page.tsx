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
  Input,
  Textarea,
  Chip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faPlus,
  faTrash,
  faChartBar,
  faClipboardCheck
} from '@fortawesome/free-solid-svg-icons';

interface Candidate {
  name: string;
  department: string;
  college: string;
  avatar_url?: string;
  personal_experiences?: string[];
  political_opinions?: string[];
}

interface Option {
  _id: string;
  type: string;
  candidate?: Candidate;
  vice1?: Candidate;
  vice2?: Candidate;
}

interface Activity {
  _id: string;
  name: string;
  type: string;
  rule: 'choose_all' | 'choose_one';
  open_from: string;
  open_to: string;
  users: string[];
  options: Option[];
}

function ActivityManagementContent() {
  const params = useParams();
  const activityId = params?.id as string;
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Candidate form state
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    department: '',
    college: '',
    avatar_url: '',
    personal_experiences: '',
    political_opinions: '',
  });

  useEffect(() => {
    if (activityId) {
      fetchActivity();
    }
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
      } else {
        setError(data.error || '無法載入投票活動');
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError('載入投票活動時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async () => {
    setError('');
    setSubmitting(true);
    
    try {
      const candidate = {
        name: candidateForm.name,
        department: candidateForm.department,
        college: candidateForm.college,
        avatar_url: candidateForm.avatar_url || undefined,
        personal_experiences: candidateForm.personal_experiences 
          ? candidateForm.personal_experiences.split('\n').filter(e => e.trim())
          : [],
        political_opinions: candidateForm.political_opinions
          ? candidateForm.political_opinions.split('\n').filter(p => p.trim())
          : [],
      };

      const response = await fetch('/api/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          activity_id: activityId,
          type: 'candidate',
          candidate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onClose();
        setCandidateForm({
          name: '',
          department: '',
          college: '',
          avatar_url: '',
          personal_experiences: '',
          political_opinions: '',
        });
        fetchActivity();
      } else {
        setError(data.error || '新增候選人失敗');
      }
    } catch (err) {
      console.error('Error adding candidate:', err);
      setError('新增候選人時發生錯誤');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm('確定要刪除此候選人嗎？')) {
      return;
    }

    try {
      const response = await fetch(`/api/options/${optionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        fetchActivity();
      } else {
        setError(data.error || '刪除候選人失敗');
      }
    } catch (err) {
      console.error('Error deleting option:', err);
      setError('刪除候選人時發生錯誤');
    }
  };

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

  if (!activity) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <Header />
        <main className="container mx-auto max-w-7xl px-6 py-12">
          <Card className="glass-card text-center p-8">
            <CardBody>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">找不到投票活動</h2>
              <Button
                as={Link}
                href="/admin"
                color="primary"
              >
                返回管理後台
              </Button>
            </CardBody>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />

      <main className="container mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
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
              <h1 className="text-4xl font-bold text-neutral-900">{activity.name}</h1>
              <p className="text-neutral-600 mt-1">管理候選人與活動設定</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              as={Link}
              href={`/admin/activities/${activityId}/results`}
              variant="flat"
              startContent={<FontAwesomeIcon icon={faChartBar} />}
            >
              查看統計
            </Button>
            <Button
              as={Link}
              href={`/admin/activities/${activityId}/verification`}
              variant="flat"
              startContent={<FontAwesomeIcon icon={faClipboardCheck} />}
            >
              驗票
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-danger-50 border-danger-200">
            <CardBody>
              <p className="text-danger-800">{error}</p>
            </CardBody>
          </Card>
        )}

        {/* Activity Info */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <h2 className="text-xl font-bold text-neutral-900">活動資訊</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600 mb-1">活動類型</p>
                <p className="font-semibold text-neutral-900">{activity.type}</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600 mb-1">投票方式</p>
                <p className="font-semibold text-neutral-900">
                  {activity.rule === 'choose_all' ? '多選評分' : '單選'}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600 mb-1">候選人數</p>
                <p className="font-semibold text-neutral-900">{activity.options.length}</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600 mb-1">已投票人數</p>
                <p className="font-semibold text-neutral-900">{activity.users.length}</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600 mb-1">開始時間</p>
                <p className="font-semibold text-neutral-900 text-sm">
                  {new Date(activity.open_from).toLocaleString('zh-TW')}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600 mb-1">結束時間</p>
                <p className="font-semibold text-neutral-900 text-sm">
                  {new Date(activity.open_to).toLocaleString('zh-TW')}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Candidates Section */}
        <Card className="glass-card">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-neutral-900">候選人列表</h2>
            <Button
              color="primary"
              startContent={<FontAwesomeIcon icon={faPlus} />}
              onPress={onOpen}
            >
              新增候選人
            </Button>
          </CardHeader>
          <Divider />
          <CardBody>
            {activity.options.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-600 mb-4">目前沒有候選人</p>
                <Button
                  color="primary"
                  startContent={<FontAwesomeIcon icon={faPlus} />}
                  onPress={onOpen}
                >
                  新增第一個候選人
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {activity.options.map((option) => (
                  <Card key={option._id} className="border border-neutral-200" shadow="none">
                    <CardBody className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-neutral-900">
                              {option.candidate?.name}
                            </h3>
                            <Chip size="sm" variant="flat">
                              {option.candidate?.college}
                            </Chip>
                          </div>
                          <p className="text-neutral-600 mb-4">{option.candidate?.department}</p>
                          
                          {option.candidate?.personal_experiences && option.candidate.personal_experiences.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-neutral-700 mb-1">經歷</p>
                              <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                                {option.candidate.personal_experiences.map((exp, i) => (
                                  <li key={i}>{exp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {option.candidate?.political_opinions && option.candidate.political_opinions.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-neutral-700 mb-1">政見</p>
                              <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                                {option.candidate.political_opinions.map((opinion, i) => (
                                  <li key={i}>{opinion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Button
                          isIconOnly
                          color="danger"
                          variant="flat"
                          size="sm"
                          onPress={() => handleDeleteOption(option._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </main>

      {/* Add Candidate Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>新增候選人</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="姓名"
                placeholder="例如：王小明"
                value={candidateForm.name}
                onValueChange={(value) => setCandidateForm({ ...candidateForm, name: value })}
                isRequired
                variant="bordered"
              />
              <Input
                label="學院"
                placeholder="例如：資訊電機學院"
                value={candidateForm.college}
                onValueChange={(value) => setCandidateForm({ ...candidateForm, college: value })}
                isRequired
                variant="bordered"
              />
              <Input
                label="系所"
                placeholder="例如：資訊工程學系"
                value={candidateForm.department}
                onValueChange={(value) => setCandidateForm({ ...candidateForm, department: value })}
                isRequired
                variant="bordered"
              />
              <Input
                label="照片網址"
                placeholder="https://example.com/photo.jpg（選填）"
                value={candidateForm.avatar_url}
                onValueChange={(value) => setCandidateForm({ ...candidateForm, avatar_url: value })}
                variant="bordered"
              />
              <Textarea
                label="個人經歷"
                placeholder="每行一項經歷（選填）"
                value={candidateForm.personal_experiences}
                onValueChange={(value) => setCandidateForm({ ...candidateForm, personal_experiences: value })}
                variant="bordered"
                minRows={3}
              />
              <Textarea
                label="政見"
                placeholder="每行一項政見（選填）"
                value={candidateForm.political_opinions}
                onValueChange={(value) => setCandidateForm({ ...candidateForm, political_opinions: value })}
                variant="bordered"
                minRows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              取消
            </Button>
            <Button 
              color="primary" 
              onPress={handleAddCandidate}
              isLoading={submitting}
              isDisabled={!candidateForm.name || !candidateForm.college || !candidateForm.department}
            >
              新增
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function ActivityManagementPage() {
  return (
    <AdminGuard>
      <ActivityManagementContent />
    </AdminGuard>
  );
}
