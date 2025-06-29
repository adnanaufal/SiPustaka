import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  UserPlus,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Layout } from "../../components/Layout/Layout";
import { BookCard } from "../../components/Books/BookCard";
import { BookForm } from "../../components/Books/BookForm";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import type { Database } from "../../lib/supabase";

type Book = Database["public"]["Tables"]["books"]["Row"];

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  newArrivals: Book[];
  bestSellers: Book[];
}

// Confirmation modal component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div className="mt-0 ml-4 text-left">
              <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex flex-row-reverse rounded-b-xl">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch books
      const { data: booksData } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch users count
      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact" });

      // Fetch transactions
      const { data: transactionsData, count: transactionsCount } =
        await supabase
          .from("transactions")
          .select("total_amount", { count: "exact" })
          .eq("status", "completed");

      // Calculate revenue
      const totalRevenue =
        transactionsData?.reduce((sum, t) => sum + Number(t.total_amount), 0) ||
        0;

      // Get new arrivals (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newArrivals =
        booksData
          ?.filter((book) => new Date(book.created_at) >= thirtyDaysAgo)
          .slice(0, 4) || [];

      // Get best sellers (books with most transaction items)
      // Note: This is a simplified approach. For larger datasets, a database function would be better.
      const { data: bestSellersData } = await supabase
        .from("transaction_items")
        .select("book_id, quantity, books!inner(*)")
        .order("quantity", { ascending: false })
        .limit(4);

      const bestSellers: Book[] =
        bestSellersData
          ?.map((item) => item.books as Book)
          .filter((book): book is Book => book !== null) || [];

      setStats({
        totalBooks: booksData?.length || 0,
        totalUsers: usersCount || 0,
        totalTransactions: transactionsCount || 0,
        totalRevenue,
        newArrivals,
        bestSellers,
      });

      setBooks(booksData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (
    bookData: Omit<Book, "id" | "created_at" | "updated_at">
  ) => {
    setFormLoading(true);
    try {
      const { data, error } = await supabase
        .from("books")
        .insert(bookData)
        .select()
        .single();

      if (error) throw error;

      // Add stock log
      if (bookData.stock > 0) {
        await supabase.from("stock_logs").insert({
          book_id: data.id,
          change_type: "add",
          quantity_change: bookData.stock,
          previous_stock: 0,
          new_stock: bookData.stock,
          user_id: user!.id,
          notes: "Initial stock when adding book",
        });
      }

      toast.success("Book added successfully");
      setShowBookForm(false);
      fetchDashboardData();
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Failed to add book");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditBook = async (
    bookData: Omit<Book, "id" | "created_at" | "updated_at">
  ) => {
    if (!editingBook) return;

    setFormLoading(true);
    try {
      const { error } = await supabase
        .from("books")
        .update(bookData)
        .eq("id", editingBook.id);

      if (error) throw error;

      // Log stock change if stock was updated
      if (bookData.stock !== editingBook.stock) {
        const stockChange = bookData.stock - editingBook.stock;
        await supabase.from("stock_logs").insert({
          book_id: editingBook.id,
          change_type: stockChange > 0 ? "add" : "remove",
          quantity_change: stockChange,
          previous_stock: editingBook.stock,
          new_stock: bookData.stock,
          user_id: user!.id,
          notes: "Stock updated via book edit",
        });
      }

      toast.success("Book updated successfully");
      setEditingBook(null);
      setShowBookForm(false);
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Failed to update book");
    } finally {
      setFormLoading(false);
    }
  };

// Function to handle book deletion
const handleDeleteRequest = (book: Book) => {
  setBookToDelete(book);
  setShowConfirmation(true);
};

// Function to confirm book deletion
const confirmDelete = async () => {
  if (!bookToDelete) return;

  try {
    const { error } = await supabase.from("books").delete().eq("id", bookToDelete.id);
    if (error) throw error;
    toast.success(`"${bookToDelete.title}" has been deleted.`);
    fetchDashboardData();
  } catch (error: any) {
    toast.error(`Failed to delete book: ${error.message}`);
  } finally {
    setShowConfirmation(false);
    setBookToDelete(null);
  }
};

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Loading dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your bookstore operations
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowBookForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Add Book</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Books
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalBooks}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalUsers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Transactions
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalTransactions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${stats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowBookForm(true)}
                  className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    Add Book
                  </span>
                </button>
                <Link
                  to="/admin/users"
                  className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200"
                >
                  <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Manage Users
                  </span>
                </Link>
                <button className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200">
                  <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                    View Reports
                  </span>
                </button>
                <button className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-200">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-orange-600 dark:text-orange-400 font-medium">
                    Stock Logs
                  </span>
                </button>
              </div>
            </div>

            {/* New Arrivals */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                New Arrivals (Last 30 Days)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.newArrivals.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onEdit={() => setEditingBook(book)}
                    onDelete={() => handleDeleteRequest(book)}
                  />
                ))}
              </div>
            </div>

            {/* Best Sellers */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Best Sellers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.bestSellers.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onEdit={() => setEditingBook(book)}
                    onDelete={() => handleDeleteRequest(book)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Book Form Modal */}
      {(showBookForm || editingBook) && (
        <BookForm
          book={editingBook || undefined}
          onSubmit={editingBook ? handleEditBook : handleAddBook}
          onClose={() => {
            setShowBookForm(false);
            setEditingBook(null);
          }}
          loading={formLoading}
        />
      )}

      <ConfirmationModal 
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmDelete}
        title="Delete Book"
        message={`Are you sure you want to delete "${bookToDelete?.title}"? This action cannot be undone.`}
      />
      
    </Layout>
  );
}