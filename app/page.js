'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computeHomeStats, filterGuides, filterProducts, sortProducts } from '@/lib/data';
import {
  createGuide,
  createOrder,
  createProduct,
  deleteGuide as deleteGuideApi,
  deleteOrder as deleteOrderApi,
  deleteProduct as deleteProductApi,
  getWaNumber,
  listGuides,
  listOrders,
  listProducts,
  listUsers,
  resetDemo as resetDemoData,
  saveProfileWa,
  saveWaNumber,
  updateGuide,
  updateProduct,
} from '@/lib/api';
import CatalogView from '@/components/CatalogView';
import DashboardView from '@/components/DashboardView';
import EducationView from '@/components/EducationView';
import Footer from '@/components/Footer';
import GuideModal from '@/components/GuideModal';
import AuthModal from '@/components/AuthModal';
import LandingView from '@/components/LandingView';
import OrderModal from '@/components/OrderModal';
import ProductModal from '@/components/ProductModal';
import ReadModal from '@/components/ReadModal';
import Topbar from '@/components/Topbar';

export default function Page() {
  const [view, setView] = useState('landing');
  const [products, setProducts] = useState([]);
  const [guides, setGuides] = useState([]);
  const [waNumber, setWaNumber] = useState('');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  // Autentikasi
  const [user, setUser] = useState(null);
  const [loginPrompt, setLoginPrompt] = useState(null);
  const pendingAction = useRef(null);

  // Katalog
  const [kategori, setKategori] = useState('Semua');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');

  // Edukasi
  const [guideKategori, setGuideKategori] = useState('Semua');
  const [gSearch, setGSearch] = useState('');
  const [gLevel, setGLevel] = useState('Semua');

  // Modal & toast
  const [productModal, setProductModal] = useState(null);
  const [guideModal, setGuideModal] = useState(null);
  const [orderModal, setOrderModal] = useState(null);
  const [readId, setReadId] = useState(null);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  // Muat katalog, edukasi, dan pengaturan dari server.
  useEffect(() => {
    let active = true;
    Promise.all([listProducts(), listGuides(), getWaNumber()])
      .then(([nextProducts, nextGuides, nextWa]) => {
        if (!active) return;
        setProducts(nextProducts);
        setGuides(nextGuides);
        setWaNumber(nextWa);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Muat sesi aktif dari server (cookie httpOnly).
  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((data) => {
        if (active) setUser(data.user ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Muat data pendukung sesuai peran: daftar penjual untuk admin, pesanan untuk pembeli.
  useEffect(() => {
    let active = true;
    if (user?.role === 'admin') {
      listUsers()
        .then((data) => {
          if (active) setUsers(data);
        })
        .catch(() => {});
    } else {
      setUsers([]);
    }
    if (user?.role === 'buyer') {
      listOrders()
        .then((data) => {
          if (active) setOrders(data);
        })
        .catch(() => {});
    } else {
      setOrders([]);
    }
    return () => {
      active = false;
    };
  }, [user]);

  const notify = useCallback((message) => {
    setToast(message);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2600);
  }, []);

  /* ---- Autentikasi ---- */

  const openLogin = useCallback((reason, action) => {
    pendingAction.current = action ?? null;
    setLoginPrompt({ reason });
  }, []);

  const closeLogin = useCallback(() => {
    pendingAction.current = null;
    setLoginPrompt(null);
  }, []);

  const handleLogin = useCallback(
    (nextUser) => {
      setUser(nextUser);
      setLoginPrompt(null);
      notify(`Selamat datang, ${nextUser.nama}.`);
      const action = pendingAction.current;
      pendingAction.current = null;
      action?.();
    },
    [notify],
  );

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* abaikan kegagalan jaringan; sesi lokal tetap dibersihkan */
    }
    setUser(null);
    setView((current) => (current === 'dashboard' ? 'catalog' : current));
    notify('Anda telah keluar.');
  }, [notify]);

  const navigate = useCallback(
    (nextView) => {
      if (nextView === 'dashboard' && !user) {
        openLogin('Masuk untuk membuka dashboard Anda.', () => {
          setView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        return;
      }
      setView(nextView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [user, openLogin],
  );

  const openOrder = useCallback(
    (product) => {
      const buka = () => setOrderModal({ product: product ?? null });
      if (!user) {
        openLogin('Masuk sebagai pembeli untuk membuat pesanan.', buka);
        return;
      }
      if (user.role !== 'buyer') {
        notify('Hanya akun pembeli yang dapat membuat pesanan.');
        return;
      }
      buka();
    },
    [user, openLogin, notify],
  );

  const openGuide = useCallback(
    (id) => {
      if (!user) {
        openLogin('Masuk untuk membaca isi panduan edukasi.', () => setReadId(id));
        return;
      }
      setReadId(id);
    },
    [user, openLogin],
  );

  const scrollToCatalog = () => document.getElementById('produk')?.scrollIntoView({ behavior: 'smooth' });

  const quickFilter = (value) => {
    setSearch('');
    setKategori(value);
    scrollToCatalog();
  };

  const pickRegion = (region) => {
    setKategori('Semua');
    setSearch(region);
    scrollToCatalog();
  };

  /** Dari landing page: buka halaman katalog pada kategori tertentu. */
  const bukaKatalog = useCallback((kategoriNilai) => {
    setKategori(kategoriNilai ?? 'Semua');
    setSearch('');
    setView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* ---- Produk ---- */

  const saveProduct = async (values) => {
    const editing = productModal?.product;
    try {
      if (editing) {
        await updateProduct(editing.id, values);
      } else {
        await createProduct(values);
      }
      setProducts(await listProducts());
      setProductModal(null);
      notify(editing ? 'Produk diperbarui.' : 'Produk ditambahkan.');
    } catch (error) {
      notify(error.message);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Hapus produk "${product.nama}"?`)) return;
    try {
      await deleteProductApi(product.id);
      setProducts(await listProducts());
      notify('Produk berhasil dihapus.');
    } catch (error) {
      notify(error.message);
    }
  };

  /* ---- Pesanan pembeli ---- */

  const saveOrder = async (values) => {
    try {
      await createOrder(values);
      setOrders(await listOrders());
      setOrderModal(null);
      notify('Pesanan tersimpan. Hubungi penjual lewat tab Pesanan saya.');
    } catch (error) {
      notify(error.message);
    }
  };

  const removeOrder = async (order) => {
    const namaProduk = order.product?.nama ?? 'ini';
    if (!window.confirm(`Batalkan pesanan "${namaProduk}"?`)) return;
    try {
      await deleteOrderApi(order.id);
      setOrders(await listOrders());
      notify('Pesanan dibatalkan.');
    } catch (error) {
      notify(error.message);
    }
  };

  /* ---- Edukasi ---- */

  const saveGuide = async (values) => {
    const editing = guideModal?.guide;
    try {
      if (editing) {
        await updateGuide(editing.id, values);
      } else {
        await createGuide(values);
      }
      setGuides(await listGuides());
      setGuideModal(null);
      notify(editing ? 'Edukasi diperbarui.' : 'Edukasi ditambahkan.');
    } catch (error) {
      notify(error.message);
    }
  };

  const deleteGuide = async (guide) => {
    if (!window.confirm(`Hapus edukasi "${guide.judul}"?`)) return;
    try {
      await deleteGuideApi(guide.id);
      setGuides(await listGuides());
      notify('Edukasi berhasil dihapus.');
    } catch (error) {
      notify(error.message);
    }
  };

  /* ---- Nomor WhatsApp ---- */

  /** Nomor WhatsApp milik sendiri (admin/penjual) — dipakai pembeli saat memesan produknya. */
  const saveMyWa = async (raw) => {
    try {
      const updated = await saveProfileWa(String(raw ?? '').trim());
      if (updated) setUser((prev) => (prev ? { ...prev, waNumber: updated.waNumber ?? '' } : prev));
      notify('Nomor WhatsApp Anda tersimpan.');
      return true;
    } catch (error) {
      notify(error.message);
      return false;
    }
  };

  const saveWa = async (raw) => {
    try {
      const saved = await saveWaNumber(String(raw ?? '').trim());
      setWaNumber(saved);
      notify('Pengaturan nomor WhatsApp tersimpan.');
      return true;
    } catch (error) {
      notify(error.message);
      return false;
    }
  };

  /* ---- Reset demo ---- */

  const resetDemo = async () => {
    if (!window.confirm('Kembalikan katalog dan edukasi ke data contoh? Perubahan saat ini akan diganti.')) return;
    try {
      const data = await resetDemoData();
      setProducts(data.products);
      setGuides(data.guides);
      notify('Data demo berhasil direset.');
    } catch (error) {
      notify(error.message);
    }
  };

  /* ---- Tutup modal dengan Esc ---- */

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setProductModal(null);
      setGuideModal(null);
      setOrderModal(null);
      setReadId(null);
      closeLogin();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closeLogin]);

  const readGuide = useMemo(() => guides.find((guide) => guide.id === readId) ?? null, [guides, readId]);
  const homeStats = useMemo(() => computeHomeStats(products), [products]);
  const visibleProducts = useMemo(
    () => sortProducts(filterProducts(products, { search, kategori }), sort),
    [products, search, kategori, sort],
  );
  const visibleGuides = useMemo(
    () => filterGuides(guides, { search: gSearch, kategori: guideKategori, tingkat: gLevel }),
    [guides, gSearch, guideKategori, gLevel],
  );

  return (
    <>
      <Topbar
        view={view}
        user={user}
        onNavigate={navigate}
        onLogin={() => openLogin('Masuk ke akun AgriPedia Anda.')}
        onLogout={handleLogout}
      />

      <main className="shell">
        {view === 'landing' ? (
          <LandingView
            stats={homeStats}
            user={user}
            products={products}
            onExplore={bukaKatalog}
            onEducation={() => navigate('education')}
            onOrder={openOrder}
            onLogin={() => openLogin('Masuk ke akun AgriPedia Anda.')}
            onDashboard={() => navigate('dashboard')}
          />
        ) : null}

        {view === 'catalog' ? (
          <CatalogView
            stats={homeStats}
            regions={homeStats.regions}
            products={visibleProducts}
            search={search}
            onSearch={setSearch}
            sort={sort}
            onSort={setSort}
            kategori={kategori}
            onKategori={setKategori}
            onOrder={openOrder}
            onQuickFilter={quickFilter}
            onOpenEducation={() => navigate('education')}
            onPickRegion={pickRegion}
          />
        ) : null}

        {view === 'education' ? (
          <EducationView
            guides={visibleGuides}
            search={gSearch}
            onSearch={setGSearch}
            level={gLevel}
            onLevel={setGLevel}
            kategori={guideKategori}
            onKategori={setGuideKategori}
            onRead={openGuide}
          />
        ) : null}

        {view === 'dashboard' ? (
          <DashboardView
            user={user}
            users={users}
            orders={orders}
            products={products}
            guides={guides}
            waNumber={waNumber}
            onSaveWa={saveWa}
            onSaveMyWa={saveMyWa}
            onReset={resetDemo}
            onOrder={openOrder}
            onDeleteOrder={removeOrder}
            onAddProduct={() => setProductModal({ product: null })}
            onEditProduct={(product) => setProductModal({ product })}
            onDeleteProduct={deleteProduct}
            onAddGuide={() => setGuideModal({ guide: null })}
            onEditGuide={(guide) => setGuideModal({ guide })}
            onDeleteGuide={deleteGuide}
          />
        ) : null}
      </main>

      <Footer onNavigate={navigate} />

      {productModal ? (
        <ProductModal
          key={productModal.product?.id ?? 'new-product'}
          product={productModal.product}
          penjualOptions={users.filter((item) => item.role === 'penjual')}
          showPenjual={user?.role === 'admin'}
          onSave={saveProduct}
          onClose={() => setProductModal(null)}
          notify={notify}
        />
      ) : null}

      {orderModal ? (
        <OrderModal
          key={orderModal.product?.id ?? 'new-order'}
          product={orderModal.product}
          products={products}
          onSave={saveOrder}
          onClose={() => setOrderModal(null)}
          notify={notify}
        />
      ) : null}

      {guideModal ? (
        <GuideModal
          key={guideModal.guide?.id ?? 'new-guide'}
          guide={guideModal.guide}
          onSave={saveGuide}
          onClose={() => setGuideModal(null)}
          notify={notify}
        />
      ) : null}

      <ReadModal guide={readGuide} onClose={() => setReadId(null)} />

      {loginPrompt ? (
        <AuthModal
          reason={loginPrompt.reason}
          initialView={loginPrompt.initialView ?? 'login'}
          allowRegister={view !== 'landing'}
          onSuccess={handleLogin}
          onClose={closeLogin}
        />
      ) : null}

      <div className={`toast${toastVisible ? ' show' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}
