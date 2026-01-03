import React from 'react';
import { Prize } from '../types';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ImageIcon from './icons/ImageIcon';

interface PrizeCardProps {
  prize: Prize;
  onEdit: (prize: Prize) => void;
  onDelete: (prizeId: string) => void;
  onQuantityChange: (prizeId: string, newQuantity: number) => void;
}

const PrizeCard: React.FC<PrizeCardProps> = ({ prize, onEdit, onDelete, onQuantityChange }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out relative">
      {prize.photo ? (
        <img src={prize.photo} alt={prize.name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <ImageIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <span className="absolute top-2 left-2 bg-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">{prize.category}</span>
      <div className="p-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 truncate">{prize.name}</h3>
        
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-2">
          <span className="font-semibold">数量:</span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onQuantityChange(prize.id, Math.max(0, prize.quantity - 1))}
              className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
              aria-label="減らす"
            >
              -
            </button>
            <span className="font-mono text-lg w-8 text-center">{prize.quantity}</span>
            <button 
              onClick={() => onQuantityChange(prize.id, prize.quantity + 1)}
              className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
              aria-label="増やす"
            >
              +
            </button>
          </div>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold">獲得日:</span> {prize.acquisitionDate}</p>

        {prize.manufacturer && prize.manufacturer !== '指定なし' && (
          <p className="text-slate-600 dark:text-slate-300 mt-1"><span className="font-semibold">会社:</span> {prize.manufacturer}</p>
        )}
        
        {prize.notes && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 bg-slate-100 dark:bg-slate-700 p-2 rounded whitespace-pre-wrap max-h-20 overflow-y-auto">
            {prize.notes}
          </p>
        )}
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 flex justify-end space-x-2">
        <button
          onClick={() => onEdit(prize)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          aria-label="編集"
        >
          <PencilIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => onDelete(prize.id)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          aria-label="削除"
        >
          <TrashIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default PrizeCard;