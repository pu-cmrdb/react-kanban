/**
 * 議題詳細頁面（Client Component）
 *
 * 這個頁面顯示單一議題的完整資訊，包含：
 * - 標題
 * - 狀態標籤
 * - 詳細描述
 *
 * 💡 資料從哪裡來？
 * 資料已經在 layout.tsx 中從伺服器端載入，並透過 IssueDetailProvider 傳遞下來。
 * 我們只需要使用 useIssueDetail() hook 就能取得資料了！
 *
 * 💡 注意架構的改變：
 * - 之前：用 useEffect 在 Client 端呼叫 API 載入資料（慢）
 * - 現在：在 Server 端預先載入資料再傳給 Client（快！）
 *
 * 💡 型別安全的好處：
 * 因為 layout.tsx 使用了「提前返回」模式，我們可以確定 issue 一定存在！
 * 不需要檢查 if (!issue)，TypeScript 也知道 issue 不會是 undefined。
 * 程式碼更簡潔，也更安全！
 */

'use client';

import { SquarePenIcon, Trash2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { useIssueDetail } from '@/components/providers/issue-detail';

export default function IssuePage() {
  // 從 IssueDetailProvider 中取得議題資料和操作方法
  // issue 保證存在，不需要檢查 null！（因為 layout.tsx 使用提前返回模式）
  // deleteIssue 是包裝過的方法，不需要傳入 id 參數
  const { issue, deleteIssue } = useIssueDetail();

  // Next.js 的路由 hook，用來程式化導航
  const router = useRouter();

  // 刪除議題的處理函式
  const handleDelete = async () => {
    // 呼叫 deleteIssue 方法刪除當前議題
    // 這個方法會：
    // 1. 自動帶入 issue.id，呼叫全域 IssueProvider.deleteIssue(issue.id)
    // 2. 內部呼叫 DELETE /api/issues/[id] API
    // 3. 自動呼叫 refresh() 更新全域狀態
    await deleteIssue();

    // 刪除完成後，導航回首頁
    // 使用 router.replace() 而不是 router.push()
    // replace 會取代當前的歷史記錄，避免使用者按「上一頁」時回到已刪除的議題頁面
    router.replace('/');
  };

  // 直接顯示議題的完整資訊，不需要檢查 issue 是否存在
  return (
    <div className="w-3xl mx-auto p-16 space-y-4">
      {/* 標題和返回按鈕 */}
      <h1 className="relative flex items-center gap-2 text-3xl font-bold">
        <BackButton href="/" className="absolute -left-4 -translate-x-full" />
        <span>{issue.title}</span>
      </h1>

      {/* 狀態標籤 */}
      <div>
        <StatusBadge status={issue.status} />
      </div>

      {/* 詳細描述 */}
      <p className="text-muted-foreground text-lg">{issue.description}</p>

      {/* 操作按鈕區 */}
      <div className="flex gap-2">
        {/* 編輯按鈕 */}
        {/* asChild 讓 Button 的樣式套用到子元件 Link 上 */}
        <Button asChild>
          <Link href={`/issues/${issue.id}/edit`}>
            <SquarePenIcon />
            <span>編輯</span>
          </Link>
        </Button>

        {/* 刪除按鈕 */}
        {/* variant="destructive" 顯示紅色警告樣式 */}
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2Icon />
          <span>刪除</span>
        </Button>
      </div>
    </div>
  );
}
