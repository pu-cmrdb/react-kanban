/**
 * 議題詳細資料管理（使用 React Context）
 *
 * 這個 Provider 專門用於單一議題的詳細頁面。
 * 它的運作方式和 IssueProvider 很像，但只管理一個議題的資料。
 *
 * 💡 為什麼要分開？
 * - IssueProvider 管理「所有議題」（用於首頁看板）
 * - IssueDetailProvider 管理「單一議題」（用於詳細頁面）
 * 這樣可以讓程式碼更清楚，職責更明確！
 *
 * 💡 這個 Provider 是一個「包裝層」
 *
 * 這個 Provider 不直接處理 API 呼叫，而是包裝全域 IssueProvider 的方法。
 * 它的作用是：
 * 1. 提供當前的 issue（保證存在，型別安全）
 * 2. 包裝 CRUD 方法，自動帶入 issue.id，使用更方便
 *
 * 原本：await globalPatchIssue(issue.id, { status: 'done' })
 * 現在：await patchIssue({ status: 'done' })  ← 自動帶入 issue.id
 *
 * 所有的 API 呼叫都由 IssueProvider 處理，確保全域狀態自動同步！
 */

'use client';

import { createContext, useCallback, useContext } from 'react';

import { Issue } from '@/types/issue';
import { useIssue } from './issue';

/**
 * 定義 Context 提供的資料和方法
 *
 * 注意：issue 是 Issue 而不是 Issue | undefined
 * 因為 layout 會確保只有在議題存在時才 render 這個 Provider
 *
 * 💡 這個 Provider 是一個「包裝層」：
 * - issue: 當前的議題（保證存在）
 * - patchIssue: 包裝全域的 patchIssue，自動帶入 issue.id
 * - deleteIssue: 包裝全域的 deleteIssue，自動帶入 issue.id
 *
 * 這樣在詳細頁面使用時，不需要手動傳入 id，更方便！
 */
interface IssueDetailContextType {
  issue: Issue;
  patchIssue: (updates: Partial<Omit<Issue, 'id'>>) => Promise<void>;
  deleteIssue: () => Promise<void>;
}

/**
 * 建立 Context 物件
 */
const IssueDetailContext = createContext<IssueDetailContextType | undefined>(
  undefined,
);

/**
 * IssueDetailProvider 元件的 Props
 */
interface IssueDetailProviderProps {
  children: React.ReactNode;
  issue: Issue; // 不再是 optional，layout 保證它存在
}

/**
 * IssueDetailProvider 元件
 *
 * 這個 Provider 會被放在 issues/[id]/layout.tsx 中，
 * 接收從全域 IssueProvider 找到的議題資料，並提供給該路由下的所有元件使用。
 *
 * 💡 重要：這是一個「包裝層」
 *
 * 這個 Provider 不直接處理 API 呼叫，而是包裝全域 IssueProvider 的方法。
 * 它的作用是讓詳細頁面使用起來更方便 - 不需要手動傳入 issue.id。
 *
 * @example 使用方式：
 * ```tsx
 * <IssueDetailProvider issue={issue}>
 *   {children}
 * </IssueDetailProvider>
 * ```
 *
 * @param children - 子元件（通常是 page.tsx）
 * @param issue - 從全域狀態找到的議題資料（保證存在）
 */
export function IssueDetailProvider({
  children,
  issue,
}: IssueDetailProviderProps) {
  // 從全域 IssueProvider 取得 CRUD 方法
  // 這些方法會處理 API 呼叫和全域狀態更新
  const {
    patchIssue: globalPatchIssue,
    deleteIssue: globalDeleteIssue,
  } = useIssue();

  /**
   * 部分更新議題（包裝全域方法）
   *
   * 這個方法包裝了全域的 patchIssue，自動帶入當前議題的 id。
   * 實際的 API 呼叫和全域狀態更新都由 IssueProvider 處理。
   *
   * 使用方式：
   * ```tsx
   * await patchIssue({ status: 'done' });
   * ```
   *
   * @param updates - 要更新的欄位（不包含 id）
   */
  const patchIssue = useCallback(
    async (updates: Partial<Omit<Issue, 'id'>>) => {
      // 呼叫全域方法，自動帶入 issue.id
      // IssueProvider 會處理 API 呼叫和 refresh()
      await globalPatchIssue(issue.id, updates);
    },
    [issue.id, globalPatchIssue],
  );

  /**
   * 刪除議題（包裝全域方法）
   *
   * 這個方法包裝了全域的 deleteIssue，自動帶入當前議題的 id。
   * 實際的 API 呼叫和全域狀態更新都由 IssueProvider 處理。
   *
   * 💡 記得在刪除後導向其他頁面：
   * 刪除成功後，當前頁面的議題已經不存在了，要記得導向到首頁或其他頁面。
   *
   * 使用方式：
   * ```tsx
   * await deleteIssue();
   * router.push('/');
   * ```
   */
  const deleteIssue = useCallback(async () => {
    // 呼叫全域方法，自動帶入 issue.id
    // IssueProvider 會處理 API 呼叫和 refresh()
    await globalDeleteIssue(issue.id);
  }, [issue.id, globalDeleteIssue]);

  return (
    <IssueDetailContext.Provider value={{ issue, patchIssue, deleteIssue }}>
      {children}
    </IssueDetailContext.Provider>
  );
}

/**
 * useIssueDetail Hook：在議題詳細頁面中取得議題資料和操作方法
 *
 * 這是一個自訂的 Hook，讓你可以在議題詳細頁面的任何元件中取得當前議題的資料和操作方法。
 *
 * 使用方式：
 * ```tsx
 * function IssueDetailPage() {
 *   const { issue, patchIssue, deleteIssue } = useIssueDetail();
 *
 *   // issue 保證存在，不需要檢查 null！
 *   // 方法不需要傳 id，會自動使用當前 issue 的 id
 *   return (
 *     <div>
 *       <h1>{issue.title}</h1>
 *       <button onClick={() => patchIssue({ status: 'done' })}>
 *         標記為完成
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * ⚠️ 注意：這個 Hook 只能在 IssueDetailProvider 內部使用！
 *
 * @returns 包含 issue、patchIssue、deleteIssue 的物件
 */
export function useIssueDetail(): IssueDetailContextType {
  const context = useContext(IssueDetailContext);

  if (context === undefined) {
    throw new Error('useIssueDetail 必須在 IssueDetailProvider 內部使用');
  }

  return context;
}
