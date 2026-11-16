import { NextResponse } from 'next/server';
import { authorize, resetCatalog } from '@/lib/db';
import { createSampleGuides, createSampleProducts } from '@/lib/data';

export async function POST() {
  const { response } = await authorize(['admin']);
  if (response) return response;

  try {
    const data = await resetCatalog(createSampleProducts(), createSampleGuides());
    return NextResponse.json(data);
  } catch (error) {
    console.error('POST /api/reset gagal:', error);
    return NextResponse.json({ error: 'Gagal mereset data contoh.' }, { status: 500 });
  }
}
