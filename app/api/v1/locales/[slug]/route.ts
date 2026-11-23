import type { NextRequest } from 'next/server';
import { respuestaErrorApi, respuestaExitoApi } from '@/compartido/utilidades/api';
import { obtenerLocalVerificadoPorSlug } from '@/modulos/locales/servicio';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!slug || slug.trim() === '') {
    return respuestaErrorApi('SLUG_INVALIDO', 'El slug es obligatorio.', 400);
  }

  try {
    const local = await obtenerLocalVerificadoPorSlug(slug);
    if (!local) {
      return respuestaErrorApi(
        'LOCAL_NO_ENCONTRADO',
        'El local solicitado no existe o no está publicado.',
        404
      );
    }

    return respuestaExitoApi({ local }, 200);
  } catch (error) {
    return respuestaErrorApi(
      'ERROR_DETALLE_LOCAL',
      error instanceof Error ? error.message : 'Error al obtener la ficha del local.',
      500
    );
  }
}
