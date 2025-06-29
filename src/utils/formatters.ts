/**
 * Mengubah angka menjadi format mata uang Rupiah.
 * Contoh: 150000 -> "Rp 150.000"
 * @param {number} number - Angka yang akan diformat.
 * @returns {string} String dalam format Rupiah.
 */
export const formatRupiah = (number: number | string): string => {
  const num = Number(number) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Mengambil angka dari string Rupiah yang sudah diformat.
 * Contoh: "Rp 150.000" -> 150000
 * @param {string} rupiahString - String yang akan di-parse.
 * @returns {number} Angka dari string.
 */
export const parseRupiah = (rupiahString: string): number => {
  // Menghapus semua karakter kecuali digit
  const digitsOnly = rupiahString.replace(/[^0-9]/g, '');
  return parseInt(digitsOnly, 10) || 0;
};