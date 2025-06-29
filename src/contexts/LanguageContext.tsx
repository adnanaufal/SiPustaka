import React, { createContext, useContext, useEffect, useState } from 'react';

interface LanguageContextType {
  language: 'en' | 'id';
  setLanguage: (lang: 'en' | 'id') => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

const translations = {
  en: {
    // Header
    'header.dashboard': 'Dashboard',
    'header.signOut': 'Sign Out',
    'header.signIn': 'Sign In',
    'header.signUp': 'Sign Up',
    
    // HomePage
    'home.welcome': 'Welcome to SiPustaka',
    'home.welcomeUser': 'Welcome {name} to SiPustaka',
    'home.subtitle': 'Your comprehensive bookstore management system with role-based access, inventory tracking, and seamless shopping experience.',
    'home.getStarted': 'Get Started',
    'home.signIn': 'Sign In',
    'home.newArrivals': 'New Arrivals',
    'home.newArrivalsSubtitle': 'Discover the latest books added to our collection',
    'home.loadingNewArrivals': 'Loading new arrivals...',
    'home.noBooksAvailable': 'No books available yet',
    'home.checkBackLater': 'Check back later for new arrivals',
    'home.accessDashboard': 'Access Your Dashboard',
    'home.chooseRole': 'Choose your role to access the appropriate features',
    'home.admin': 'Admin',
    'home.adminDesc': 'Full system access - manage books, users, transactions, and view comprehensive reports.',
    'home.adminLogin': 'Admin Login',
    'home.cashier': 'Cashier',
    'home.cashierDesc': 'Process transactions, manage stock, and assist customers with their purchases.',
    'home.cashierLogin': 'Cashier Login',
    'home.customer': 'Customer',
    'home.customerDesc': 'Browse books, add to cart, make purchases, and track your order history.',
    'home.customerLogin': 'Customer Login',
    'home.powerfulFeatures': 'Powerful Features',
    'home.featuresSubtitle': 'Everything you need for a complete bookstore management system',
    'home.bookManagement': 'Book Management',
    'home.bookManagementDesc': 'Complete CRUD operations for books with cover images and detailed information.',
    'home.shoppingCart': 'Shopping Cart',
    'home.shoppingCartDesc': 'Real-time cart management with automatic stock updates and reservation.',
    'home.userManagement': 'User Management',
    'home.userManagementDesc': 'Role-based access control with secure authentication and user profiles.',
    
    // Admin Dashboard
    'admin.dashboard': 'Admin Dashboard',
    'admin.manageOperations': 'Manage your bookstore operations',
    'admin.addBook': 'Add Book',
    'admin.totalBooks': 'Total Books',
    'admin.totalUsers': 'Total Users',
    'admin.transactions': 'Transactions',
    'admin.revenue': 'Revenue',
    'admin.quickActions': 'Quick Actions',
    'admin.manageUsers': 'Manage Users',
    'admin.viewReports': 'View Reports',
    'admin.stockLogs': 'Stock Logs',
    'admin.newArrivals': 'New Arrivals (Last 30 Days)',
    'admin.bestSellers': 'Best Sellers',
    'admin.lowStockBooks': 'Low Stock Books',
    'admin.lowStockSubtitle': 'Books that need immediate restocking attention',
    'admin.browseAllBooks': 'Browse All Books',
    'admin.noLowStockBooks': 'All books have sufficient stock',
    'admin.loadingDashboard': 'Loading dashboard...',
    
    // Customer Dashboard
    'customer.browseBooks': 'Browse Books',
    'customer.discoverBooks': 'Discover your next favorite read',
    'customer.viewCart': 'View Cart',
    'customer.searchBooks': 'Search books...',
    'customer.allCategories': 'All Categories',
    'customer.sortByTitle': 'Sort by Title',
    'customer.sortByAuthor': 'Sort by Author',
    'customer.priceLowToHigh': 'Price: Low to High',
    'customer.priceHighToLow': 'Price: High to Low',
    'customer.newestFirst': 'Newest First',
    'customer.booksFound': 'book(s) found',
    'customer.noBooksFound': 'No books found',
    'customer.adjustFilters': 'Try adjusting your search or filters',
    'customer.loadingBooks': 'Loading books...',
    
    // Cart Page
    'cart.backToBooks': 'Back to Books',
    'cart.shoppingCart': 'Shopping Cart',
    'cart.itemsInCart': 'item(s) in your cart',
    'cart.loadingCart': 'Loading cart...',
    'cart.cartEmpty': 'Your cart is empty',
    'cart.startShopping': 'Start shopping to add items to your cart',
    'cart.browseBooks': 'Browse Books',
    'cart.remove': 'Remove',
    'cart.orderSummary': 'Order Summary',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    
    // Book Card
    'book.addToCart': 'Add to Cart',
    'book.viewDetails': 'View Details',
    'book.left': 'left',
    
    // Book Detail Modal
    'bookDetail.title': 'Book Details',
    'bookDetail.category': 'Category',
    'bookDetail.year': 'Year',
    'bookDetail.price': 'Price',
    'bookDetail.stock': 'Stock',
    'bookDetail.available': 'available',
    'bookDetail.description': 'Description',
    'bookDetail.noDescription': 'No description available for this book.',
    'bookDetail.noCover': 'No Cover Available',
    'bookDetail.close': 'Close',
  },
  id: {
    // Header
    'header.dashboard': 'Dasbor',
    'header.signOut': 'Keluar',
    'header.signIn': 'Masuk',
    'header.signUp': 'Daftar',
    
    // HomePage
    'home.welcome': 'Selamat Datang di SiPustaka',
    'home.welcomeUser': 'Selamat Datang {name} di SiPustaka',
    'home.subtitle': 'Sistem manajemen toko buku komprehensif dengan akses berbasis peran, pelacakan inventori, dan pengalaman berbelanja yang mulus.',
    'home.getStarted': 'Mulai',
    'home.signIn': 'Masuk',
    'home.newArrivals': 'Buku Terbaru',
    'home.newArrivalsSubtitle': 'Temukan buku-buku terbaru yang ditambahkan ke koleksi kami',
    'home.loadingNewArrivals': 'Memuat buku terbaru...',
    'home.noBooksAvailable': 'Belum ada buku tersedia',
    'home.checkBackLater': 'Periksa kembali nanti untuk buku terbaru',
    'home.accessDashboard': 'Akses Dasbor Anda',
    'home.chooseRole': 'Pilih peran Anda untuk mengakses fitur yang sesuai',
    'home.admin': 'Admin',
    'home.adminDesc': 'Akses sistem penuh - kelola buku, pengguna, transaksi, dan lihat laporan komprehensif.',
    'home.adminLogin': 'Login Admin',
    'home.cashier': 'Kasir',
    'home.cashierDesc': 'Proses transaksi, kelola stok, dan bantu pelanggan dengan pembelian mereka.',
    'home.cashierLogin': 'Login Kasir',
    'home.customer': 'Pelanggan',
    'home.customerDesc': 'Jelajahi buku, tambahkan ke keranjang, lakukan pembelian, dan lacak riwayat pesanan Anda.',
    'home.customerLogin': 'Login Pelanggan',
    'home.powerfulFeatures': 'Fitur Canggih',
    'home.featuresSubtitle': 'Semua yang Anda butuhkan untuk sistem manajemen toko buku yang lengkap',
    'home.bookManagement': 'Manajemen Buku',
    'home.bookManagementDesc': 'Operasi CRUD lengkap untuk buku dengan gambar sampul dan informasi detail.',
    'home.shoppingCart': 'Keranjang Belanja',
    'home.shoppingCartDesc': 'Manajemen keranjang real-time dengan pembaruan stok otomatis dan reservasi.',
    'home.userManagement': 'Manajemen Pengguna',
    'home.userManagementDesc': 'Kontrol akses berbasis peran dengan autentikasi aman dan profil pengguna.',
    
    // Admin Dashboard
    'admin.dashboard': 'Dasbor Admin',
    'admin.manageOperations': 'Kelola operasi toko buku Anda',
    'admin.addBook': 'Tambah Buku',
    'admin.totalBooks': 'Total Buku',
    'admin.totalUsers': 'Total Pengguna',
    'admin.transactions': 'Transaksi',
    'admin.revenue': 'Pendapatan',
    'admin.quickActions': 'Aksi Cepat',
    'admin.manageUsers': 'Kelola Pengguna',
    'admin.viewReports': 'Lihat Laporan',
    'admin.stockLogs': 'Log Stok',
    'admin.newArrivals': 'Buku Terbaru (30 Hari Terakhir)',
    'admin.bestSellers': 'Buku Terlaris',
    'admin.lowStockBooks': 'Buku Stok Rendah',
    'admin.lowStockSubtitle': 'Buku yang memerlukan perhatian restok segera',
    'admin.browseAllBooks': 'Jelajahi Semua Buku',
    'admin.noLowStockBooks': 'Semua buku memiliki stok yang cukup',
    'admin.loadingDashboard': 'Memuat dasbor...',
    
    // Customer Dashboard
    'customer.browseBooks': 'Jelajahi Buku',
    'customer.discoverBooks': 'Temukan bacaan favorit Anda selanjutnya',
    'customer.viewCart': 'Lihat Keranjang',
    'customer.searchBooks': 'Cari buku...',
    'customer.allCategories': 'Semua Kategori',
    'customer.sortByTitle': 'Urutkan berdasarkan Judul',
    'customer.sortByAuthor': 'Urutkan berdasarkan Penulis',
    'customer.priceLowToHigh': 'Harga: Rendah ke Tinggi',
    'customer.priceHighToLow': 'Harga: Tinggi ke Rendah',
    'customer.newestFirst': 'Terbaru Dulu',
    'customer.booksFound': 'buku ditemukan',
    'customer.noBooksFound': 'Tidak ada buku ditemukan',
    'customer.adjustFilters': 'Coba sesuaikan pencarian atau filter Anda',
    'customer.loadingBooks': 'Memuat buku...',
    
    // Cart Page
    'cart.backToBooks': 'Kembali ke Buku',
    'cart.shoppingCart': 'Keranjang Belanja',
    'cart.itemsInCart': 'item di keranjang Anda',
    'cart.loadingCart': 'Memuat keranjang...',
    'cart.cartEmpty': 'Keranjang Anda kosong',
    'cart.startShopping': 'Mulai berbelanja untuk menambahkan item ke keranjang Anda',
    'cart.browseBooks': 'Jelajahi Buku',
    'cart.remove': 'Hapus',
    'cart.orderSummary': 'Ringkasan Pesanan',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    
    // Book Card
    'book.addToCart': 'Tambah ke Keranjang',
    'book.viewDetails': 'Lihat Detail',
    'book.left': 'tersisa',
    
    // Book Detail Modal
    'bookDetail.title': 'Detail Buku',
    'bookDetail.category': 'Kategori',
    'bookDetail.year': 'Tahun',
    'bookDetail.price': 'Harga',
    'bookDetail.stock': 'Stok',
    'bookDetail.available': 'tersedia',
    'bookDetail.description': 'Deskripsi',
    'bookDetail.noDescription': 'Tidak ada deskripsi tersedia untuk buku ini.',
    'bookDetail.noCover': 'Tidak Ada Sampul Tersedia',
    'bookDetail.close': 'Tutup',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'id'>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'id') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: 'en' | 'id') => {
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, string>) => {
    let translation = translations[language][key] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, value);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}