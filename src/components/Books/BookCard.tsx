import React from "react";
import { ShoppingCart, Edit, Trash2, Package, Eye } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../hooks/useCart";
import type { Database } from "../../lib/supabase";
import { formatRupiah } from "../../utils/formatters"; // Impor fungsi format Rupiah

type Book = Database["public"]["Tables"]["books"]["Row"];

interface BookCardProps {
  book: Book;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onUpdateStock?: (book: Book) => void;
  onViewDetail?: (book: Book) => void;
}

export function BookCard({
  book,
  onEdit,
  onDelete,
  onUpdateStock,
  onViewDetail,
}: BookCardProps) {
  const { profile } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(book.id, 1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Book Cover */}
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No Cover
              </p>
            </div>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              book.stock > 10
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : book.stock > 0
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {book.stock} left
          </span>
        </div>
      </div>

      {/* Book Details */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {book.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          by {book.author}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-500">
            {book.category} • {book.year}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {book.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatRupiah(book.price)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* View Detail Button - Always visible */}
          {onViewDetail && (
            <button
              onClick={() => onViewDetail(book)}
              className="flex items-center justify-center p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {profile?.role === "customer" && (
            <button
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          )}

          {(profile?.role === "admin" || profile?.role === "cashier") && (
            <>
              {profile?.role === "admin" && (
                <>
                  <button
                    onClick={() => onEdit?.(book)}
                    className="flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete?.(book)}
                    className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={() => onUpdateStock?.(book)}
                className="flex items-center justify-center p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
              >
                <Package className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}