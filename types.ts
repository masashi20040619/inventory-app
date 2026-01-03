export type PrizeCategory = 'マスコット' | 'ぬいぐるみ' | 'フィギュア' | 'その他';

export type Manufacturer = '指定なし' | 'バンダイナムコ' | 'タイトー' | 'SEGA FAVE' | 'FuRyu' | 'Parade' | 'SK' | 'その他';

export interface Prize {
  id: string;
  name: string;
  quantity: number;
  acquisitionDate: string;
  category: PrizeCategory;
  manufacturer?: Manufacturer;
  photo?: string; // Base64 encoded image data, now optional
  notes?: string;
}
