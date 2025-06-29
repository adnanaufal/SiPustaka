import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, loading, totalAmount, updateQuantity, removeFromCart, checkout } = useCart();

  const handleCheckout = async () => {
    try {
      await checkout();
      onClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Shopping Cart ({items.length})
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading cart...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="w-16 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                      {item.book.cover_image ? (
                        <img
                          src={item.book.cover_image}
                          alt={item.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {item.book.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        by {item.book.author}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${item.book.price.toFixed(2)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total: ${totalAmount.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}