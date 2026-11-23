import { NextResponse, type NextRequest } from 'next/server';
import { respuestaErrorApi } from '@/compartido/utilidades/api';
import { esquemaFiltrosCatalogo } from '@/modulos/catalogo/esquemas';
import { buscarLocalesCatalogo } from '@/modulos/catalogo/servicio';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const entradaCruda = {
    precio_max: searchParams.get('precio_max') ?? undefined,
    rango: searchParams.get('rango') ?? undefined,
    categoria: searchParams.get('categoria') ?? undefined,
    lat: searchParams.get('lat') ?? undefined,
    lng: searchParams.get('lng') ?? undefined,
    radio: searchParams.get('radio') ?? undefined,
    orden: searchParams.get('orden') ?? undefined,
    pagina: searchParams.get('pagina') ?? undefined,
    limite: searchParams.get('limite') ?? undefined,
  };

  const validacion = esquemaFiltrosCatalogo.safeParse(entradaCruda);
  if (!validacion.success) {
    return respuestaErrorApi(
      'PARAMETROS_INVALIDOS',
      validacion.error.issues[0]?.message ?? 'Parámetros de búsqueda inválidos.',
      400
    );
  }

  try {
    const resultado = await buscarLocalesCatalogo({
      precioMax: validacion.data.precio_max,
      rango: validacion.data.rango,
      categoria: validacion.data.categoria,
      lat: validacion.data.lat,
      lng: validacion.data.lng,
      radioMetros: validacion.data.radio,
      orden: validacion.data.orden,
      pagina: validacion.data.pagina,
      limite: validacion.data.limite,
    });

    return NextResponse.json(resultado, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    return respuestaErrorApi(
      'ERROR_CATALOGO',
      error instanceof Error ? error.message : 'Error al consultar locales.',
      500
    );
  }
}
