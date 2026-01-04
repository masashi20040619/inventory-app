import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Prize, PrizeCategory } from './types';

import PrizeCard from './components/PrizeCard';
import PrizeFormModal from './components/PrizeFormModal';
import PlusIcon from './components/icons/PlusIcon';
import SearchIcon from './components/icons/SearchIcon';
import PrizeList from './components/PrizeList';
import Squares2x2Icon from './components/icons/Squares2x2Icon';
import QueueListIcon from './components/icons/QueueListIcon';
import CheckCircleIcon from './components/icons/CheckCircleIcon';
import ArrowPathIcon from './components/icons/ArrowPathIcon';

const STORAGE_KEY = 'crane-game-prizes';

const prizeCategories: PrizeCategory[] = ['マスコット', 'ぬいぐるみ', 'フィギュア', 'その他'];

type DisplayMode = 'card' | 'list';
type SortOrder = 'date-desc' | 'name-asc' | 'name-desc';
type SaveStatus = 'idle' | 'saving' | 'saved';

/**
 * 旧データを救う（昨日以前のlocalStorage形式でも落ちないように）
 * - categoryが無い → その他
 * - quantityが無い → 1
 */
function migratePrizes(parsed: any[]): Prize[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(Boolean)
    .map((p: any) => ({
      ...p,
      category: p.category || 'その他',
      quantity: p.quantity ?? 1,
    })) as Prize[];
}

const App: React.FC = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prizeToEdit, setPrizeToEdit] = useState<Prize | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PrizeCategory | 'すべて'>('すべて');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('card');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');

  // ✅ 保存表示
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // ✅ 初回ロード完了フラグ（ロード前に空で上書き保存するのを防ぐ）
  const [hydrated, setHydrated] = useState(false);

  // ✅ 遅延保存タイマー
  const saveTimeoutRef = useRef<number | null>(null);
  // ✅ 「保存済み」表示戻しタイマー（別に持つ：上書き事故防止）
  const statusTimeoutRef = useRef<number | null>(null);

  // ✅ “古いstateが後から保存される” を防ぐためのシーケンス
  const saveSeqRef = useRef(0);

  // -----------------------------
  // 1) 初回ロード：localStorage → state
  // -----------------------------
  useEffect(() => {
    try {
      const storedPrizes = localStorage.getItem(STORAGE_KEY);
      if (storedPrizes) {
        const parsedPrizes: any[] = JSON.parse(storedPrizes);
        const migrated = migratePrizes(parsedPrizes);
        setPrizes(migrated);
      }
    } catch (error) {
      console.error('Failed to load prizes from localStorage', error);
    } finally {
      // ✅ ロード完了（ここから保存OK）
      setHydrated(true);
    }
  }, []);

  // -----------------------------
  // 2) 保存：state → localStorage
  //   - 空配列でも必ず保存する
  //   - 遅延保存の競合（古いstateが後から保存）を防ぐ
  // -----------------------------
  useEffect(() => {
    // ✅ 初回ロードが終わるまで、勝手に保存しない（空で上書き防止）
    if (!hydrated) return;

    // 保存処理の“世代”を進める
    saveSeqRef.current += 1;
    const mySeq = saveSeqRef.current;

    setSaveStatus('saving');

    // 既存タイマーは必ずクリア
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    if (statusTimeoutRef.current) window.clearTimeout(statusTimeoutRef.current);

    // ✅ ほんの少し遅延してまとめて保存（入力を邪魔しない）
    saveTimeoutRef.current = window.setTimeout(() => {
      // ✅ もし自分より新しい更新があれば、古い保存は捨てる
      if (mySeq !== saveSeqRef.current) return;

      try {
        // ✅ 空配列でも保存する（これが重要）
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prizes));
        setSaveStatus('saved');

        // saved表示を少し出して idleへ
        statusTimeoutRef.current = window.setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      } catch (error) {
        console.error('Failed to save prizes to localStorage', error);
        setSaveStatus('idle');
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      if (statusTimeoutRef.current) window.clearTimeout(statusTimeoutRef.current);
    };
  }, [prizes, hydrated]);

  // -----------------------------
  // Modal open / close
  // -----------------------------
  const handleOpenAddModal = useCallback(() => {
    setPrizeToEdit(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((prize: Prize) => {
    setPrizeToEdit(prize);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setPrizeToEdit(null);
  }, []);

  // -----------------------------
  // CRUD
  // PrizeFormModalは「自動保存」で onSave を呼ぶ仕様
  // （だからここで modal を閉じないのが正しい）
  // -----------------------------
  const handleSavePrize = useCallback((prize: Prize) => {
    setPrizes(prevPrizes => {
      const existingIndex = prevPrizes.findIndex(p => p.id === prize.id);
      if (existingIndex > -1) {
        const newPrizes = [...prevPrizes];
        newPrizes[existingIndex] = prize;
        return newPrizes;
      }
      return [...prevPrizes, prize];
    });
  }, []);

  const handleDeletePrize = useCallback(
    (prizeId: string) => {
      if (window.confirm('この景品を削除してもよろしいですか？')) {
        setPrizes(prevPrizes => prevPrizes.filter(p => p.id !== prizeId));
        if (prizeToEdit?.id === prizeId) {
          handleCloseModal();
        }
      }
    },
    [prizeToEdit, handleCloseModal]
  );

  const handleQuantityChange = useCallback((prizeId: string, newQuantity: number) => {
    setPrizes(prevPrizes =>
      prevPrizes.map(p => (p.id === prizeId ? { ...p, quantity: newQuantity } : p))
    );
  }, []);

  // -----------------------------
  // filter / sort
  // -----------------------------
  const filteredAndSortedPrizes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = prizes.filter(prize => {
      const nameMatch = prize.name.toLowerCase().includes(term);
      const categoryMatch = selectedCategory === 'すべて' || prize.category === selectedCategory;
      return nameMatch && categoryMatch;
    });

    switch (sortOrder) {
      case 'name-asc':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'ja'));
      case 'name-desc':
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name, 'ja'));
      case 'date-desc':
      default:
        return [...filtered].sort(
          (a, b) => new Date(b.acquisitionDate).getTime() - new Date(a.acquisitionDate).getTime()
        );
    }
  }, [prizes, searchTerm, selectedCategory, sortOrder]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
              景品在庫
            </h1>

            <div className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all duration-300">
              {saveStatus === 'saving' ? (
                <>
                  <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                  保存中...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                  保存済み
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-3 h-3 mr-1 opacity-50" />
                  クラウド保存
                </>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto flex flex-row flex-wrap items-center justify-center sm:justify-end gap-2">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-48">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 dark:text-slate-100"
                aria-label="景品を検索"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PrizeCategory | 'すべて')}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 dark:text-slate-100"
              aria-label="カテゴリで絞り込み"
            >
              <option value="すべて">すべて</option>
              {prizeCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 dark:text-slate-100"
              aria-label="並び替え"
            >
              <option value="date-desc">新しい順</option>
              <option value="name-asc">名前 A-Z</option>
              <option value="name-desc">名前 Z-A</option>
            </select>

            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 border border-slate-200 dark:border-slate-600">
              <button
                onClick={() => setDisplayMode('card')}
                className={`p-1.5 rounded-md transition-all ${
                  displayMode === 'card'
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
                aria-label="カード表示"
              >
                <Squares2x2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`p-1.5 rounded-md transition-all ${
                  displayMode === 'list'
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
                aria-label="リスト表示"
              >
                <QueueListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {prizes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-inner border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 text-indigo-500">
              <PlusIcon className="w-8 h-8" />
            </div>
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
              まだ景品がありません
            </p>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              右下の「+」ボタンから最初の景品を追加しましょう！
            </p>
          </div>
        ) : filteredAndSortedPrizes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-slate-500 dark:text-slate-400">
              検索条件に合う景品が見つかりませんでした。
            </p>
          </div>
        ) : (
          <>
            {displayMode === 'card' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedPrizes.map(prize => (
                  <PrizeCard
                    key={prize.id}
                    prize={prize}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeletePrize}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </div>
            ) : (
              <PrizeList
                prizes={filteredAndSortedPrizes}
                onEdit={handleOpenEditModal}
                onDelete={handleDeletePrize}
                onQuantityChange={handleQuantityChange}
              />
            )}
          </>
        )}
      </main>

      <button
        onClick={handleOpenAddModal}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 transition-all transform hover:scale-110 active:scale-95 z-30"
        aria-label="景品を追加"
      >
        <PlusIcon className="h-8 w-8" />
      </button>

      <PrizeFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePrize}
        prizeToEdit={prizeToEdit}
      />
    </div>
  );
};

export default App;

