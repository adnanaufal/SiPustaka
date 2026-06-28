import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';
import { Badge } from '../../components/Common/Badge';
import { useCart } from '../../hooks/useCart';
import { useCheckout, CheckoutStep } from '../../hooks/useCheckout';
import { useStoreLocations } from '../../hooks/useStoreLocations';
import { useShipping } from '../../hooks/useShipping';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency, formatWeight } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Store, Truck, CreditCard, Check, AlertCircle, ArrowLeft, ArrowRight, User, Phone, Home } from 'lucide-react';
import toast from 'react-hot-toast';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { cartItems, cartTotal, totalWeight, clearCart, updateQuantity } = useCart();
  const { storeLocations, loading: loadingStores } = useStoreLocations();

  const {
    checkoutState,
    addresses,
    loadingAddresses,
    loadingShipping,
    creatingOrder,
    updateCheckout,
    fetchAddresses,
    addAddress,
    checkShippingCost,
    createOrder,
    initiatePayment,
  } = useCheckout();

  const { cities, loadingCities, availableCouriers, getCities } = useShipping();

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Rumah');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (citySearch.length >= 3) {
      getCities(citySearch);
    }
  }, [citySearch, getCities]);

  // Set default address when loaded
  useEffect(() => {
    if (addresses.length > 0 && !checkoutState.selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      updateCheckout({ selectedAddressId: defaultAddr.id });
    }
  }, [addresses, checkoutState.selectedAddressId]);

  // Re-calculate shipping cost when address, courier, or weight changes
  useEffect(() => {
    if (
      checkoutState.deliveryMethod === 'shipping' &&
      checkoutState.selectedAddressId &&
      checkoutState.courierCode
    ) {
      const addr = addresses.find((a) => a.id === checkoutState.selectedAddressId);
      if (addr?.city_id) {
        // Jakarta Pusat (Cempaka Putih Barat - subdistrict ID 17596) as store central origin warehouse
        checkShippingCost(17596, addr.city_id, totalWeight, checkoutState.courierCode);
      }
    }
  }, [
    checkoutState.deliveryMethod,
    checkoutState.selectedAddressId,
    checkoutState.courierCode,
    totalWeight,
    addresses,
  ]);

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <EmptyState
            title="Keranjang Belanja Kosong"
            description="Tambahkan buku terlebih dahulu sebelum melakukan checkout."
            action={<Link to="/customer" className="btn-primary">{t('cart.browseBooks')}</Link>}
          />
        </div>
      </Layout>
    );
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let cityId = selectedCityId;
    let cityObj = null;

    if (!cityId && citySearch.trim()) {
      const searchLower = citySearch.toLowerCase();
      cityObj = cities.find(
        (c) =>
          c.city_name.toLowerCase() === searchLower ||
          `${c.type.toLowerCase()} ${c.city_name.toLowerCase()}`.toLowerCase() === searchLower ||
          searchLower.includes(c.city_name.toLowerCase())
      );
      if (cityObj) {
        cityId = Number(cityObj.city_id);
      }
    } else {
      cityObj = cities.find((c) => Number(c.city_id) === cityId);
    }

    if (!cityId || !cityObj) {
      toast.error('Silakan ketik nama kota dan klik pilihan dari dropdown pencarian');
      return;
    }


    try {
      await addAddress({
        label: addressLabel,
        recipient_name: recipientName,
        phone,
        address_line: addressLine,
        city: cityObj.city_name,
        city_id: cityId,
        province: cityObj.province,
        postal_code: postalCode,
        is_default: addresses.length === 0,
      });

      toast.success('Alamat berhasil disimpan');
      setShowAddressForm(false);
      // Reset form
      setAddressLabel('Rumah');
      setRecipientName('');
      setPhone('');
      setAddressLine('');
      setCitySearch('');
      setSelectedCityId(null);
      setPostalCode('');
    } catch {
      toast.error('Gagal menambahkan alamat');
    }
  };

  const handleNextStep = () => {
    if (checkoutState.step === 'shipping') {
      if (checkoutState.deliveryMethod === 'shipping') {
        if (!checkoutState.selectedAddressId) {
          toast.error('Pilih alamat pengiriman terlebih dahulu');
          return;
        }
        if (!checkoutState.courierCode || !checkoutState.courierService) {
          toast.error('Pilih kurir dan jenis layanan pengiriman');
          return;
        }
      } else {
        if (!checkoutState.selectedStoreId) {
          toast.error('Pilih toko fisik lokasi pengambilan');
          return;
        }
      }
      updateCheckout({ step: 'payment' });
    }
  };

  const handlePay = async () => {
    const items = cartItems.map((item) => ({
      book_id: item.book_id,
      quantity: item.quantity,
      price: item.book?.price || 0,
    }));

    const order = await createOrder(items, cartTotal);
    if (!order) return;

    // Get user profile details
    const customerName = addresses.find((a) => a.id === checkoutState.selectedAddressId)?.recipient_name || 'Pelanggan';
    const customerPhone = addresses.find((a) => a.id === checkoutState.selectedAddressId)?.phone || '';

    const payload = {
      order_number: order.order_number,
      total_amount: order.total_amount,
      customer_name: customerName,
      customer_email: user?.email || 'customer@sipustaka.com',
      items: [
        ...cartItems.map((item) => ({
          name: (item.book?.title || 'Buku').substring(0, 50),
          price: item.book?.price || 0,
          quantity: item.quantity,
        })),
        ...(checkoutState.shippingCost > 0 ? [{
          name: `Ongkir ${checkoutState.courierCode.toUpperCase()} (${checkoutState.courierService})`,
          price: checkoutState.shippingCost,
          quantity: 1,
        }] : [])
      ],
    };

    const snapToken = await initiatePayment(order.id, payload);
    if (!snapToken) return;

    // Open Midtrans Snap UI popup
    if (window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          toast.success('Pembayaran sukses!');
          clearCart();
          navigate(`/customer/orders/${order.id}`);
        },
        onPending: (result) => {
          toast.success('Menunggu pembayaran.');
          clearCart();
          navigate(`/customer/orders/${order.id}`);
        },
        onError: (err) => {
          toast.error('Pembayaran gagal.');
        },
        onClose: () => {
          toast.error('Pembayaran dibatalkan.');
        },
      });
    } else {
      toast.error('Midtrans payment gateway tidak ter-load');
    }
  };

  const currentAddress = addresses.find((a) => a.id === checkoutState.selectedAddressId);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100 mb-8">
          {t('checkout.title')}
        </h1>

        {/* Stepper progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 font-medium ${checkoutState.step === 'shipping' ? 'text-primary-700' : 'text-primary-400'}`}>
            <span className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-bold">1</span>
            {t('checkout.shipping')}
          </div>
          <div className="w-16 h-0.5 bg-primary-200" />
          <div className={`flex items-center gap-2 font-medium ${checkoutState.step === 'payment' ? 'text-primary-700' : 'text-primary-400'}`}>
            <span className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-bold">2</span>
            {t('checkout.payment')}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content pane */}
          <div className="lg:col-span-2 space-y-6">
            {checkoutState.step === 'shipping' ? (
              <div className="space-y-6 animate-fade-in">
                {/* Method selector */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => updateCheckout({ deliveryMethod: 'shipping', shippingCost: 0, courierCode: '', courierService: '' })}
                    className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      checkoutState.deliveryMethod === 'shipping'
                        ? 'border-primary-600 bg-primary-50/50'
                        : 'border-primary-200 hover:border-primary-300'
                    }`}
                  >
                    <Truck className="h-6 w-6 text-primary-600" />
                    <span className="font-semibold text-primary-800">{t('checkout.deliverTo')}</span>
                  </button>
                  <button
                    onClick={() => updateCheckout({ deliveryMethod: 'pickup', shippingCost: 0, selectedStoreId: storeLocations[0]?.id || null })}
                    className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      checkoutState.deliveryMethod === 'pickup'
                        ? 'border-primary-600 bg-primary-50/50'
                        : 'border-primary-200 hover:border-primary-300'
                    }`}
                  >
                    <Store className="h-6 w-6 text-primary-600" />
                    <span className="font-semibold text-primary-800">{t('checkout.pickupAt')}</span>
                  </button>
                </div>

                {/* Shipping flow */}
                {checkoutState.deliveryMethod === 'shipping' && (
                  <div className="space-y-6">
                    {/* Alamat list */}
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-primary-800 dark:text-primary-200">{t('checkout.selectAddress')}</h3>
                        <button
                          onClick={() => setShowAddressForm(!showAddressForm)}
                          className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                        >
                          {showAddressForm ? t('common.cancel') : t('checkout.addAddress')}
                        </button>
                      </div>

                      {showAddressForm ? (
                        <form onSubmit={handleSaveAddress} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-primary-500 mb-1">{t('address.label')}</label>
                              <input
                                type="text"
                                value={addressLabel}
                                onChange={(e) => setAddressLabel(e.target.value)}
                                className="input-field !py-2 !px-3"
                                placeholder="Rumah / Kantor"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-primary-500 mb-1">{t('address.recipientName')}</label>
                              <input
                                type="text"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                className="input-field !py-2 !px-3"
                                placeholder="Nama lengkap"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-primary-500 mb-1">{t('address.phone')}</label>
                              <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="input-field !py-2 !px-3"
                                placeholder="Nomor HP"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-primary-500 mb-1">{t('address.postalCode')}</label>
                              <input
                                type="text"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className="input-field !py-2 !px-3"
                                placeholder="Kode pos"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-primary-500 mb-1">{t('address.addressLine')}</label>
                            <textarea
                              value={addressLine}
                              onChange={(e) => setAddressLine(e.target.value)}
                              className="input-field !py-2 !px-3 h-20"
                              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                              required
                            />
                          </div>

                          {/* City lookup */}
                          <div className="relative">
                            <label className="block text-xs font-semibold text-primary-500 mb-1">{t('address.city')} / Kabupaten</label>
                            <input
                              type="text"
                              value={citySearch}
                              onChange={(e) => {
                                setCitySearch(e.target.value);
                                setShowCityDropdown(true);
                              }}
                              className="input-field !py-2 !px-3"
                              placeholder="Ketik minimal 3 huruf untuk cari kota..."
                              required
                            />
                            {loadingCities && <div className="absolute right-3 top-9"><LoadingSpinner size="sm" /></div>}

                            {showCityDropdown && cities.length > 0 && (
                              <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-primary-200 rounded-xl shadow-medium z-50 divide-y divide-primary-50">
                                {cities.map((city) => (
                                  <button
                                    key={city.city_id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCityId(Number(city.city_id));
                                      setCitySearch(`${city.type} ${city.city_name}, ${city.province}`);
                                      setShowCityDropdown(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50"
                                  >
                                    {city.type} {city.city_name}, {city.province}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button type="submit" className="btn-primary w-full !py-2">{t('address.save')}</button>
                        </form>
                      ) : loadingAddresses ? (
                        <LoadingSpinner />
                      ) : addresses.length === 0 ? (
                        <div className="p-4 text-center text-primary-500">Belum ada alamat tersimpan</div>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map((addr) => (
                            <label
                              key={addr.id}
                              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                checkoutState.selectedAddressId === addr.id
                                  ? 'border-primary-600 bg-primary-50/20'
                                  : 'border-primary-100 hover:border-primary-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name="address"
                                checked={checkoutState.selectedAddressId === addr.id}
                                onChange={() => updateCheckout({ selectedAddressId: addr.id })}
                                className="mt-1 accent-primary-600"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-primary-800">{addr.recipient_name}</span>
                                  <Badge variant="neutral">{addr.label}</Badge>
                                </div>
                                <p className="text-sm text-primary-500 mt-1">{addr.phone}</p>
                                <p className="text-sm text-primary-600 mt-1">
                                  {addr.address_line}, {addr.city}, {addr.province} {addr.postal_code}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Kurir selection */}
                    {checkoutState.selectedAddressId && (
                      <div className="glass-card p-6">
                        <h3 className="font-bold text-primary-800 dark:text-primary-200 mb-4">{t('checkout.selectCourier')}</h3>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {availableCouriers.map((c) => (
                            <button
                              key={c.code}
                              onClick={() => updateCheckout({ courierCode: c.code, courierService: '', shippingCost: 0, shippingOptions: [] })}
                              className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                                checkoutState.courierCode === c.code
                                  ? 'border-primary-600 bg-primary-50/50 text-primary-800'
                                  : 'border-primary-100 text-primary-600 hover:border-primary-200'
                              }`}
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>

                        {loadingShipping ? (
                          <LoadingSpinner text="Mengecek ongkos kirim..." />
                        ) : checkoutState.shippingOptions.length > 0 ? (
                          <div className="space-y-2">
                            {checkoutState.shippingOptions.map((opt) => (
                              <label
                                key={opt.service}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                  checkoutState.courierService === opt.service
                                    ? 'border-primary-600 bg-primary-50/20'
                                    : 'border-primary-100 hover:border-primary-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="service"
                                    checked={checkoutState.courierService === opt.service}
                                    onChange={() => updateCheckout({ courierService: opt.service, shippingCost: opt.cost })}
                                    className="accent-primary-600"
                                  />
                                  <div>
                                    <span className="font-semibold text-primary-800">{opt.service}</span>
                                    <span className="text-xs text-primary-400 block">{opt.description}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-primary-700">{formatCurrency(opt.cost)}</span>
                                  <span className="text-xs text-primary-400 block">Estimasi {opt.etd} hari</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        ) : checkoutState.courierCode && (
                          <p className="text-sm text-primary-400 text-center">Gagal memuat ongkos kirim, coba kurir lain</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Pickup flow */}
                {checkoutState.deliveryMethod === 'pickup' && (
                  <div className="glass-card p-6">
                    <h3 className="font-bold text-primary-800 dark:text-primary-200 mb-4">{t('checkout.selectStore')}</h3>
                    {loadingStores ? (
                      <LoadingSpinner />
                    ) : (
                      <div className="space-y-3">
                        {storeLocations.map((store) => (
                          <label
                            key={store.id}
                            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              checkoutState.selectedStoreId === store.id
                                ? 'border-primary-600 bg-primary-50/20'
                                : 'border-primary-100 hover:border-primary-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="store"
                              checked={checkoutState.selectedStoreId === store.id}
                              onChange={() => updateCheckout({ selectedStoreId: store.id })}
                              className="mt-1 accent-primary-600"
                            />
                            <div>
                              <span className="font-semibold text-primary-800">{store.name}</span>
                              <p className="text-sm text-primary-600 mt-1">{store.address}, {store.city}</p>
                              <p className="text-xs text-primary-400 mt-1">{store.operating_hours}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // STEP 2: PAYMENT OVERVIEW
              <div className="glass-card p-6 space-y-6 animate-fade-in">
                <h3 className="font-serif font-bold text-xl text-primary-800 dark:text-primary-100">
                  {t('checkout.payment')}
                </h3>

                {/* Delivery info summary */}
                <div className="bg-surface-100 dark:bg-primary-800/40 p-4 rounded-xl space-y-3 text-sm text-primary-700 dark:text-primary-300">
                  <div className="flex justify-between">
                    <span className="font-semibold">Metode Pengambilan</span>
                    <span className="font-bold capitalize">{checkoutState.deliveryMethod === 'pickup' ? 'Ambil di Toko' : 'Kirim Kurir'}</span>
                  </div>

                  {checkoutState.deliveryMethod === 'pickup' ? (
                    <div>
                      <span className="font-semibold block">Toko Lokasi</span>
                      <span>{storeLocations.find((s) => s.id === checkoutState.selectedStoreId)?.name}</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="font-semibold block">Tujuan Alamat</span>
                        <span>{currentAddress?.recipient_name} ({currentAddress?.label})</span>
                        <p className="text-xs text-primary-500 mt-0.5">
                          {currentAddress?.address_line}, {currentAddress?.city}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Kurir Pilihan</span>
                        <span className="font-bold uppercase">{checkoutState.courierCode} - {checkoutState.courierService}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-accent-50 text-accent-700 rounded-xl">
                  <CreditCard className="h-5 w-5" />
                  <p className="text-sm">Pembayaran menggunakan Gateway Pembayaran Digital Midtrans secara aman.</p>
                </div>
              </div>
            )}
          </div>

          {/* Checkout sidebar summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24 space-y-6">
              <h2 className="text-lg font-serif font-bold text-primary-800 dark:text-primary-100">
                {t('cart.orderSummary')}
              </h2>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-1 border-b border-primary-100 dark:border-primary-800 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-primary-800 dark:text-primary-100 text-sm font-medium line-clamp-1 flex-1">
                        {item.book?.title}
                      </span>
                      <span className="text-primary-700 dark:text-secondary-400 font-bold text-sm whitespace-nowrap">
                        {formatCurrency((item.book?.price || 0) * item.quantity)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-primary-400">
                        {formatCurrency(item.book?.price || 0)} / buku
                      </span>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-primary-200 dark:border-primary-700 rounded-lg overflow-hidden bg-surface-50 dark:bg-primary-800">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-700 text-xs font-bold transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono text-xs font-bold text-primary-800 dark:text-primary-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (item.book && item.quantity >= item.book.stock) {
                              toast.error(t('cart.stockExceeded'));
                              return;
                            }
                            updateQuantity(item.id, item.quantity + 1);
                          }}
                          className="px-2 py-0.5 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-700 text-xs font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-primary-200 dark:border-primary-700 pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-500">{t('cart.subtotal')}</span>
                  <span className="text-primary-800 dark:text-primary-200">{formatCurrency(cartTotal)}</span>
                </div>
                {checkoutState.deliveryMethod === 'shipping' && (
                  <div className="flex justify-between">
                    <span className="text-primary-500">{t('checkout.shippingCost')}</span>
                    <span className="text-primary-800 dark:text-primary-200">
                      {checkoutState.shippingCost > 0 ? formatCurrency(checkoutState.shippingCost) : 'Gratis'}
                    </span>
                  </div>
                )}
                {checkoutState.deliveryMethod === 'shipping' && (
                  <div className="flex justify-between text-xs text-primary-400">
                    <span>Total Berat Buku</span>
                    <span>{formatWeight(totalWeight)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-primary-200 dark:border-primary-700">
                  <span>{t('cart.total')}</span>
                  <span className="text-primary-700 dark:text-secondary-400">
                    {formatCurrency(cartTotal + checkoutState.shippingCost)}
                  </span>
                </div>
              </div>

              {checkoutState.step === 'shipping' ? (
                <button
                  onClick={handleNextStep}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  {t('checkout.next')} <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateCheckout({ step: 'shipping' })}
                    className="flex-1 btn-outline !py-2.5 !px-3"
                  >
                    <ArrowLeft className="h-4 w-4 inline mr-1" />
                  </button>
                  <button
                    onClick={handlePay}
                    disabled={creatingOrder}
                    className="flex-[3] btn-secondary flex items-center justify-center gap-2"
                  >
                    {creatingOrder ? <LoadingSpinner size="sm" /> : t('checkout.payNow')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
