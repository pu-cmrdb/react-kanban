/**
 * 議題資料管理中心（使用 React Context）
 *
 * 這個檔案負責在整個應用程式中共享議題資料，就像一個「資料倉庫」的概念！
 * 任何元件只要使用 useIssue() 這個 hook，就可以取得和操作議題資料，超方便的！
 *
 * 💡 小知識：這是 React 的 Context API 設計模式，可以避免「props 一層層傳遞」的麻煩。
 * 想像一下，如果你的元件樹很深，要把資料從最上層傳到最下層會傳得很累吧？
 * Context 就像是一個「任意門」，讓你在任何地方都能直接取得需要的資料！
 */

'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import { Issue } from '@/types/issue';

/**
 * 定義 Context 提供的資料和功能
 *
 * 這個介面描述了我們的「資料倉庫」裡面有什麼東西：
 * - isLoading: 是否正在載入資料（可以用來顯示載入動畫）
 * - issues: 所有的議題清單
 * - setIssues: 直接設定議題清單的函式
 * - refresh: 重新從伺服器抓取最新資料的函式
 * - createIssue: 建立新議題
 * - patchIssue: 部分更新議題（接受 id 參數）
 * - deleteIssue: 刪除議題（接受 id 參數）
 *
 * 💡 為什麼 CRUD 方法要接受 id 參數？
 *
 * 因為這是全域的 Provider，需要能夠操作任何議題！
 * 你可以在任何地方使用這些方法，例如：
 * - 在首頁看板直接更新議題狀態
 * - 在詳細頁面更新或刪除議題
 * - 在建立頁面新增議題
 *
 * IssueDetailProvider 會包裝這些方法，讓你在詳細頁面不需要傳 id。
 */
interface IssueContextType {
  isLoading: boolean;
  issues: Issue[];
  setIssues: (issues: Issue[]) => void;
  refresh: () => Promise<void>;
  createIssue: (issue: Omit<Issue, 'id'>) => Promise<Issue>;
  patchIssue: (id: string, updates: Partial<Omit<Issue, 'id'>>) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
}

/**
 * 建立 Context 物件
 *
 * 這就像是蓋好了「資料倉庫」的建築物，但裡面還是空的。
 * 稍後我們會在 IssueProvider 裡面放入真正的資料和功能。
 *
 * 使用 undefined 作為預設值，這樣 TypeScript 會強制我們檢查 context 是否存在。
 */
const IssueContext = createContext<IssueContextType | undefined>(undefined);

/**
 * IssueProvider 元件的 Props
 */
interface IssueProviderProps {
  children: React.ReactNode;
  initialIssues?: Issue[];
}

/**
 * IssueProvider 元件
 *
 * 這是一個「包裝元件」，用來把資料和功能提供給所有的子元件。
 * 你需要把它包在應用程式的最外層（通常是 layout.tsx），這樣整個 App 都能用到這些資料！
 *
 * 使用方式：
 * ```tsx
 * <IssueProvider initialIssues={issues}>
 *   <你的應用程式元件們>
 * </IssueProvider>
 * ```
 *
 * @param children - 所有被包在裡面的子元件
 * @param initialIssues - 從伺服器端預先載入的議題資料（可選）
 */
export function IssueProvider({
  children,
  initialIssues = [],
}: IssueProviderProps) {
  // 用 useState 來儲存議題清單，初始值是從 layout 傳進來的資料
  const [issues, setIssues] = useState<Issue[]>(initialIssues);

  // 用 useState 來追蹤是否正在載入資料
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * refresh 函式：從伺服器重新抓取最新的議題資料
   *
   * 使用 useCallback 來記住這個函式，避免每次渲染都建立新的函式。
   * 這樣可以提升效能，特別是當其他元件把這個函式當作 dependency 使用時。
   *
   * 這個函式會：
   * 1. 檢查是否已經在載入中（避免重複呼叫）
   * 2. 設定載入狀態為 true（可以顯示載入中的畫面）
   * 3. 呼叫 API 取得資料
   * 4. 把資料存到 state 裡
   * 5. 設定載入狀態為 false（隱藏載入中的畫面）
   *
   * 💡 錯誤處理：
   * 如果 API 回應錯誤，會拋出包含伺服器錯誤訊息的 Error，讓呼叫端可以捕捉並顯示給使用者。
   */
  const refresh = useCallback(async () => {
    // 如果正在載入中，就不要重複執行
    if (isLoading) return;

    try {
      // 開始載入，設定狀態
      setIsLoading(true);

      // 呼叫後端 API 取得議題資料
      const response = await fetch('/api/issues');

      // 檢查回應是否正常
      if (!response.ok) {
        // 嘗試從回應中取得錯誤訊息
        // 如果回應不是 JSON 格式，就使用預設訊息
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `載入議題失敗 (HTTP ${response.status})`;
        throw new Error(errorMessage);
      }

      // 解析 JSON 資料
      const data = await response.json();

      // 把拿到的資料存起來
      setIssues(data);
    }
    catch (error) {
      // 如果發生錯誤，在 console 顯示錯誤訊息並重新拋出
      // 這樣呼叫端（例如頁面元件）可以捕捉並顯示錯誤給使用者
      console.error('載入議題時發生錯誤：', error);
      throw error;
    }
    finally {
      // 不管成功或失敗，最後都要把載入狀態設回 false
      setIsLoading(false);
    }
  }, [isLoading]);

  /**
   * 建立新議題（呼叫 API POST）
   *
   * 這個方法會建立一個新的議題，ID 會由後端自動產生。
   * 成功後會自動 refresh() 更新全域清單。
   *
   * 💡 錯誤處理：
   * 如果建立失敗，會拋出包含伺服器錯誤訊息的 Error。
   * 呼叫端應該用 try-catch 捕捉並顯示錯誤給使用者。
   *
   * @example 使用方式：
   * ```tsx
   * const newIssue = await createIssue({
   *   title: '新議題',
   *   description: '描述',
   *   status: 'todo'
   * });
   * ```
   *
   * @param issue - 新議題的資料（不包含 id）
   * @returns 建立完成的議題（包含 id）
   * @throws {Error} 如果正在執行其他操作或 API 呼叫失敗
   */
  const createIssue = useCallback(
    async (issue: Omit<Issue, 'id'>): Promise<Issue> => {
      if (isLoading) throw new Error('正在執行其他操作');

      try {
        setIsLoading(true);

        // 呼叫後端 API 建立新議題
        const response = await fetch('/api/issues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(issue),
        });

        if (!response.ok) {
          // 嘗試從回應中取得錯誤訊息
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || `建立議題失敗 (HTTP ${response.status})`;
          throw new Error(errorMessage);
        }

        // 取得新建立的議題
        const newIssue = await response.json();

        // 重新載入全域清單
        await refresh();

        return newIssue;
      }
      catch (error) {
        // 顯示錯誤訊息並重新拋出，讓呼叫端可以處理
        console.error('建立議題時發生錯誤：', error);
        throw error;
      }
      finally {
        setIsLoading(false);
      }
    },
    [isLoading, refresh],
  );

  /**
   * 部分更新議題（呼叫 API PATCH）
   *
   * 這個方法可以更新任何議題的部分欄位。
   * 成功後會自動 refresh() 更新全域清單。
   *
   * 💡 在詳細頁面使用時：
   * 不用直接呼叫這個方法！使用 useIssueDetail().patchIssue(updates) 就好，
   * IssueDetailProvider 會自動幫你帶入 id。
   *
   * 💡 在其他地方使用時：
   * 可以直接傳入 id 來更新任何議題，例如在看板上拖拽時更新狀態。
   *
   * 💡 錯誤處理：
   * 如果更新失敗，會拋出包含伺服器錯誤訊息的 Error。
   * 呼叫端應該用 try-catch 捕捉並顯示錯誤給使用者。
   *
   * @example 使用方式：
   * ```tsx
   * await patchIssue('issue-123', { status: 'done' });
   * ```
   *
   * @param id - 要更新的議題 ID
   * @param updates - 要更新的欄位
   * @throws {Error} 如果 API 呼叫失敗
   */
  const patchIssue = useCallback(
    async (id: string, updates: Partial<Omit<Issue, 'id'>>): Promise<void> => {
      if (isLoading) return;

      try {
        setIsLoading(true);

        // 呼叫後端 API 進行部分更新
        const response = await fetch(`/api/issues/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        });

        if (!response.ok) {
          // 嘗試從回應中取得錯誤訊息
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || `更新議題失敗 (HTTP ${response.status})`;
          throw new Error(errorMessage);
        }

        // 重新載入全域清單
        await refresh();
      }
      catch (error) {
        // 顯示錯誤訊息並重新拋出，讓呼叫端可以處理
        console.error('更新議題時發生錯誤：', error);
        throw error;
      }
      finally {
        setIsLoading(false);
      }
    },
    [isLoading, refresh],
  );

  /**
   * 刪除議題（呼叫 API DELETE）
   *
   * 這個方法可以刪除任何議題。
   * 成功後會自動 refresh() 更新全域清單。
   *
   * 💡 在詳細頁面使用時：
   * 不用直接呼叫這個方法！使用 useIssueDetail().deleteIssue() 就好，
   * IssueDetailProvider 會自動幫你帶入 id。
   *
   * 💡 刪除後記得導向其他頁面：
   * 刪除成功後，當前頁面的議題已經不存在了，要記得導向到首頁或其他頁面。
   *
   * 💡 錯誤處理：
   * 如果刪除失敗，會拋出包含伺服器錯誤訊息的 Error。
   * 呼叫端應該用 try-catch 捕捉並顯示錯誤給使用者。
   *
   * @example 使用方式：
   * ```tsx
   * await deleteIssue('issue-123');
   * router.replace('/');
   * ```
   *
   * @param id - 要刪除的議題 ID
   * @throws {Error} 如果 API 呼叫失敗
   */
  const deleteIssue = useCallback(
    async (id: string): Promise<void> => {
      if (isLoading) return;

      try {
        setIsLoading(true);

        // 呼叫後端 API 進行刪除
        const response = await fetch(`/api/issues/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          // 嘗試從回應中取得錯誤訊息
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || `刪除議題失敗 (HTTP ${response.status})`;
          throw new Error(errorMessage);
        }

        // 重新載入全域清單
        await refresh();
      }
      catch (error) {
        // 顯示錯誤訊息並重新拋出，讓呼叫端可以處理
        console.error('刪除議題時發生錯誤：', error);
        throw error;
      }
      finally {
        setIsLoading(false);
      }
    },
    [isLoading, refresh],
  );

  /**
   * 使用 Context.Provider 把資料和功能傳遞給所有子元件
   *
   * value 裡面放的就是所有子元件可以使用的東西：
   * - issues: 議題清單
   * - isLoading: 載入狀態
   * - setIssues: 直接設定議題的函式
   * - refresh: 重新載入的函式
   * - createIssue: 建立新議題
   * - patchIssue: 部分更新議題（接受 id）
   * - deleteIssue: 刪除議題（接受 id）
   */
  return (
    <IssueContext.Provider
      value={{
        issues,
        isLoading,
        setIssues,
        refresh,
        createIssue,
        patchIssue,
        deleteIssue,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
}

/**
 * useIssue Hook：在任何元件中取得議題資料和功能
 *
 * 這是一個自訂的 Hook，讓你可以輕鬆地在任何元件中使用議題資料。
 *
 * @example 使用方式：
 * ```tsx
 * function MyComponent() {
 *   const { issues, refresh, isLoading } = useIssue();
 *
 *   // 現在你可以使用 issues、refresh 和 isLoading 了！
 *   return <div>有 {issues.length} 個議題</div>;
 * }
 * ```
 *
 * @returns 包含 issues、isLoading、setIssues、refresh 的物件
 */
export function useIssue(): IssueContextType {
  // 嘗試取得 Context 的值
  const context = useContext(IssueContext);

  // 如果取不到（表示沒有被 <IssueProvider> 包住），就顯示錯誤訊息
  if (!context) {
    throw new Error('useIssue 必須在 <IssueProvider> 內部使用');
  }

  // 回傳 Context 的值，讓元件可以使用
  return context;
}
