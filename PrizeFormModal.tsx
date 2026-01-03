import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Prize, PrizeCategory, Manufacturer } from '../types';

interface PrizeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prize: Prize) => void;
  prizeToEdit?: Prize | null;
}

const prizeCategories: PrizeCategory[] = ['マスコット', 'ぬいぐるみ', 'フィギュア', 'その他'];
const prizeManufacturers: Manufacturer[] = ['指定なし', 'バンダイナムコ', 'タイトー', 'SEGA FAVE', 'FuRyu', 'Parade', 'SK', 'その他'];


const PrizeFormModal: React.FC<PrizeFormModalProps> = ({ isOpen, onClose, onSave, prizeToEdit }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [photo, setPhoto] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<PrizeCategory>('その他');
  const [manufacturer, setManufacturer] = useState<Manufacturer>('指定なし');
  const [error, setError] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setName(prizeToEdit?.name || '');
    setQuantity(prizeToEdit?.quantity || 1);
    setAcquisitionDate(prizeToEdit?.acquisitionDate || new Date().toISOString().split('T')[0]);
    setPhoto(prizeToEdit?.photo || '');
    setNotes(prizeToEdit?.notes || '');
    setCategory(prizeToEdit?.category || 'その他');
    setManufacturer(prizeToEdit?.manufacturer || '指定なし');
    setError('');
  }, [prizeToEdit]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !acquisitionDate) {
      setError('景品名と獲得日は必須です。');
      return;
    }

    const newPrize: Prize = {
      id: prizeToEdit?.id || new Date().toISOString() + Math.random(),
      name,
      quantity,
      acquisitionDate,
      category,
      manufacturer,
      photo,
      notes,
    };
    onSave(newPrize);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{prizeToEdit ? '景品を編集' : '景品を追加'}</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">景品名</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">カテゴリ</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PrizeCategory)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
            >
              {prizeCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="manufacturer" className="block text-sm font-medium text-slate-700 dark:text-slate-300">製造会社</label>
            <select
              id="manufacturer"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value as Manufacturer)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
            >
              {prizeManufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">数量</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="0"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label htmlFor="acquisitionDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">獲得日</label>
            <input
              type="date"
              id="acquisitionDate"
              value={acquisitionDate}
              onChange={(e) => setAcquisitionDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">写真</label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900"
            />
            {photo && <img src={photo} alt="Preview" className="mt-4 rounded-md h-32 w-32 object-cover" />}
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">メモ</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrizeFormModal;