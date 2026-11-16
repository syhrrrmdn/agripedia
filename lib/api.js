/**
 * AgriPedia — helper pemanggilan API dari sisi klien.
 * Semua data (produk, edukasi, pengaturan) disimpan di server (Supabase via Prisma).
 */

async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('Tidak dapat menghubungi server. Periksa koneksi Anda.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? 'Terjadi kesalahan pada server.');
  }
  return data;
}

const jsonRequest = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

/* ---------- Produk ---------- */

export async function listProducts() {
  return (await request('/api/products')).products;
}

export async function createProduct(values) {
  return (await request('/api/products', jsonRequest('POST', values))).product;
}

export async function updateProduct(id, values) {
  return (await request(`/api/products/${id}`, jsonRequest('PUT', values))).product;
}

export async function deleteProduct(id) {
  await request(`/api/products/${id}`, { method: 'DELETE' });
}

/* ---------- Edukasi ---------- */

export async function listGuides() {
  return (await request('/api/guides')).guides;
}

export async function createGuide(values) {
  return (await request('/api/guides', jsonRequest('POST', values))).guide;
}

export async function updateGuide(id, values) {
  return (await request(`/api/guides/${id}`, jsonRequest('PUT', values))).guide;
}

export async function deleteGuide(id) {
  await request(`/api/guides/${id}`, { method: 'DELETE' });
}

/* ---------- Pengaturan ---------- */

export async function getWaNumber() {
  return (await request('/api/settings')).waNumber;
}

export async function saveWaNumber(waNumber) {
  return (await request('/api/settings', jsonRequest('PUT', { waNumber }))).waNumber;
}

/* ---------- Reset data contoh ---------- */

export async function resetDemo() {
  return request('/api/reset', { method: 'POST' });
}

/* ---------- Unggah gambar (Cloudinary) ---------- */

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  return (await request('/api/upload', { method: 'POST', body: formData })).url;
}
