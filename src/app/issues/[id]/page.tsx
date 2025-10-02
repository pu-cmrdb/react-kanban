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

import { BackButton } from '@/components/back-button';
import { StatusBadge } from '@/components/status-badge';
import { useIssueDetail } from '@/components/providers/issue-detail';

export default function IssuePage() {
  // 從 Context 中取得議題資料和操作方法
  // issue 保證存在，不需要檢查 null！
  const { issue } = useIssueDetail();

  // 直接顯示議題的完整資訊，不需要檢查 issue 是否存在
  return (
    <div className="w-3xl mx-auto p-16 space-y-4">
      {/* 標題區域，包含返回按鈕 */}
      <h1 className="relative flex items-center gap-2 text-3xl font-bold">
        <BackButton className="absolute -left-4 -translate-x-full" />
        <span>{issue.title}</span>
      </h1>

      {/* 狀態標籤 */}
      <div>
        <StatusBadge status={issue.status} />
      </div>

      {/* 詳細描述 */}
      <p className="text-muted-foreground text-lg">{issue.description}</p>
    </div>
  );
}
