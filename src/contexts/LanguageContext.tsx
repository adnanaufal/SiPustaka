import React, { createContext, useContext, useEffect, useState } from 'react';

interface LanguageContextType {
  language: 'en' | 'id';
  setLanguage: (lang: 'en' | 'id') => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

const translations: Record<string, Record<string, string>> = {
  id: {
    // Header
    'header.dashboard': 'Dasbor',
    'header.signOut': 'Keluar',
    'header.signIn': 'Masuk',
    'header.signUp': 'Daftar',
    'header.cart': 'Keranjang',
    'header.wishlist': 'Wishlist',
    'header.orders': 'Pesanan',
    'header.settings': 'Pengaturan',
    'header.admin': 'Admin',
    'header.users': 'Pengguna',
    'header.stores': 'Toko',
    'header.orderManagement': 'Kelola Pesanan',

    // HomePage
    'home.welcome': 'Selamat Datang di SiPustaka',
    'home.welcomeUser': 'Selamat Datang, {name}!',
    'home.subtitle': 'Jelajahi koleksi buku terlengkap dengan pengalaman belanja yang mudah, aman, dan nyaman. Temukan buku favorit Anda hari ini.',
    'home.getStarted': 'Mulai Belanja',
    'home.signIn': 'Masuk',
    'home.newArrivals': 'Buku Terbaru',
    'home.newArrivalsSubtitle': 'Temukan buku-buku terbaru yang ditambahkan ke koleksi kami',
    'home.loadingNewArrivals': 'Memuat buku terbaru...',
    'home.noBooksAvailable': 'Belum ada buku tersedia',
    'home.checkBackLater': 'Periksa kembali nanti untuk buku terbaru',
    'home.accessDashboard': 'Akses Dasbor Anda',
    'home.chooseRole': 'Pilih peran Anda untuk mengakses fitur yang sesuai',
    'home.admin': 'Admin',
    'home.adminDesc': 'Akses sistem penuh — kelola buku, pengguna, transaksi, dan lihat laporan komprehensif.',
    'home.adminLogin': 'Masuk Admin',
    'home.cashier': 'Kasir',
    'home.cashierDesc': 'Proses transaksi, kelola stok, dan bantu pelanggan dengan pembelian mereka.',
    'home.cashierLogin': 'Masuk Kasir',
    'home.customer': 'Pelanggan',
    'home.customerDesc': 'Jelajahi buku, tambahkan ke keranjang, lakukan pembelian, dan lacak pesanan Anda.',
    'home.customerLogin': 'Masuk Pelanggan',
    'home.powerfulFeatures': 'Fitur Unggulan',
    'home.featuresSubtitle': 'Semua yang Anda butuhkan untuk pengalaman belanja buku terbaik',
    'home.bookManagement': 'Manajemen Buku',
    'home.bookManagementDesc': 'Katalog lengkap dengan pencarian dan filter canggih.',
    'home.shoppingCart': 'Keranjang Belanja',
    'home.shoppingCartDesc': 'Manajemen keranjang real-time dengan pembaruan stok otomatis.',
    'home.userManagement': 'Manajemen Pengguna',
    'home.userManagementDesc': 'Kontrol akses berbasis peran dengan autentikasi aman.',
    'home.ourStores': 'Toko Kami',
    'home.ourStoresSubtitle': 'Kunjungi toko kami yang tersebar di Jabodetabek',

    // Auth
    'auth.login': 'Masuk',
    'auth.signup': 'Daftar',
    'auth.email': 'Email',
    'auth.password': 'Kata Sandi',
    'auth.confirmPassword': 'Konfirmasi Kata Sandi',
    'auth.fullName': 'Nama Lengkap',
    'auth.loginTitle': 'Masuk ke Akun Anda',
    'auth.loginSubtitle': 'Selamat datang kembali! Masukkan data Anda.',
    'auth.signupTitle': 'Buat Akun Baru',
    'auth.signupSubtitle': 'Mulai perjalanan literasi Anda bersama SiPustaka.',
    'auth.noAccount': 'Belum punya akun?',
    'auth.hasAccount': 'Sudah punya akun?',
    'auth.loginSuccess': 'Berhasil masuk!',
    'auth.signupSuccess': 'Akun berhasil dibuat!',
    'auth.signOutSuccess': 'Berhasil keluar!',
    'auth.passwordMismatch': 'Kata sandi tidak cocok',
    'auth.passwordMin': 'Minimal 6 karakter',
    'auth.loggingIn': 'Sedang masuk...',
    'auth.signingUp': 'Sedang mendaftar...',

    // Customer Dashboard
    'customer.browseBooks': 'Jelajahi Buku',
    'customer.discoverBooks': 'Temukan bacaan favorit Anda selanjutnya',
    'customer.viewCart': 'Lihat Keranjang',
    'customer.searchBooks': 'Cari buku berdasarkan judul, penulis, atau kategori...',
    'customer.allCategories': 'Semua Kategori',
    'customer.sortByTitle': 'Judul A-Z',
    'customer.sortByAuthor': 'Penulis A-Z',
    'customer.priceLowToHigh': 'Harga: Rendah ke Tinggi',
    'customer.priceHighToLow': 'Harga: Tinggi ke Rendah',
    'customer.newestFirst': 'Terbaru Dulu',
    'customer.booksFound': '{count} buku ditemukan',
    'customer.noBooksFound': 'Tidak ada buku ditemukan',
    'customer.adjustFilters': 'Coba sesuaikan pencarian atau filter Anda',
    'customer.loadingBooks': 'Memuat buku...',

    // Cart
    'cart.backToBooks': 'Kembali ke Buku',
    'cart.shoppingCart': 'Keranjang Belanja',
    'cart.itemsInCart': '{count} item di keranjang',
    'cart.loadingCart': 'Memuat keranjang...',
    'cart.cartEmpty': 'Keranjang Anda kosong',
    'cart.startShopping': 'Mulai berbelanja untuk menambahkan item ke keranjang',
    'cart.browseBooks': 'Jelajahi Buku',
    'cart.remove': 'Hapus',
    'cart.orderSummary': 'Ringkasan Pesanan',
    'cart.subtotal': 'Subtotal',
    'cart.total': 'Total',
    'cart.checkout': 'Lanjut ke Checkout',
    'cart.addedToCart': 'Ditambahkan ke keranjang',
    'cart.removedFromCart': 'Dihapus dari keranjang',
    'cart.stockExceeded': 'Stok tidak mencukupi',

    // Wishlist
    'wishlist.title': 'Wishlist Saya',
    'wishlist.empty': 'Wishlist Anda kosong',
    'wishlist.startBrowsing': 'Mulai menjelajah untuk menambahkan buku ke wishlist',
    'wishlist.itemsInWishlist': '{count} item di wishlist',
    'wishlist.loadingWishlist': 'Memuat wishlist...',
    'wishlist.addedToWishlist': 'Ditambahkan ke wishlist',
    'wishlist.removedFromWishlist': 'Dihapus dari wishlist',
    'wishlist.moveToCart': 'Pindah ke Keranjang',

    // Book
    'book.addToCart': 'Tambah ke Keranjang',
    'book.buyNow': 'Beli Sekarang',
    'book.viewDetails': 'Lihat Detail',
    'book.edit': 'Edit Buku',
    'book.delete': 'Hapus Buku',
    'book.updateStock': 'Update Stok',
    'book.addToWishlist': 'Tambah ke Wishlist',
    'book.removeFromWishlist': 'Hapus dari Wishlist',
    'book.left': 'tersisa',
    'book.outOfStock': 'Stok Habis',
    'book.inStock': 'Tersedia',
    'book.lowStock': 'Stok Terbatas',
    'book.weight': 'Berat',

    // Book Detail
    'bookDetail.title': 'Detail Buku',
    'bookDetail.category': 'Kategori',
    'bookDetail.year': 'Tahun',
    'bookDetail.price': 'Harga',
    'bookDetail.stock': 'Stok',
    'bookDetail.available': 'tersedia',
    'bookDetail.description': 'Deskripsi',
    'bookDetail.noDescription': 'Tidak ada deskripsi tersedia.',
    'bookDetail.noCover': 'Tidak Ada Sampul',
    'bookDetail.close': 'Tutup',

    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shipping': 'Pengiriman',
    'checkout.payment': 'Pembayaran',
    'checkout.confirmation': 'Konfirmasi',
    'checkout.deliverTo': 'Kirim ke Alamat',
    'checkout.pickupAt': 'Ambil di Toko',
    'checkout.selectAddress': 'Pilih Alamat',
    'checkout.addAddress': 'Tambah Alamat Baru',
    'checkout.selectStore': 'Pilih Toko',
    'checkout.selectCourier': 'Pilih Kurir',
    'checkout.shippingCost': 'Ongkos Kirim',
    'checkout.totalPayment': 'Total Pembayaran',
    'checkout.payNow': 'Bayar Sekarang',
    'checkout.processing': 'Memproses...',
    'checkout.next': 'Lanjut',
    'checkout.back': 'Kembali',
    'checkout.estimatedDelivery': 'Estimasi pengiriman',
    'checkout.days': 'hari',
    'checkout.free': 'Gratis',

    // Order
    'order.title': 'Pesanan Saya',
    'order.orderNumber': 'No. Pesanan',
    'order.orderDate': 'Tanggal Pesanan',
    'order.orderDetail': 'Detail Pesanan',
    'order.trackOrder': 'Lacak Pesanan',
    'order.cancelOrder': 'Batalkan Pesanan',
    'order.noOrders': 'Belum ada pesanan',
    'order.startShopping': 'Mulai belanja untuk membuat pesanan pertama Anda',
    'order.items': '{count} item',
    'order.paymentMethod': 'Metode Pembayaran',
    'order.shippingInfo': 'Info Pengiriman',
    'order.trackingNumber': 'Nomor Resi',

    // Order Status
    'status.pending_payment': 'Menunggu Pembayaran',
    'status.processing': 'Diproses',
    'status.shipped': 'Dikirim',
    'status.ready_for_pickup': 'Siap Diambil',
    'status.completed': 'Selesai',
    'status.cancelled': 'Dibatalkan',
    'status.pending': 'Menunggu',
    'status.paid': 'Dibayar',
    'status.failed': 'Gagal',
    'status.expired': 'Kadaluarsa',
    'status.refunded': 'Dikembalikan',

    // Tracking Timeline
    'tracking.orderCreated': 'Pesanan Dibuat',
    'tracking.paymentReceived': 'Pembayaran Diterima',
    'tracking.processing': 'Sedang Diproses',
    'tracking.shipped': 'Dikirim',
    'tracking.readyForPickup': 'Siap Diambil',
    'tracking.delivered': 'Tiba di Tujuan',
    'tracking.completed': 'Pesanan Selesai',

    // Address Form
    'address.label': 'Label Alamat',
    'address.recipientName': 'Nama Penerima',
    'address.phone': 'No. Telepon',
    'address.addressLine': 'Alamat Lengkap',
    'address.city': 'Kota',
    'address.province': 'Provinsi',
    'address.postalCode': 'Kode Pos',
    'address.setDefault': 'Jadikan alamat utama',
    'address.save': 'Simpan Alamat',

    // Admin
    'admin.dashboard': 'Dasbor Admin',
    'admin.manageOperations': 'Kelola operasi toko buku Anda',
    'admin.addBook': 'Tambah Buku',
    'admin.totalBooks': 'Total Buku',
    'admin.totalUsers': 'Total Pengguna',
    'admin.transactions': 'Transaksi',
    'admin.revenue': 'Pendapatan',
    'admin.quickActions': 'Aksi Cepat',
    'admin.manageUsers': 'Kelola Pengguna',
    'admin.manageStores': 'Kelola Toko',
    'admin.manageOrders': 'Kelola Pesanan',
    'admin.viewReports': 'Lihat Laporan',
    'admin.stockLogs': 'Log Stok',
    'admin.lowStockBooks': 'Buku Stok Rendah',
    'admin.lowStockSubtitle': 'Buku yang memerlukan restok segera',
    'admin.browseAllBooks': 'Lihat Semua Buku',
    'admin.noLowStockBooks': 'Semua buku memiliki stok yang cukup',
    'admin.loadingDashboard': 'Memuat dasbor...',
    'admin.revenueChart': 'Grafik Pendapatan',
    'admin.recentOrders': 'Pesanan Terbaru',

    // Store Management
    'store.management': 'Kelola Toko',
    'store.addStore': 'Tambah Toko',
    'store.editStore': 'Edit Toko',
    'store.name': 'Nama Toko',
    'store.address': 'Alamat',
    'store.city': 'Kota',
    'store.province': 'Provinsi',
    'store.phone': 'Telepon',
    'store.hours': 'Jam Operasional',
    'store.active': 'Aktif',
    'store.inactive': 'Nonaktif',

    // Common
    'common.loading': 'Memuat...',
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.edit': 'Edit',
    'common.search': 'Cari...',
    'common.filter': 'Filter',
    'common.sort': 'Urutkan',
    'common.actions': 'Aksi',
    'common.back': 'Kembali',
    'common.next': 'Selanjutnya',
    'common.confirm': 'Konfirmasi',
    'common.success': 'Berhasil',
    'common.error': 'Terjadi kesalahan',
    'common.noData': 'Tidak ada data',
    'common.viewAll': 'Lihat Semua',
  },

  en: {
    // Header
    'header.dashboard': 'Dashboard',
    'header.signOut': 'Sign Out',
    'header.signIn': 'Sign In',
    'header.signUp': 'Sign Up',
    'header.cart': 'Cart',
    'header.wishlist': 'Wishlist',
    'header.orders': 'Orders',
    'header.settings': 'Settings',
    'header.admin': 'Admin',
    'header.users': 'Users',
    'header.stores': 'Stores',
    'header.orderManagement': 'Order Management',

    // HomePage
    'home.welcome': 'Welcome to SiPustaka',
    'home.welcomeUser': 'Welcome, {name}!',
    'home.subtitle': 'Explore the most complete book collection with an easy, safe, and comfortable shopping experience. Find your favorite book today.',
    'home.getStarted': 'Start Shopping',
    'home.signIn': 'Sign In',
    'home.newArrivals': 'New Arrivals',
    'home.newArrivalsSubtitle': 'Discover the latest books added to our collection',
    'home.loadingNewArrivals': 'Loading new arrivals...',
    'home.noBooksAvailable': 'No books available yet',
    'home.checkBackLater': 'Check back later for new arrivals',
    'home.accessDashboard': 'Access Your Dashboard',
    'home.chooseRole': 'Choose your role to access the appropriate features',
    'home.admin': 'Admin',
    'home.adminDesc': 'Full system access — manage books, users, transactions, and view comprehensive reports.',
    'home.adminLogin': 'Admin Login',
    'home.cashier': 'Cashier',
    'home.cashierDesc': 'Process transactions, manage stock, and assist customers with their purchases.',
    'home.cashierLogin': 'Cashier Login',
    'home.customer': 'Customer',
    'home.customerDesc': 'Browse books, add to cart, make purchases, and track your orders.',
    'home.customerLogin': 'Customer Login',
    'home.powerfulFeatures': 'Powerful Features',
    'home.featuresSubtitle': 'Everything you need for the best book shopping experience',
    'home.bookManagement': 'Book Management',
    'home.bookManagementDesc': 'Complete catalog with advanced search and filtering.',
    'home.shoppingCart': 'Shopping Cart',
    'home.shoppingCartDesc': 'Real-time cart management with automatic stock updates.',
    'home.userManagement': 'User Management',
    'home.userManagementDesc': 'Role-based access control with secure authentication.',
    'home.ourStores': 'Our Stores',
    'home.ourStoresSubtitle': 'Visit our stores across Jabodetabek',

    // Auth
    'auth.login': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.loginTitle': 'Sign In to Your Account',
    'auth.loginSubtitle': 'Welcome back! Enter your details.',
    'auth.signupTitle': 'Create New Account',
    'auth.signupSubtitle': 'Start your reading journey with SiPustaka.',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.loginSuccess': 'Signed in successfully!',
    'auth.signupSuccess': 'Account created successfully!',
    'auth.signOutSuccess': 'Signed out successfully!',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.passwordMin': 'Minimum 6 characters',
    'auth.loggingIn': 'Signing in...',
    'auth.signingUp': 'Signing up...',

    // Customer Dashboard
    'customer.browseBooks': 'Browse Books',
    'customer.discoverBooks': 'Discover your next favorite read',
    'customer.viewCart': 'View Cart',
    'customer.searchBooks': 'Search by title, author, or category...',
    'customer.allCategories': 'All Categories',
    'customer.sortByTitle': 'Title A-Z',
    'customer.sortByAuthor': 'Author A-Z',
    'customer.priceLowToHigh': 'Price: Low to High',
    'customer.priceHighToLow': 'Price: High to Low',
    'customer.newestFirst': 'Newest First',
    'customer.booksFound': '{count} books found',
    'customer.noBooksFound': 'No books found',
    'customer.adjustFilters': 'Try adjusting your search or filters',
    'customer.loadingBooks': 'Loading books...',

    // Cart
    'cart.backToBooks': 'Back to Books',
    'cart.shoppingCart': 'Shopping Cart',
    'cart.itemsInCart': '{count} items in cart',
    'cart.loadingCart': 'Loading cart...',
    'cart.cartEmpty': 'Your cart is empty',
    'cart.startShopping': 'Start shopping to add items to your cart',
    'cart.browseBooks': 'Browse Books',
    'cart.remove': 'Remove',
    'cart.orderSummary': 'Order Summary',
    'cart.subtotal': 'Subtotal',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'cart.addedToCart': 'Added to cart',
    'cart.removedFromCart': 'Removed from cart',
    'cart.stockExceeded': 'Insufficient stock',

    // Wishlist
    'wishlist.title': 'My Wishlist',
    'wishlist.empty': 'Your wishlist is empty',
    'wishlist.startBrowsing': 'Start browsing to add books to your wishlist',
    'wishlist.itemsInWishlist': '{count} items in wishlist',
    'wishlist.loadingWishlist': 'Loading wishlist...',
    'wishlist.addedToWishlist': 'Added to wishlist',
    'wishlist.removedFromWishlist': 'Removed from wishlist',
    'wishlist.moveToCart': 'Move to Cart',

    // Book
    'book.addToCart': 'Add to Cart',
    'book.buyNow': 'Buy Now',
    'book.viewDetails': 'View Details',
    'book.edit': 'Edit Book',
    'book.delete': 'Delete Book',
    'book.updateStock': 'Update Stock',
    'book.addToWishlist': 'Add to Wishlist',
    'book.removeFromWishlist': 'Remove from Wishlist',
    'book.left': 'left',
    'book.outOfStock': 'Out of Stock',
    'book.inStock': 'In Stock',
    'book.lowStock': 'Low Stock',
    'book.weight': 'Weight',

    // Book Detail
    'bookDetail.title': 'Book Details',
    'bookDetail.category': 'Category',
    'bookDetail.year': 'Year',
    'bookDetail.price': 'Price',
    'bookDetail.stock': 'Stock',
    'bookDetail.available': 'available',
    'bookDetail.description': 'Description',
    'bookDetail.noDescription': 'No description available.',
    'bookDetail.noCover': 'No Cover Available',
    'bookDetail.close': 'Close',

    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shipping': 'Shipping',
    'checkout.payment': 'Payment',
    'checkout.confirmation': 'Confirmation',
    'checkout.deliverTo': 'Deliver to Address',
    'checkout.pickupAt': 'Pick Up at Store',
    'checkout.selectAddress': 'Select Address',
    'checkout.addAddress': 'Add New Address',
    'checkout.selectStore': 'Select Store',
    'checkout.selectCourier': 'Select Courier',
    'checkout.shippingCost': 'Shipping Cost',
    'checkout.totalPayment': 'Total Payment',
    'checkout.payNow': 'Pay Now',
    'checkout.processing': 'Processing...',
    'checkout.next': 'Next',
    'checkout.back': 'Back',
    'checkout.estimatedDelivery': 'Estimated delivery',
    'checkout.days': 'days',
    'checkout.free': 'Free',

    // Order
    'order.title': 'My Orders',
    'order.orderNumber': 'Order No.',
    'order.orderDate': 'Order Date',
    'order.orderDetail': 'Order Detail',
    'order.trackOrder': 'Track Order',
    'order.cancelOrder': 'Cancel Order',
    'order.noOrders': 'No orders yet',
    'order.startShopping': 'Start shopping to create your first order',
    'order.items': '{count} items',
    'order.paymentMethod': 'Payment Method',
    'order.shippingInfo': 'Shipping Info',
    'order.trackingNumber': 'Tracking Number',

    // Order Status
    'status.pending_payment': 'Pending Payment',
    'status.processing': 'Processing',
    'status.shipped': 'Shipped',
    'status.ready_for_pickup': 'Ready for Pickup',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
    'status.pending': 'Pending',
    'status.paid': 'Paid',
    'status.failed': 'Failed',
    'status.expired': 'Expired',
    'status.refunded': 'Refunded',

    // Tracking
    'tracking.orderCreated': 'Order Created',
    'tracking.paymentReceived': 'Payment Received',
    'tracking.processing': 'Processing',
    'tracking.shipped': 'Shipped',
    'tracking.readyForPickup': 'Ready for Pickup',
    'tracking.delivered': 'Delivered',
    'tracking.completed': 'Order Completed',

    // Address Form
    'address.label': 'Address Label',
    'address.recipientName': 'Recipient Name',
    'address.phone': 'Phone Number',
    'address.addressLine': 'Full Address',
    'address.city': 'City',
    'address.province': 'Province',
    'address.postalCode': 'Postal Code',
    'address.setDefault': 'Set as default address',
    'address.save': 'Save Address',

    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.manageOperations': 'Manage your bookstore operations',
    'admin.addBook': 'Add Book',
    'admin.totalBooks': 'Total Books',
    'admin.totalUsers': 'Total Users',
    'admin.transactions': 'Transactions',
    'admin.revenue': 'Revenue',
    'admin.quickActions': 'Quick Actions',
    'admin.manageUsers': 'Manage Users',
    'admin.manageStores': 'Manage Stores',
    'admin.manageOrders': 'Manage Orders',
    'admin.viewReports': 'View Reports',
    'admin.stockLogs': 'Stock Logs',
    'admin.lowStockBooks': 'Low Stock Books',
    'admin.lowStockSubtitle': 'Books that need immediate restocking',
    'admin.browseAllBooks': 'Browse All Books',
    'admin.noLowStockBooks': 'All books have sufficient stock',
    'admin.loadingDashboard': 'Loading dashboard...',
    'admin.revenueChart': 'Revenue Chart',
    'admin.recentOrders': 'Recent Orders',

    // Store Management
    'store.management': 'Store Management',
    'store.addStore': 'Add Store',
    'store.editStore': 'Edit Store',
    'store.name': 'Store Name',
    'store.address': 'Address',
    'store.city': 'City',
    'store.province': 'Province',
    'store.phone': 'Phone',
    'store.hours': 'Operating Hours',
    'store.active': 'Active',
    'store.inactive': 'Inactive',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.actions': 'Actions',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.confirm': 'Confirm',
    'common.success': 'Success',
    'common.error': 'An error occurred',
    'common.noData': 'No data',
    'common.viewAll': 'View All',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'id'>(() => {
    const saved = localStorage.getItem('sipustaka-lang');
    return (saved === 'en' || saved === 'id') ? saved : 'id'; // Default: Bahasa Indonesia
  });

  useEffect(() => {
    localStorage.setItem('sipustaka-lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: 'en' | 'id') => {
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, string>) => {
    let translation = translations[language]?.[key] || translations['id']?.[key] || key;

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
