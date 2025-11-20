"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Download, Home, Copy, Check } from "lucide-react";
import { loadVotingHistory, VotingHistory } from "@/lib/votingHistory";

export default function CompletionPage() {
  const router = useRouter();
  const [votingHistory, setVotingHistory] = useState<VotingHistory | null>(
    null,
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    setVotingHistory(loadVotingHistory());
  }, []);

  const handleCopyToken = (token: string, index: number) => {
    navigator.clipboard.writeText(token);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!votingHistory || votingHistory.votes.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-4xl px-6 py-12">
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="mb-4 text-2xl font-bold">尚無投票記錄</h2>
              <p className="mb-6 text-muted-foreground">
                您還沒有參與任何投票活動
              </p>
              <Button onClick={() => router.push("/vote")}>前往投票</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Header />

      <main className="container mx-auto max-w-4xl px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            投票完成證明
          </h1>
          <p className="text-base text-gray-700 sm:text-lg">
            感謝您的參與！以下是您的投票證明記錄
          </p>
        </div>

        {/* Completion Certificate Card */}
        <Card className="mb-8 border-2 border-emerald-200 bg-white shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-2xl text-gray-900">
                投票證明總覽
              </CardTitle>
              <Badge
                variant="default"
                className="w-fit bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-base"
              >
                共 {votingHistory.votes.length} 項投票
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="space-y-6">
              {votingHistory.votes.map((vote, index) => (
                <Card
                  key={index}
                  className="border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50 shadow-md transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          <h3 className="text-lg font-bold text-gray-900">
                            {vote.activityName}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          投票時間：
                          {new Date(vote.timestamp).toLocaleString("zh-TW", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="ml-2 border-emerald-300 text-emerald-700"
                      >
                        #{index + 1}
                      </Badge>
                    </div>

                    <div className="rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-inner">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-bold text-emerald-900">
                          投票證明 UUID
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyToken(vote.token, index)}
                          className="h-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              已複製
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3 w-3" />
                              複製
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="break-all rounded bg-white p-3 font-mono text-sm text-emerald-800 shadow-sm">
                        {vote.token}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="mb-8 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md">
          <CardContent className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="text-2xl">📌</span>
              重要提醒
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start rounded-lg bg-white/60 p-3">
                <span className="mr-3 mt-0.5 text-amber-600">•</span>
                <span>
                  請截圖保存此頁面作為投票完成證明（可用於期末慰問會等活動）
                </span>
              </li>
              <li className="flex items-start rounded-lg bg-white/60 p-3">
                <span className="mr-3 mt-0.5 text-amber-600">•</span>
                <span>每個 UUID 都是您投票的唯一證明，請妥善保存</span>
              </li>
              <li className="flex items-start rounded-lg bg-white/60 p-3">
                <span className="mr-3 mt-0.5 text-amber-600">•</span>
                <span>
                  系統採用匿名投票機制，即使有 UUID 也無法追溯您的具體投票內容
                </span>
              </li>
              <li className="flex items-start rounded-lg bg-white/60 p-3">
                <span className="mr-3 mt-0.5 text-amber-600">•</span>
                <span>
                  投票記錄儲存在您的瀏覽器本地，清除瀏覽器資料可能會遺失記錄
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row print:hidden">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
            onClick={() => router.push("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            返回首頁
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
            onClick={() => router.push("/vote")}
          >
            前往投票
          </Button>
          <Button
            size="lg"
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            onClick={handlePrint}
          >
            <Download className="mr-2 h-4 w-4" />
            列印 / 儲存 PDF
          </Button>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-12 text-center text-sm text-muted-foreground">
          <p>國立清華大學學生會投票系統</p>
          <p>列印時間：{new Date().toLocaleString("zh-TW")}</p>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
