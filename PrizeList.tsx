
import React from 'react';
import { Prize } from '../types';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';

interface PrizeListProps {
  prizes: Prize[];
  onEdit: (prize: Prize) => void;
  onDelete: (prizeId: string) => void;
  onQuantityChange: (prizeId: string, newQuantity: number) => void;
}

const PrizeList: React.FC<PrizeListProps> = ({ prizes, onEdit, onDelete, onQuantityChange }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
          <tr>
            <th scope="col" className="px-6 py-3 min-w-[200px]">
              景品名
            </th>
            <th scope="col" className="px-6 py-3">
              カテゴリ
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              数量
            </th>
            <th scope="col" className="px-6 py-3">
              獲得日
            </th>
            <th scope="col" className="px-6 py-3">
              会社
            </th>
            <th scope="col" className="px-6 py-3 text-right">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {prizes.map((prize) => (
            <tr key={prize.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50 align-middle">
              <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                {prize.name}
              </th>
              <td className="px-6 py-4">
                {prize.category}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onQuantityChange(prize.id, Math.max(0, prize.quantity - 1))}
                    className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                    aria-label="減らす"
                  >
                    -
                  </button>
                  <span className="font-mono text-base w-8 text-center">{prize.quantity}</span>
                  <button
                    onClick={() => onQuantityChange(prize.id, prize.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                    aria-label="増やす"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {prize.acquisitionDate}
              </td>
              <td className="px-6 py-4">
                {prize.manufacturer && prize.manufacturer !== '指定なし' ? prize.manufacturer : '-'}
              </td>
              <td className="px-6 py-4">
                 <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => onEdit(prize)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        aria-label="編集"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(prize.id)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        aria-label="削除"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrizeList;
