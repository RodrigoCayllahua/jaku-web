import { NextResponse } from 'next/server';
import type { ApiErrorPayload } from '@/compartido/tipos';

export function respuestaErrorApi(
  codigo: string,
  mensaje: string,
  status: number
): NextResponse<ApiErrorPayload> {
  return NextResponse.json(
    {
      error: {
        codigo,
        mensaje,
      },
    },
    { status }
  );
}

export function respuestaExitoApi<T>(
  datos: T,
  status = 200
): NextResponse<T> {
  return NextResponse.json(datos, { status });
}
