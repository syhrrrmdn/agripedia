import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { authorize } from '@/lib/db';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request) {
  const { response } = await authorize(['admin', 'penjual']);
  if (response) return response;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Berkas gambar tidak ditemukan.' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Berkas harus berupa gambar.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Ukuran gambar maksimal 5 MB.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'agripedia', resource_type: 'image' }, (error, uploaded) =>
          error ? reject(error) : resolve(uploaded),
        )
        .end(buffer);
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/upload gagal:', error);
    return NextResponse.json({ error: 'Gagal mengunggah gambar.' }, { status: 500 });
  }
}
