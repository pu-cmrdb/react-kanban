/**
 * 根布局（Root Layout）
 *
 * 這是整個應用程式的最外層結構，所有頁面都會被包在這裡面。
 * 我們在這裡設定字型、載入初始資料，並提供 Context Provider。
 *
 * 💡 為什麼要在 Layout 中初始化資料和提供 Provider？
 *
 * 因為 Layout 會「包住」它底下的所有路由！這個概念很重要：
 *
 * 根 layout.tsx 包住：
 *   ├─ /              (首頁)
 *   ├─ /issues/[id]   (議題詳細頁)
 *   ├─ /issues/create (建立議題頁)
 *   └─ 其他所有頁面...
 *
 * 所以在這裡提供的 IssueProvider，會讓「所有頁面」都能存取議題資料！
 * 這樣無論使用者在哪一頁，都能透過 `useIssue()` 取得資料。
 *
 * 💡 額外好處：Layout 也是 Server Component
 * 我們可以在伺服器端載入資料，讓初始頁面載入更快！
 */

import { Noto_Sans_TC } from 'next/font/google';

import { IssueProvider } from '@/components/providers/issue';
import { storage } from '@/lib/storage';

import type { Metadata } from 'next';

import './globals.css';

const notoSansTC = Noto_Sans_TC({
  variable: '--font-noto-sans-tc',
  preload: false,
});

export const metadata: Metadata = {
  title: 'React 看板 - 管理你的日常任務',
  description: '一個簡單好用的看板應用程式，幫你整理待辦事項！',
};

/**
 * RootLayout 元件
 *
 * 這是一個 Server Component，會在伺服器端執行。
 * 我們在這裡載入初始的議題資料，然後傳給 <IssueProvider> ，
 * 這樣所有頁面一開始就能看到資料，不需要等待 API 回應！
 *
 * @param children - 所有的頁面內容
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 在伺服器端直接從 storage 取得所有議題
  // 這個動作只會在伺服器端執行，使用者的瀏覽器不會看到這段程式碼
  const initialIssues = storage.getAll();

  return (
    <html lang="zh-TW" className={notoSansTC.variable}>
      <body
        className="grid w-dvw bg-muted antialiased"
      >
        {/* 把初始資料傳給 IssueProvider */}
        <IssueProvider initialIssues={initialIssues}>
          {children}
        </IssueProvider>
      </body>
    </html>
  );
}
