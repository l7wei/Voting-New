'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Card, 
  CardHeader,
  CardBody, 
  Button, 
  Input,
  Textarea,
  Chip,
  Spinner,
  Divider,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faTrash,
  faChartBar,
  faUser,
  faArrowLeft
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

export default function ActivityManagementPage() {
  const params = useParams();
  const activityId = params.id as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteOptionId, setDeleteOptionId] = useState<string | null>(null);

  // Form state for adding candidate
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    department: '',
    college: '',
    avatar_url: '',
    personal_experiences: '',
    political_opinions: ''
  });
  
  const [vice1Form, setVice1Form] = useState({
    name: '',
    department: '',
    college: '',
    avatar_url: '',
    personal_experiences: ''
  });
  
  const [vice2Form, setVice2Form] = useState({
    name: '',
    department: '',
    college: '',
    avatar_url: '',
    personal_experiences: ''
  });
  
  const [includeVice1, setIncludeVice1] = useState(false);
  const [includeVice2, setIncludeVice2] = useState(false);

  useEffect(() => {
    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}?include_options=true`);
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

  const resetForm = () => {
    setCandidateForm({
      name: '',
      department: '',
      college: '',
      avatar_url: '',
      personal_experiences: '',
      political_opinions: ''
    });
    setVice1Form({
      name: '',
      department: '',
      college: '',
      avatar_url: '',
      personal_experiences: ''
    });
    setVice2Form({
      name: '',
      department: '',
      college: '',
      avatar_url: '',
      personal_experiences: ''
    });
    setIncludeVice1(false);
    setIncludeVice2(false);
  };

  const handleAddCandidate = async () => {
    setError('');
    setSubmitting(true);
    
    try {
      // Validate required fields
      if (!candidateForm.name || !candidateForm.department || !candidateForm.college) {
        setError('請填寫所有必填欄位');
        setSubmitting(false);
        return;
      }

      // Build the request body
      const body: Record<string, unknown> = {
        activity_id: activityId,
        type: 'candidate',
        candidate: {
          name: candidateForm.name,
          department: candidateForm.department,
          college: candidateForm.college,
          ...(candidateForm.avatar_url && { avatar_url: candidateForm.avatar_url }),
          ...(candidateForm.personal_experiences && { 
            personal_experiences: candidateForm.personal_experiences.split('\n').filter(e => e.trim()) 
          }),
          ...(candidateForm.political_opinions && { 
            political_opinions: candidateForm.political_opinions.split('\n').filter(o => o.trim()) 
          })
        }
      };

      if (includeVice1 && vice1Form.name && vice1Form.department && vice1Form.college) {
        body.vice1 = {
          name: vice1Form.name,
          department: vice1Form.department,
          college: vice1Form.college,
          ...(vice1Form.avatar_url && { avatar_url: vice1Form.avatar_url }),
          ...(vice1Form.personal_experiences && { 
            personal_experiences: vice1Form.personal_experiences.split('\n').filter(e => e.trim()) 
          })
        };
      }

      if (includeVice2 && vice2Form.name && vice2Form.department && vice2Form.college) {
        body.vice2 = {
          name: vice2Form.name,
          department: vice2Form.department,
          college: vice2Form.college,
          ...(vice2Form.avatar_url && { avatar_url: vice2Form.avatar_url }),
          ...(vice2Form.personal_experiences && { 
            personal_experiences: vice2Form.personal_experiences.split('\n').filter(e => e.trim()) 
          })
        };
      }

      const response = await fetch('/api/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        resetForm();
        await fetchActivity();
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
    setDeleteOptionId(optionId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteOptionId) return;

    try {
      const response = await fetch(`/api/options/${deleteOptionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setDeleteModalOpen(false);
        setDeleteOptionId(null);
        await fetchActivity();
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
      <div className="min-h-screen bg-gradient-indigo">
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
      <div className="min-h-screen bg-gradient-indigo">
        <Header />
        <main className="container mx-auto max-w-7xl px-6 py-12">
          <Card shadow="sm">
            <CardBody className="text-center py-16">
              <h2 className="text-2xl font-bold text-default-900 mb-4">找不到投票活動</h2>
              <Button
                as={Link}
                href="/admin"
                color="primary"
                size="lg"
              >
                返回管理後台
              </Button>
            </CardBody>
          </Card>
        </main>
      </div>
    );
  }

  const getStatusChip = () => {
    const now = new Date();
    const openFrom = new Date(activity.open_from);
    const openTo = new Date(activity.open_to);

    if (now < openFrom) {
      return <Chip color="warning" variant="flat" size="sm">即將開始</Chip>;
    } else if (now > openTo) {
      return <Chip color="default" variant="flat" size="sm">已結束</Chip>;
    } else {
      return <Chip color="success" variant="flat" size="sm">進行中</Chip>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-indigo">
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
              size="lg"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-default-900">{activity.name}</h1>
                {getStatusChip()}
              </div>
              <p className="text-default-600 mt-1">管理候選人與活動設定</p>
            </div>
          </div>
          <Button
            as={Link}
            href={`/admin/activities/${activityId}/results`}
            color="secondary"
            variant="flat"
            startContent={<FontAwesomeIcon icon={faChartBar} />}
          >
            查看統計
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-danger" shadow="sm">
            <CardBody>
              <p className="text-danger">{error}</p>
            </CardBody>
          </Card>
        )}

        {/* Activity Info Card */}
        <Card shadow="sm" className="mb-8">
          <CardHeader className="pb-4">
            <h2 className="text-xl font-bold">活動資訊</h2>
          </CardHeader>
          <Divider />
          <CardBody className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-default-600 mb-1">活動類型</p>
                <p className="font-semibold text-default-900">{activity.type}</p>
              </div>
              <div>
                <p className="text-sm text-default-600 mb-1">投票方式</p>
                <p className="font-semibold text-default-900">
                  {activity.rule === 'choose_all' ? '多選評分' : '單選'}
                </p>
              </div>
              <div>
                <p className="text-sm text-default-600 mb-1">候選人數</p>
                <p className="font-semibold text-default-900">{activity.options.length}</p>
              </div>
              <div>
                <p className="text-sm text-default-600 mb-1">開始時間</p>
                <p className="font-semibold text-default-900">
                  {new Date(activity.open_from).toLocaleString('zh-TW')}
                </p>
              </div>
              <div>
                <p className="text-sm text-default-600 mb-1">結束時間</p>
                <p className="font-semibold text-default-900">
                  {new Date(activity.open_to).toLocaleString('zh-TW')}
                </p>
              </div>
              <div>
                <p className="text-sm text-default-600 mb-1">已投票人數</p>
                <p className="font-semibold text-default-900">{activity.users.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Candidates Card */}
        <Card shadow="sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-xl font-bold">候選人列表</h2>
              <Button
                color="primary"
                onPress={onOpen}
                startContent={<FontAwesomeIcon icon={faPlus} />}
              >
                新增候選人
              </Button>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="pt-6">
            {activity.options.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
                  <FontAwesomeIcon icon={faUser} className="text-4xl text-primary-600" />
                </div>
                <p className="text-default-600 mb-6">目前沒有候選人</p>
                <Button
                  color="primary"
                  onPress={onOpen}
                  startContent={<FontAwesomeIcon icon={faPlus} />}
                >
                  新增第一位候選人
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activity.options.map((option, index) => (
                  <Card key={option._id} shadow="none" className="border-2">
                    <CardBody>
                      <div className="flex justify-between items-start mb-4">
                        <Chip color="primary" variant="flat">候選人 {index + 1}</Chip>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          startContent={<FontAwesomeIcon icon={faTrash} />}
                          onPress={() => handleDeleteOption(option._id)}
                        >
                          刪除
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {option.candidate && (
                          <div className="flex items-start gap-4">
                            {option.candidate.avatar_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={option.candidate.avatar_url}
                                alt={option.candidate.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-default-900">
                                會長：{option.candidate.name}
                              </p>
                              <p className="text-sm text-default-600">{option.candidate.department}</p>
                              <p className="text-sm text-default-500">{option.candidate.college}</p>
                              {option.candidate.political_opinions && option.candidate.political_opinions.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-default-500 font-semibold">政見：</p>
                                  <ul className="text-xs text-default-600 list-disc list-inside">
                                    {option.candidate.political_opinions.map((opinion, i) => (
                                      <li key={i}>{opinion}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {option.vice1 && (
                          <Divider />
                        )}
                        {option.vice1 && (
                          <div className="flex items-start gap-4">
                            {option.vice1.avatar_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={option.vice1.avatar_url}
                                alt={option.vice1.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-default-900">
                                副會長一：{option.vice1.name}
                              </p>
                              <p className="text-sm text-default-600">{option.vice1.department}</p>
                              <p className="text-sm text-default-500">{option.vice1.college}</p>
                            </div>
                          </div>
                        )}
                        {option.vice2 && (
                          <Divider />
                        )}
                        {option.vice2 && (
                          <div className="flex items-start gap-4">
                            {option.vice2.avatar_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={option.vice2.avatar_url}
                                alt={option.vice2.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-default-900">
                                副會長二：{option.vice2.name}
                              </p>
                              <p className="text-sm text-default-600">{option.vice2.department}</p>
                              <p className="text-sm text-default-500">{option.vice2.college}</p>
                            </div>
                          </div>
                        )}
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
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                新增候選人
              </ModalHeader>
              <ModalBody>
                {error && (
                  <Card className="mb-4 border-danger" shadow="none">
                    <CardBody className="py-3">
                      <p className="text-danger text-sm">{error}</p>
                    </CardBody>
                  </Card>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">主要候選人資訊</h3>
                    <div className="space-y-4">
                      <Input
                        label="姓名"
                        placeholder="王小明"
                        value={candidateForm.name}
                        onValueChange={(value) => setCandidateForm({ ...candidateForm, name: value })}
                        isRequired
                        variant="bordered"
                      />
                      <Input
                        label="系所"
                        placeholder="資訊工程學系 22 級"
                        value={candidateForm.department}
                        onValueChange={(value) => setCandidateForm({ ...candidateForm, department: value })}
                        isRequired
                        variant="bordered"
                      />
                      <Input
                        label="學院"
                        placeholder="電機資訊學院"
                        value={candidateForm.college}
                        onValueChange={(value) => setCandidateForm({ ...candidateForm, college: value })}
                        isRequired
                        variant="bordered"
                      />
                      <Input
                        label="照片網址"
                        placeholder="https://example.com/photo.jpg"
                        value={candidateForm.avatar_url}
                        onValueChange={(value) => setCandidateForm({ ...candidateForm, avatar_url: value })}
                        variant="bordered"
                        type="url"
                      />
                      <Textarea
                        label="個人經歷（每行一項）"
                        placeholder="國立清華大學105學年度下學期-書卷獎"
                        value={candidateForm.personal_experiences}
                        onValueChange={(value) => setCandidateForm({ ...candidateForm, personal_experiences: value })}
                        variant="bordered"
                        minRows={2}
                      />
                      <Textarea
                        label="政見（每行一項）"
                        placeholder="1. 履行會長之職責。"
                        value={candidateForm.political_opinions}
                        onValueChange={(value) => setCandidateForm({ ...candidateForm, political_opinions: value })}
                        variant="bordered"
                        minRows={2}
                      />
                    </div>
                  </div>

                  <Divider />

                  <div className="space-y-4">
                    <Checkbox
                      isSelected={includeVice1}
                      onValueChange={setIncludeVice1}
                    >
                      包含副會長一
                    </Checkbox>

                    {includeVice1 && (
                      <div className="space-y-4 pl-6">
                        <Input
                          label="姓名"
                          placeholder="陳小明"
                          value={vice1Form.name}
                          onValueChange={(value) => setVice1Form({ ...vice1Form, name: value })}
                          variant="bordered"
                          size="sm"
                        />
                        <Input
                          label="系所"
                          placeholder="科技管理學院學士班 22 級"
                          value={vice1Form.department}
                          onValueChange={(value) => setVice1Form({ ...vice1Form, department: value })}
                          variant="bordered"
                          size="sm"
                        />
                        <Input
                          label="學院"
                          placeholder="科技管理學院"
                          value={vice1Form.college}
                          onValueChange={(value) => setVice1Form({ ...vice1Form, college: value })}
                          variant="bordered"
                          size="sm"
                        />
                        <Input
                          label="照片網址"
                          placeholder="https://example.com/photo.jpg"
                          value={vice1Form.avatar_url}
                          onValueChange={(value) => setVice1Form({ ...vice1Form, avatar_url: value })}
                          variant="bordered"
                          type="url"
                          size="sm"
                        />
                      </div>
                    )}
                  </div>

                  <Divider />

                  <div className="space-y-4">
                    <Checkbox
                      isSelected={includeVice2}
                      onValueChange={setIncludeVice2}
                    >
                      包含副會長二
                    </Checkbox>

                    {includeVice2 && (
                      <div className="space-y-4 pl-6">
                        <Input
                          label="姓名"
                          placeholder="劉曉明"
                          value={vice2Form.name}
                          onValueChange={(value) => setVice2Form({ ...vice2Form, name: value })}
                          variant="bordered"
                          size="sm"
                        />
                        <Input
                          label="系所"
                          placeholder="教育與學習科技學系 24 級"
                          value={vice2Form.department}
                          onValueChange={(value) => setVice2Form({ ...vice2Form, department: value })}
                          variant="bordered"
                          size="sm"
                        />
                        <Input
                          label="學院"
                          placeholder="教育學院"
                          value={vice2Form.college}
                          onValueChange={(value) => setVice2Form({ ...vice2Form, college: value })}
                          variant="bordered"
                          size="sm"
                        />
                        <Input
                          label="照片網址"
                          placeholder="https://example.com/photo.jpg"
                          value={vice2Form.avatar_url}
                          onValueChange={(value) => setVice2Form({ ...vice2Form, avatar_url: value })}
                          variant="bordered"
                          type="url"
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    resetForm();
                    onClose();
                  }}
                >
                  取消
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleAddCandidate();
                    onClose();
                  }}
                  isLoading={submitting}
                >
                  確認新增
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>確認刪除</ModalHeader>
              <ModalBody>
                <p>確定要刪除此候選人嗎？此操作無法復原。</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={onClose}
                >
                  取消
                </Button>
                <Button
                  color="danger"
                  onPress={confirmDelete}
                >
                  確認刪除
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
