/**
 * 編輯議題頁面
 *
 * 這個頁面展示了如何編輯現有議題：
 * - 使用 useIssueDetail 取得當前議題資料和 patchIssue 方法
 * - 使用 useState 管理表單欄位，初始值為現有議題的資料
 * - 使用 try-catch 處理更新時可能發生的錯誤
 * - 更新成功後導航回議題詳細頁
 */

'use client';

import { AlertCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { useIssueDetail } from '@/components/providers/issue-detail';

export default function IssueEditPage() {
  // 從 IssueDetailProvider 取得當前議題資料和 patchIssue 方法
  // issue 保證存在（因為 layout.tsx 使用了提前返回模式）
  // patchIssue 是包裝過的方法，不需要傳入 id 參數
  const { issue, patchIssue } = useIssueDetail();

  // Next.js 的路由 hook，用來程式化導航（跳轉頁面）
  const router = useRouter();

  // 使用 useState 管理表單的三個欄位
  // 💡 注意：這裡的初始值是現有議題的資料，而不是空字串
  // 這樣使用者打開編輯頁面時，表單會預先填入現有的資料
  const [title, setTitle] = useState(issue.title);
  const [status, setStatus] = useState(issue.status);
  const [description, setDescription] = useState(issue.description);

  // 錯誤狀態：用來儲存和顯示 API 錯誤訊息
  // null 表示沒有錯誤，string 表示有錯誤訊息要顯示
  const [error, setError] = useState<string | null>(null);

  // 表單提交處理函式
  // React.FormEventHandler<HTMLFormElement> 是 TypeScript 的型別標註
  // 告訴 TypeScript 這是一個表單事件處理函式
  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    // 防止瀏覽器預設的表單提交行為（會重新載入頁面）
    event.preventDefault();

    // 清除之前的錯誤訊息（如果有的話）
    setError(null);

    try {
      // 呼叫 IssueDetailProvider 提供的 patchIssue 方法
      // 這個方法會：
      // 1. 自動帶入 issue.id，呼叫全域 IssueProvider.patchIssue(issue.id, updates)
      // 2. 內部呼叫 PATCH /api/issues/[id] API
      // 3. 自動呼叫 refresh() 更新全域狀態
      await patchIssue({ title, status, description });

      // 更新完成後，導航回議題詳細頁
      // router.push() 會在客戶端進行頁面切換，不會重新載入整個頁面
      // 因為 patchIssue 已經自動呼叫 refresh()，詳細頁會顯示最新的資料
      router.push(`/issues/${issue.id}`);
    }
    catch (err) {
      // 如果 API 呼叫失敗，捕捉錯誤並顯示給使用者
      // err 可能是任何型別，所以需要安全地轉換成字串
      const errorMessage = err instanceof Error ? err.message : '更新議題時發生未知錯誤';
      setError(errorMessage);
    }
  };

  return (
    <div className="mx-auto w-3xl space-y-8 p-16">
      {/* 標題和返回按鈕 */}
      <h1 className="relative flex items-center gap-2 text-3xl font-bold">
        <BackButton
          href={`/issues/${issue.id}`}
          className="absolute -left-4 -translate-x-full"
        />
        <span>編輯議題</span>
      </h1>

      {/* 錯誤訊息顯示區域 */}
      {/* 只有在 error 不是 null 時才顯示 Alert 元件 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>錯誤</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 表單區域 */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* 標題欄位 */}
        <div className="space-y-2">
          <Label htmlFor="title">標題*</Label>
          <Input
            id="title"
            type="text"
            value={title} // 綁定到 state，初始值為 issue.title
            onInput={(e) => setTitle(e.currentTarget.value)} // 更新 state
            required // HTML5 原生驗證：必填欄位
          />
        </div>

        {/* 狀態欄位 */}
        <div className="space-y-2">
          <Label htmlFor="status">狀態*</Label>
          {/* Select 是 shadcn/ui 提供的下拉選單元件 */}
          <Select value={status} onValueChange={setStatus} required>
            <SelectTrigger id="status" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* 使用 StatusBadge 元件顯示狀態標籤，讓選項更美觀 */}
              <SelectItem value="todo"><StatusBadge status="todo" /></SelectItem>
              <SelectItem value="doing"><StatusBadge status="doing" /></SelectItem>
              <SelectItem value="done"><StatusBadge status="done" /></SelectItem>
              <SelectItem value="closed"><StatusBadge status="closed" /></SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 描述欄位 */}
        <div className="space-y-2">
          <Label htmlFor="description">敘述*</Label>
          <Textarea
            id="description"
            value={description} // 綁定到 state，初始值為 issue.description
            onInput={(e) => setDescription(e.currentTarget.value)} // 更新 state
            required // HTML5 原生驗證：必填欄位
          />
        </div>

        {/* 提交按鈕 */}
        {/* type="submit" 會觸發 form 的 onSubmit 事件 */}
        <Button type="submit">更新</Button>
      </form>
    </div>
  );
}
