/**
 * 首頁（Client Component）
 *
 * 這個頁面顯示看板的主要介面，包含四個狀態欄位：
 * - 📝 還沒做（todo）
 * - 🚧 正在做（doing）
 * - ✅ 做完ㄌ（done）
 * - 📦 放棄（closed）
 *
 * 💡 資料從哪裡來？
 * 資料已經在 layout.tsx 中從伺服器端載入，並透過 IssueProvider 傳遞下來。
 * 我們只需要使用 `useIssue()` hook 就能取得資料了！
 */

'use client';

import { PlusIcon, RefreshCcwIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { StatusColumn } from '@/components/status-column';
import { useIssue } from '@/components/providers/issue';

export default function Home() {
  const router = useRouter();
  const { isLoading, refresh } = useIssue();

  return (
    <div className="flex flex-col gap-4 p-8">

      {/* 頂部工具列 */}
      <div className="flex gap-4">

        {/* 新增按鈕 */}
        <Button onClick={() => router.push('/issues/create')}>
          <PlusIcon />
          新增
        </Button>

        {/* 重新整理按鈕 */}
        <Button variant="outline" size="icon" className="group" onClick={() => refresh()} disabled={isLoading}>
          <RefreshCcwIcon className="group-disabled:animate-spin" />
        </Button>

      </div>

      {/* 看板主體 - 四個狀態欄位 */}
      <div className="grid min-h-0 grid-cols-4 items-start gap-4">
        <StatusColumn
          title="📝 還沒做"
          status="todo"
          className="border-sky-300 bg-sky-50"
        />
        <StatusColumn
          title="🚧 正在做"
          status="doing"
          className="border-amber-300 bg-amber-50"
        />
        <StatusColumn
          title="✅ 做完ㄌ"
          status="done"
          className="border-green-300 bg-green-50"
        />
        <StatusColumn
          title="📦 放棄"
          status="closed"
          className="border-gray-300 bg-gray-50"
        />
      </div>

    </div>
  );
}
