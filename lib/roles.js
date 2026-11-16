/** Label peran yang dipakai bersama oleh sisi server dan sisi klien. */

export const ROLES = ['admin', 'penjual', 'buyer'];

export const ROLE_LABELS = {
  admin: 'Admin',
  penjual: 'Penjual',
  buyer: 'Pembeli',
};

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? 'Pengguna';
}
