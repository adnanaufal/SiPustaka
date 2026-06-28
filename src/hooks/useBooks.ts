import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Book } from '../lib/supabase';

export type SortOption = 'title' | 'author' | 'price_asc' | 'price_desc' | 'newest';

interface FetchBooksOptions {
  search?: string;
  category?: string;
  sort?: SortOption;
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async (options?: FetchBooksOptions) => {
    setLoading(true);
    try {
      let query = supabase.from('books').select('*');

      if (options?.search) {
        const s = `%${options.search}%`;
        query = query.or(`title.ilike.${s},author.ilike.${s},category.ilike.${s}`);
      }

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      switch (options?.sort) {
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        case 'author':
          query = query.order('author', { ascending: true });
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setBooks((data as Book[]) || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('category')
        .order('category');

      if (error) throw error;
      const unique = [...new Set((data || []).map((b: { category: string }) => b.category))];
      setCategories(unique);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [fetchBooks, fetchCategories]);

  const getBookById = async (id: string): Promise<Book | null> => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Book;
    } catch (error) {
      console.error('Error fetching book:', error);
      return null;
    }
  };

  const createBook = async (bookData: Omit<Book, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('books')
      .insert(bookData)
      .select()
      .single();

    if (error) throw error;
    await fetchBooks();
    await fetchCategories();
    return data as Book;
  };

  const updateBook = async (id: string, bookData: Partial<Book>) => {
    const { data, error } = await supabase
      .from('books')
      .update(bookData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchBooks();
    await fetchCategories();
    return data as Book;
  };

  const deleteBook = async (id: string) => {
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
    await fetchBooks();
    await fetchCategories();
  };

  return {
    books,
    categories,
    loading,
    fetchBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
  };
}
