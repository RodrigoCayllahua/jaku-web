import { LIMITE_PAGINA_CATALOGO } from '@/compartido/constantes/huamanga';
import { crearClienteSupabaseServidor } from '@/compartido/supabase/server';
import type {
  DiaSemana,
  EstadoLocal,
  FiltrosCatalogo,
  HorarioItem,
  LocalBusqueda,
  RangoPresupuesto,
  RespuestaPaginadaLocales,
} from '@/compartido/tipos';

interface FilaRpcBuscarLocales {
  id: string;
  nombre: string;
  slug: string;
  categoria: string;
  descripcion: string | null;
  precio_ref: number;
  rango: number;
  direccion: string;
  telefono: string | null;
  estado: EstadoLocal;
  lat: number;
  lng: number;
  distancia_metros: number | null;
  foto_principal: string | null;
  horarios: unknown;
  actualizado?: string;
}

function normalizarHorariosJson(raw: unknown): HorarioItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter(
      (item): item is { dia: number; abre: string; cierra: string } =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { dia?: unknown }).dia === 'number' &&
        typeof (item as { abre?: unknown }).abre === 'string' &&
        typeof (item as { cierra?: unknown }).cierra === 'string'
    )
    .map((item) => ({
      dia: item.dia as DiaSemana,
      abre: item.abre,
      cierra: item.cierra,
    }));
}

export async function buscarLocalesCatalogo(
  filtros: FiltrosCatalogo
): Promise<RespuestaPaginadaLocales> {
  const supabase = await crearClienteSupabaseServidor();

  const pagina = Math.max(1, filtros.pagina ?? 1);
  const limite = Math.min(50, Math.max(1, filtros.limite ?? LIMITE_PAGINA_CATALOGO));
  const offset = (pagina - 1) * limite;
  const ordenarDistancia =
    filtros.orden === 'cercania' &&
    filtros.lat !== undefined &&
    filtros.lng !== undefined;

  const { data, error } = await supabase.rpc('buscar_locales', {
    p_precio_max: filtros.precioMax ?? null,
    p_rango: filtros.rango ?? null,
    p_categoria: filtros.categoria ?? null,
    p_lat: filtros.lat ?? null,
    p_lng: filtros.lng ?? null,
    p_radio_metros: filtros.radioMetros ?? null,
    p_ordenar_distancia: ordenarDistancia,
    p_limite: limite + 1,
    p_offset: offset,
  });

  if (error) {
    throw new Error(`Error al consultar catálogo de locales: ${error.message}`);
  }

  const filas = (data ?? []) as FilaRpcBuscarLocales[];
  const hayMas = filas.length > limite;
  const filasPagina = hayMas ? filas.slice(0, limite) : filas;

  const locales: LocalBusqueda[] = filasPagina.map((fila) => ({
    id: fila.id,
    nombre: fila.nombre,
    slug: fila.slug,
    categoria: fila.categoria,
    descripcion: fila.descripcion,
    precio_ref: Number(fila.precio_ref),
    rango: fila.rango as RangoPresupuesto,
    direccion: fila.direccion,
    telefono: fila.telefono,
    estado: fila.estado,
    actualizado: fila.actualizado ?? new Date().toISOString(),
    lat: Number(fila.lat),
    lng: Number(fila.lng),
    distancia_metros:
      fila.distancia_metros !== null && fila.distancia_metros !== undefined
        ? Number(fila.distancia_metros)
        : null,
    foto_principal: fila.foto_principal ?? null,
    horarios: normalizarHorariosJson(fila.horarios),
  }));

  if (filtros.orden === 'precio_asc') {
    locales.sort((a, b) => a.precio_ref - b.precio_ref);
  } else if (filtros.orden === 'precio_desc') {
    locales.sort((a, b) => b.precio_ref - a.precio_ref);
  }

  return {
    locales,
    pagina,
    limite,
    hayMas,
  };
}
