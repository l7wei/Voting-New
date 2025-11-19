"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/ui/loader";
import {
  CheckCircle2,
  Tag,
  Briefcase,
  FileText,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Candidate {
  name: string;
  department?: string;
  college?: string;
  avatar_url?: string;
  personal_experiences?: string[];
  political_opinions?: string[];
}

interface Option {
  _id: string;
  label?: string;
  candidate?: Candidate;
  vice1?: Candidate;
  vice2?: Candidate;
}

interface Activity {
  _id: string;
  name: string;
  type: string;
  description?: string;
  rule: "choose_all" | "choose_one";
  open_from: string;
  open_to: string;
  options: Option[];
}

interface UserData {
  student_id: string;
  name: string;
}

export default function VotingPage() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voteToken, setVoteToken] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [votedActivityIds, setVotedActivityIds] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Vote state
  const [chooseAllVotes, setChooseAllVotes] = useState<Record<string, string>>(
    {},
  );
  const [chooseOneVote, setChooseOneVote] = useState<string>("");

  useEffect(() => {
    fetchActivity();
    loadVotingHistory();
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  const loadVotingHistory = () => {
    try {
      const history = localStorage.getItem("voting_history");
      if (history) {
        const parsed = JSON.parse(history);
        setVotedActivityIds(parsed.votedActivityIds || []);
      }
    } catch (err) {
      console.error("Error loading voting history:", err);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUserData({
            student_id: data.user.student_id,
            name: data.user.name,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const saveVotingRecord = (
    activityId: string,
    token: string,
    activityName: string,
  ) => {
    try {
      const history = localStorage.getItem("voting_history");
      const parsed = history
        ? JSON.parse(history)
        : { votedActivityIds: [], votes: [] };

      // Add activity ID if not already present
      if (!parsed.votedActivityIds.includes(activityId)) {
        parsed.votedActivityIds.push(activityId);
      }

      // Add vote record
      parsed.votes.push({
        activityId,
        activityName,
        token,
        timestamp: new Date().toISOString(),
      });

      localStorage.setItem("voting_history", JSON.stringify(parsed));
      setVotedActivityIds(parsed.votedActivityIds);
    } catch (err) {
      console.error("Error saving voting record:", err);
    }
  };

  const fetchAllActivities = async () => {
    try {
      const response = await fetch("/api/activities");
      const data = await response.json();

      if (data.success) {
        // Filter only active activities
        const now = new Date();
        const activeActivities = data.data.filter((act: Activity) => {
          const openFrom = new Date(act.open_from);
          const openTo = new Date(act.open_to);
          return now >= openFrom && now <= openTo;
        });
        setAllActivities(activeActivities);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await fetch(
        `/api/activities/${activityId}?include_options=true`,
      );
      const data = await response.json();

      if (data.success) {
        setActivity(data.data);

        // Initialize vote state for choose_all
        if (data.data.rule === "choose_all") {
          const initialVotes: Record<string, string> = {};
          data.data.options.forEach((option: Option) => {
            initialVotes[option._id] = "我沒有意見";
          });
          setChooseAllVotes(initialVotes);
        }
      } else {
        setError(data.error || "無法載入投票活動");
      }
    } catch (err) {
      console.error("Error fetching activity:", err);
      setError("載入投票活動時發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  const handleChooseAllChange = (optionId: string, remark: string) => {
    setChooseAllVotes((prev) => ({
      ...prev,
      [optionId]: remark,
    }));
  };

  const handleSubmitVote = async () => {
    if (!activity) return;

    // Validate vote
    if (activity.rule === "choose_one" && !chooseOneVote) {
      setError("請選擇一個選項");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const voteData = {
        activity_id: activityId,
        rule: activity.rule,
        ...(activity.rule === "choose_all"
          ? {
              choose_all: Object.entries(chooseAllVotes).map(
                ([option_id, remark]) => ({
                  option_id,
                  remark,
                }),
              ),
            }
          : {
              choose_one: chooseOneVote,
            }),
      };

      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(voteData),
      });

      const data = await response.json();

      if (data.success) {
        setVoteToken(data.data.token);
        saveVotingRecord(activityId, data.data.token, activity.name);
        await fetchAllActivities();
        setShowConfirmation(true);
      } else {
        setError(data.error || "投票失敗");
      }
    } catch (err) {
      console.error("Error submitting vote:", err);
      setError("投票時發生錯誤");
    } finally {
      setSubmitting(false);
    }
  };

  const renderCandidate = (candidate: Candidate, role?: string) => {
    return (
      <Card className="mb-4 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-50">
        <CardContent className="p-4">
          <div className="mb-3 flex items-start gap-4">
            {candidate.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={candidate.avatar_url}
                alt={candidate.name}
                className="h-20 w-20 flex-shrink-0 rounded-full border-4 border-white object-cover shadow-lg"
              />
            )}
            <div className="flex-1">
              {role && (
                <Badge variant="default" className="mb-2">
                  {role}
                </Badge>
              )}
              <h4 className="mb-1 text-xl font-bold">{candidate.name}</h4>
              {(candidate.department || candidate.college) && (
                <>
                  {candidate.department && (
                    <p className="text-sm font-medium text-primary">
                      {candidate.department}
                    </p>
                  )}
                  {candidate.college && (
                    <p className="text-sm text-muted-foreground">
                      {candidate.college}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {candidate.personal_experiences &&
            candidate.personal_experiences.length > 0 && (
              <div className="mb-3 rounded-lg bg-white/80 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <p className="text-sm font-bold">經歷</p>
                </div>
                <ul className="space-y-1">
                  {candidate.personal_experiences.map((exp, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="mr-2 text-primary">•</span>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {candidate.political_opinions &&
            candidate.political_opinions.length > 0 && (
              <div className="rounded-lg bg-white/80 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <p className="text-sm font-bold">政見</p>
                </div>
                <ul className="space-y-1">
                  {candidate.political_opinions.map((opinion, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="mr-2 text-primary">•</span>
                      <span>{opinion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading text="載入中..." />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">找不到投票活動</h2>
            <Button onClick={() => router.push("/vote")}>返回投票列表</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showConfirmation) {
    // Find next unvoted activity
    const nextActivity = allActivities.find(
      (act) => act._id !== activityId && !votedActivityIds.includes(act._id),
    );
    const allVoted =
      allActivities.length > 0 &&
      allActivities.every((act) => votedActivityIds.includes(act._id));

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-8">
        <Card className="w-full max-w-3xl shadow-xl border-2 border-green-200">
          <CardContent className="p-8 sm:p-12">
            <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              投票成功！
            </h2>
            <p className="mb-8 text-lg text-gray-600">
              感謝您的參與，您的投票已成功送出
            </p>

            {/* Voter Information Card */}
            {userData && (
              <Card className="mb-6 border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-center text-lg font-bold text-gray-900">
                    投票人資訊
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                      <span className="text-sm font-semibold text-gray-700">
                        學號
                      </span>
                      <span className="text-base font-bold text-gray-900">
                        {userData.student_id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                      <span className="text-sm font-semibold text-gray-700">
                        姓名
                      </span>
                      <span className="text-base font-bold text-gray-900">
                        {userData.name}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* UUID Certificate Card */}
            <Card className="mb-8 border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md">
              <CardContent className="p-6">
                <h3 className="mb-3 text-center text-lg font-bold text-emerald-900">
                  投票證明 UUID
                </h3>
                <div className="break-all rounded-lg border-2 border-emerald-200 bg-white p-4 font-mono text-sm text-emerald-800 shadow-inner">
                  {voteToken}
                </div>
                <p className="mt-4 text-center text-sm leading-relaxed text-gray-700">
                  請妥善保存此 UUID，這是您投票的唯一證明。
                  <br />
                  系統採用匿名投票機制，無法追溯您的投票內容。
                </p>
              </CardContent>
            </Card>

            {allVoted ? (
              <div className="space-y-4">
                <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-100 shadow-md">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
                    <h3 className="mb-2 text-xl font-bold text-green-900">
                      🎉 恭喜！您已完成所有投票活動
                    </h3>
                    <p className="text-sm text-green-800">
                      您已經投完所有開放中的投票活動，感謝您的參與！
                    </p>
                  </CardContent>
                </Card>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
                    onClick={() => router.push("/vote")}
                  >
                    返回投票列表
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => router.push("/vote/completion")}
                  >
                    查看投票證明
                  </Button>
                </div>
              </div>
            ) : nextActivity ? (
              <div className="space-y-4">
                <Card className="border-2 border-sky-400 bg-gradient-to-br from-sky-50 to-blue-100 shadow-md">
                  <CardContent className="p-6 text-center">
                    <h3 className="mb-2 text-lg font-bold text-sky-900">
                      下一個投票活動
                    </h3>
                    <p className="mb-1 text-base font-medium text-sky-800">
                      {nextActivity.name}
                    </p>
                  </CardContent>
                </Card>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
                    onClick={() => router.push("/vote")}
                  >
                    返回投票列表
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700"
                    onClick={() => router.push(`/vote/${nextActivity._id}`)}
                  >
                    繼續投票
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={() => router.push("/vote")}
              >
                返回投票列表
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-3xl">{activity.name}</CardTitle>
              {activity.description && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {activity.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center">
                  <Tag className="mr-2 h-4 w-4 text-primary" />
                  <span>類型：{activity.type}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                  <span>
                    投票方式：
                    {activity.rule === "choose_all" ? "多選評分" : "單選"}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          {activity.rule === "choose_all" && (
            <>
              <Separator />
              <CardContent className="pt-4">
                <Badge
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  <strong className="mr-2">投票說明：</strong>
                  請對每位候選人表達您的意見（支持、反對或無意見）
                </Badge>
              </CardContent>
            </>
          )}
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="flex items-center gap-2 py-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Options/Candidates */}
        <div className="mb-8 space-y-6">
          {activity.options.map((option, index) => (
            <Card key={option._id}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {option.label || `候選人 ${index + 1}`}
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                {option.candidate && renderCandidate(option.candidate)}
                {option.vice1 && renderCandidate(option.vice1)}
                {option.vice2 && renderCandidate(option.vice2)}

                {/* Vote Selection */}
                <div className="mt-6 border-t pt-6">
                  <p className="mb-3 text-sm font-semibold">您的選擇：</p>
                  {activity.rule === "choose_all" ? (
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() =>
                          handleChooseAllChange(option._id, "我要投給他")
                        }
                        variant={
                          chooseAllVotes[option._id] === "我要投給他"
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "flex-1",
                          chooseAllVotes[option._id] === "我要投給他" &&
                            "bg-green-600 hover:bg-green-700 text-white border-green-600",
                        )}
                      >
                        我要投給他
                      </Button>
                      <Button
                        onClick={() =>
                          handleChooseAllChange(option._id, "我不投給他")
                        }
                        variant={
                          chooseAllVotes[option._id] === "我不投給他"
                            ? "destructive"
                            : "outline"
                        }
                        className="flex-1"
                      >
                        我不投給他
                      </Button>
                      <Button
                        onClick={() =>
                          handleChooseAllChange(option._id, "我沒有意見")
                        }
                        variant={
                          chooseAllVotes[option._id] === "我沒有意見"
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "flex-1",
                          chooseAllVotes[option._id] === "我沒有意見" &&
                            "bg-gray-500 hover:bg-gray-600 text-white",
                        )}
                      >
                        我沒有意見
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setChooseOneVote(option._id)}
                      variant={
                        chooseOneVote === option._id ? "default" : "outline"
                      }
                      className="w-full"
                      size="lg"
                    >
                      {chooseOneVote === option._id
                        ? "✓ 已選擇"
                        : "選擇此候選人"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/vote")}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <Button
            onClick={handleSubmitVote}
            size="lg"
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? "提交中..." : "確認投票"}
          </Button>
        </div>
      </div>
    </div>
  );
}
