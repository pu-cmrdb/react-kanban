/**
 * 建立新議題頁面
 *
 * 這個頁面展示了如何使用 React 的表單處理和狀態管理：
 * - 使用 useState 管理表單欄位的值
 * - 使用 useIssue 取得全域的 createIssue 方法
 * - 使用 onSubmit 處理表單提交事件
 */

'use client';

import { AlertCircle } from 'lucide-react';
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
import { useIssue } from '@/components/providers/issue';

export default function CreateIssuePage() {
  // 從全域 IssueProvider 取得 createIssue 方法
  // 這個方法會自動呼叫 API 並更新全域狀態
  const { createIssue } = useIssue();

  // Next.js 的路由 hook，用來程式化導航（跳轉頁面）
  const router = useRouter();

  // 使用 useState 管理表單的三個欄位
  // 每個欄位都需要一個獨立的 state，這樣才能追蹤使用者的輸入
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');

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
      // 呼叫全域的 createIssue 方法，建立新議題
      // 這個方法會：
      // 1. 呼叫 POST /api/issues API
      // 2. 自動呼叫 refresh() 更新全域狀態
      // 3. 返回新建立的議題物件（包含自動產生的 id）
      await createIssue({
        title,
        status,
        description,
      });

      // 建立完成後，導航回首頁看板
      // router.push() 會在客戶端進行頁面切換，不會重新載入整個頁面
      // 因為 createIssue 已經自動呼叫 refresh()，首頁會立即顯示新建立的議題
      router.push('/');
    }
    catch (err) {
      // 如果 API 呼叫失敗，捕捉錯誤並顯示給使用者
      // err 可能是任何型別，所以需要安全地轉換成字串
      const errorMessage = err instanceof Error ? err.message : '建立議題時發生未知錯誤';
      setError(errorMessage);
    }
  };

  return (
    <div className="w-3xl mx-auto p-16 space-y-8">
      {/* 標題和返回按鈕 */}
      <h1 className="relative flex items-center gap-2 text-3xl font-bold">
        <BackButton href="/" className="absolute -left-4 -translate-x-full" />
        <span>建立新議題</span>
      </h1>

      {/* 錯誤訊息顯示區域 */}
      {/* 只有在 error 不是 null 時才顯示 Alert 元件 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
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
            value={title}
            onInput={(e) => setTitle(e.currentTarget.value)}
            required
          />
        </div>

        {/* 狀態欄位 */}
        <div className="space-y-2">
          <Label htmlFor="status">狀態*</Label>
          {/* Select 是 shadcn/ui 提供的下拉選單元件 */}
          <Select value={status} onValueChange={setStatus} required>
            <SelectTrigger id="status">
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
            value={description}
            onInput={(e) => setDescription(e.currentTarget.value)}
            required
          />
        </div>

        {/* 提交按鈕 */}
        <Button type="submit">建立</Button>
      </form>
    </div>
  );
}
