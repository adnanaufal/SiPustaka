import React from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { SortOption } from '../../hooks/useBooks';

interface BookFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  categories: string[];
  totalBooks: number;
}

export function BookFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categories,
  totalBooks,
}: BookFilterProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('customer.searchBooks')}
          className="input-field pl-12 pr-10"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800"
          >
            <X className="h-4 w-4 text-primary-400" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="input-field !w-auto !py-2 !px-3 text-sm"
        >
          <option value="">{t('customer.allCategories')}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="input-field !w-auto !py-2 !px-3 text-sm"
        >
          <option value="newest">{t('customer.newestFirst')}</option>
          <option value="title">{t('customer.sortByTitle')}</option>
          <option value="author">{t('customer.sortByAuthor')}</option>
          <option value="price_asc">{t('customer.priceLowToHigh')}</option>
          <option value="price_desc">{t('customer.priceHighToLow')}</option>
        </select>

        <span className="text-sm text-primary-500 dark:text-primary-400 ml-auto">
          {t('customer.booksFound', { count: String(totalBooks) })}
        </span>
      </div>
    </div>
  );
}
