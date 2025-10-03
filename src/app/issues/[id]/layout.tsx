/**
 * 議題詳細頁面的 Layout（Client Component）
 *
 * 這個 Layout 從全域的 IssueProvider 取得議題資料，實現「單一真相來源」的架構。
 *
 * 💡 為什麼要用 Layout？
 *
 * 主要原因：Layout 會包住它底下的所有路由和元件！
 *
 * /issues/[id]/layout.tsx 包住：
 *   ├─ /issues/[id]/page.tsx (議題詳細頁)
 *   ├─ /issues/[id]/edit/page.tsx (未來可能的編輯頁)
 *   └─ 其他在這個路由下的頁面...
 *
 * 所以在這裡提供的 IssueDetailProvider，會讓這個路由下的「所有頁面」都能存取該議題資料！
 *
 * 💡 單一真相來源（Single Source of Truth）
 *
 * 這個 Layout 是 Client Component，可以使用 useIssue() hook 來取得全域的議題清單。
 * 所有議題資料都來自根 layout 的 IssueProvider，這樣做的好處是：
 *
 * 1. 資料同步：在詳細頁面更新議題後，首頁的資料也會自動更新
 * 2. 不需要重複載入：資料已經在全域狀態中了
 * 3. 一致性：所有地方看到的都是同一份資料
 * 4. 簡化邏輯：不需要在多個地方管理同一份資料
 */

'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { use } from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { IssueDetailProvider } from '@/components/providers/issue-detail';
import { useIssue } from '@/components/providers/issue';

/**
 * IssueDetailLayout 元件
 *
 * 這是一個 Client Component，使用 useIssue() hook 從全域狀態中取得議題。
 *
 * 💡 重要：提前返回（Early Return）+ 單一真相來源
 *
 * 這個 Layout 會：
 * 1. 從全域 IssueProvider 取得所有議題
 * 2. 根據 URL 的 ID 找到對應的議題
 * 3. 如果找不到，顯示錯誤訊息（提前返回）
 * 4. 如果找到，傳給 IssueDetailProvider
 *
 * 這樣做的好處：
 * - 型別安全：Provider 保證永遠收到有效的 issue
 * - 資料同步：更新議題後，全域狀態也會更新
 * - 簡化程式碼：page.tsx 不需要檢查 issue 是否存在
 * - 統一錯誤處理：所有「找不到議題」的情況都在這裡處理
 *
 * @param children - 子頁面（通常是 page.tsx）
 * @param params - URL 參數，包含議題的 id
 */
export default function IssueDetailLayout({
  children,
  params,
}: LayoutProps<'/issues/[id]'>) {
  // 從全域 IssueProvider 取得所有議題
  const { issues } = useIssue();

  // 從 params 中取得議題 ID
  const { id } = use(params);

  // 從全域 issues 清單中找到對應的議題
  // 這就是「單一真相來源」的實踐 - 所有資料都來自 IssueProvider！
  const issue = issues.find((issue) => issue.id === id);

  // 提前返回：如果議題不存在，直接顯示錯誤訊息
  if (!issue) {
    return (
      <div className="mx-auto w-3xl space-y-4 p-16">
        <h1 className="text-3xl font-bold">找不到議題</h1>
        <p className="text-muted-foreground">
          這個議題可能已經被刪除，或是 ID 不正確。
        </p>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeftIcon />
            <span>返回首頁</span>
          </Link>
        </Button>
      </div>
    );
  }

  // 執行到這裡，TypeScript 知道 issue 一定存在
  // 傳給 IssueDetailProvider，Provider 會負責管理這個議題的操作（更新、刪除等）
  return <IssueDetailProvider issue={issue}>{children}</IssueDetailProvider>;
}
