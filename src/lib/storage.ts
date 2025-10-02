import { Issue } from '@/types/issue';

/**
 * 簡易的記憶體內資料儲存系統
 *
 * 這個類別負責管理看板的所有議題資料。所有的資料都存放在記憶體中（也就是存在這個類別的 issues 陣列裡）。
 *
 * 因為資料存放在記憶體中，所以當伺服器重新啟動時，所有的資料都會消失並重置為初始狀態。
 * 在實際的應用程式中，你會想要使用資料庫（例如 PostgreSQL、MongoDB 等）來永久儲存資料。
 */
class IssueStorage {
  // 用一個陣列來存放所有的議題，private 表示只有這個類別內部可以直接存取
  private issues: Issue[] = [];

  // 用來追蹤下一個要分配的 ID，每次建立新議題時會自動遞增
  private nextId = 1;

  constructor() {
    // 初始化一些範例資料，這樣你一啟動應用程式就能看到一些內容了！
    // 這些範例涵蓋了不同的狀態：todo（待辦）、doing（進行中）、done（已完成）、closed（已關閉）
    this.issues = [
      {
        id: '1',
        title: '洗碗',
        description: '昨天晚上的碗還沒洗，媽媽說今天一定要洗完！記得洗完要擦乾放回櫃子裡。',
        status: 'todo',
      },
      {
        id: '2',
        title: '整理房間',
        description: '房間亂得像被炸彈炸過一樣，衣服到處丟、書散落一地。要把衣服摺好、書放回書架，桌子也要擦一擦！',
        status: 'todo',
      },
      {
        id: '3',
        title: '寫數學作業',
        description: '老師出了 20 題數學題，明天要交。現在寫到第 12 題了，還剩 8 題！加油加油！',
        status: 'doing',
      },
      {
        id: '4',
        title: '打敗艾爾登法環最終 BOSS',
        description: '已經挑戰了 15 次還是打不贏，這次換個策略試試看！先升級裝備，多練習閃避時機。',
        status: 'doing',
      },
      {
        id: '5',
        title: '遛狗狗',
        description: '帶毛毛去公園散步 30 分鐘，讓牠跑一跑消耗體力。記得帶水和零食，還有撿便便的袋子！',
        status: 'done',
      },
      {
        id: '6',
        title: '摺衣服',
        description: '把洗好的衣服全部摺好放進衣櫃了！媽媽說摺得很整齊，還誇獎我變得越來越獨立了！',
        status: 'done',
      },
      {
        id: '7',
        title: '看完最愛的動漫新一集',
        description: '終於看完了！這集超精彩的，主角終於覺醒新能力了！迫不及待想看下一集！',
        status: 'done',
      },
      {
        id: '8',
        title: '組一台超強電競電腦',
        description: '夢想擁有一台頂級電競主機，但算了一下預算要五萬多塊...還是先存錢吧，暫時用現在的筆電就好。',
        status: 'closed',
      },
    ];

    // 因為我們已經用掉了 1-8 的 ID，所以下一個 ID 從 9 開始
    this.nextId = 9;
  }

  /**
   * 取得所有議題
   *
   * 使用展開運算子 [...this.issues] 來回傳一個新陣列，而不是直接回傳原本的陣列。
   * 這樣做可以避免外部程式碼直接修改我們的資料，是一個好的程式設計習慣！
   *
   * @returns 包含所有議題的陣列
   */
  getAll(): Issue[] {
    return [...this.issues];
  }

  /**
   * 根據 ID 取得單一議題
   *
   * 使用陣列的 find 方法來搜尋符合條件的議題。
   * 如果找不到，會回傳 undefined（這就是為什麼回傳型別是 Issue | undefined）
   *
   * @param id - 要查詢的議題 ID
   * @returns 找到的議題，如果不存在則回傳 undefined
   */
  getById(id: string): Issue | undefined {
    return this.issues.find((issue) => issue.id === id);
  }

  /**
   * 建立新議題
   *
   * 這個方法會自動為新議題分配一個唯一的 ID，所以你在呼叫時不需要提供 ID。
   * Omit<Issue, 'id'> 這個型別表示「除了 id 以外的 Issue 所有屬性」
   *
   * @param issue - 新議題的資料（不包含 id）
   * @returns 建立完成的議題（包含自動產生的 id）
   */
  create(issue: Omit<Issue, 'id'>): Issue {
    // 建立新議題物件，並自動分配 ID
    const newIssue: Issue = {
      ...issue,
      id: String(this.nextId),
    };

    // 將新議題加入陣列末端
    this.issues.push(newIssue);

    // 遞增 nextId
    this.nextId++;

    return newIssue;
  }

  /**
   * 完整更新議題（取代整個議題）
   *
   * 這個方法會用新的資料完全取代舊的議題。
   * 如果你只想更新某些欄位，請使用 patch 方法。
   *
   * @param id - 要更新的議題 ID
   * @param issue - 新的議題資料（不包含 id）
   * @returns 更新後的議題，如果議題不存在則回傳 null
   */
  update(id: string, issue: Omit<Issue, 'id'>): Issue | null {
    // 找出要更新的議題在陣列中的位置
    const index = this.issues.findIndex((i) => i.id === id);

    // 如果找不到（index 為 -1），回傳 null
    if (index === -1) return null;

    // 建立更新後的議題，保留原本的 id
    const updatedIssue: Issue = { ...issue, id };
    this.issues[index] = updatedIssue;
    return updatedIssue;
  }

  /**
   * 部分更新議題（只更新指定的欄位）
   *
   * 這個方法只會更新你提供的欄位，其他欄位會保持原樣。
   * 例如：如果你只想更新 status，就只傳 { status: 'done' } 即可。
   *
   * @param id - 要更新的議題 ID
   * @param partialIssue - 要更新的欄位（可以只包含部分屬性）
   * @returns 更新後的完整議題，如果議題不存在則回傳 null
   */
  patch(id: string, partialIssue: Partial<Omit<Issue, 'id'>>): Issue | null {
    const index = this.issues.findIndex((i) => i.id === id);
    if (index === -1) return null;

    // 使用展開運算子合併原本的資料和新的資料
    // partialIssue 的屬性會覆蓋原本的同名屬性
    this.issues[index] = { ...this.issues[index], ...partialIssue };
    return this.issues[index];
  }

  /**
   * 刪除議題
   *
   * 從陣列中移除指定的議題。這個操作無法復原，請小心使用！
   *
   * @param id - 要刪除的議題 ID
   * @returns 如果成功刪除回傳 true，如果議題不存在則回傳 false
   */
  delete(id: string): boolean {
    const index = this.issues.findIndex((i) => i.id === id);
    if (index === -1) return false;

    // splice 方法會從陣列中移除元素
    // 參數：(起始位置, 要移除的數量)
    this.issues.splice(index, 1);
    return true;
  }

  /**
   * 檢查議題是否存在
   *
   * 這是一個輔助方法，用來快速確認某個 ID 的議題是否存在。
   *
   * @param id - 要檢查的議題 ID
   * @returns 如果議題存在回傳 true，否則回傳 false
   */
  exists(id: string): boolean {
    return this.issues.some((issue) => issue.id === id);
  }
}

/**
 * 匯出一個單例實例（Singleton Pattern）
 *
 * 我們只建立一個 InMemoryStorage 的實例，並在整個應用程式中共用它。
 * 這樣可以確保所有的 API 路由都使用同一份資料，不會各自有各自的資料副本。
 *
 * 你可以在任何地方 import { storage } from '@/lib/storage' 來使用這個儲存系統！
 */
export const storage = new IssueStorage();
