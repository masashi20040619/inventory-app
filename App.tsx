
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Prize, PrizeCategory } from './types';
import PrizeCard from './components/PrizeCard';
import PrizeFormModal from './components/PrizeFormModal';
import PlusIcon from './components/icons/PlusIcon';
import SearchIcon from './components/icons/SearchIcon';
import PrizeList from './components/PrizeList';
import Squares2x2Icon from './components/icons/Squares2x2Icon';
import QueueListIcon from './components/icons/QueueListIcon';

const prizeCategories: PrizeCategory[] = ['マスコット', 'ぬいぐるみ', 'フィギュア', 'その他'];

type DisplayMode = 'card' | 'list';
type SortOrder = 'date-desc' | 'name-asc' | 'name-desc';

const App: React.FC = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prizeToEdit, setPrizeToEdit] = useState<Prize | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PrizeCategory | 'すべて'>('すべて');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('card');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');

  useEffect(() => {
    try {
      const storedPrizes = localStorage.getItem('crane-game-prizes');
      if (storedPrizes) {
        const parsedPrizes: any[] = JSON.parse(storedPrizes);
        const migratedPrizes: Prize[] = parsedPrizes.map(p => ({
          ...p,
          category: p.category || 'その他',
          quantity: p.quantity ?? 1,
        }));
        setPrizes(migratedPrizes);
      }
    } catch (error) {
      console.error("Failed to load prizes from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('crane-game-prizes', JSON.stringify(prizes));
    } catch (error) {
      console.error("Failed to save prizes to localStorage", error);
    }
  }, [prizes]);

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
    handleCloseModal();
  }, [handleCloseModal]);

  const handleDeletePrize = useCallback((prizeId: string) => {
    setPrizes(prevPrizes => prevPrizes.filter(p => p.id !== prizeId));
  }, []);

  const handleQuantityChange = useCallback((prizeId: string, newQuantity: number) => {
    setPrizes(prevPrizes =>
      prevPrizes.map(p =>
        p.id === prizeId ? { ...p, quantity: newQuantity } : p
      )
    );
  }, []);

  const filteredAndSortedPrizes = useMemo(() => {
    const filtered = prizes
      .filter(prize => {
        const nameMatch = prize.name.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = selectedCategory === 'すべて' || prize.category === selectedCategory;
        return nameMatch && categoryMatch;
      });

      switch (sortOrder) {
        case 'name-asc':
          return filtered.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
        case 'name-desc':
          return filtered.sort((a, b) => b.name.localeCompare(a.name, 'ja'));
        case 'date-desc':
        default:
          return filtered.sort((a, b) => new Date(b.acquisitionDate).getTime() - new Date(a.acquisitionDate).getTime());
      }
  }, [prizes, searchTerm, selectedCategory, sortOrder]);


  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
            在庫管理
          </h1>
          <div className="w-full sm:w-auto flex flex-row flex-wrap items-center justify-center sm:justify-end gap-2">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-60">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-5 w-5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="景品名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
                aria-label="景品を検索"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PrizeCategory | 'すべて')}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
              aria-label="カテゴリで絞り込み"
            >
              <option value="すべて">すべてのカテゴリ</option>
              {prizeCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
             <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
              aria-label="並び替え"
            >
              <option value="date-desc">獲得日が新しい順</option>
              <option value="name-asc">名前 (昇順)</option>
              <option value="name-desc">名前 (降順)</option>
            </select>
            <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setDisplayMode('card')}
                className={`p-1.5 rounded-md transition-colors ${displayMode === 'card' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-500 dark:text-slate-400'}`}
                aria-label="カード表示"
              >
                <Squares2x2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`p-1.5 rounded-md transition-colors ${displayMode === 'list' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-500 dark:text-slate-400'}`}
                aria-label="リスト表示"
              >
                <QueueListIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {prizes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-slate-500 dark:text-slate-400">まだ景品が登録されていません。</p>
            <p className="mt-2 text-slate-500 dark:text-slate-400">右下の「+」ボタンから最初の景品を追加しましょう！</p>
          </div>
        ) : filteredAndSortedPrizes.length === 0 ? (
           <div className="text-center py-20">
            <p className="text-xl text-slate-500 dark:text-slate-400">検索条件に合う景品が見つかりませんでした。</p>
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
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 transition-transform transform hover:scale-110"
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
