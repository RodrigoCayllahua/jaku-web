import { crearClienteSupabaseServidor } from '@/compartido/supabase/server';
import type {
  DiaSemana,
  EstadoLocal,
  Foto,
  Horario,
  LocalDetalle,
  RangoPresupuesto,
} from '@/compartido/tipos';
import { parsearUbicacionPostGIS } from '@/modulos/locales/ubicacion';

interface FilaLocalCruda {
  id: string;
  nombre: string;
  slug: string;
  categoria: string;
  descripcion: string | null;
  precio_ref: number;
  rango: number;
  direccion: string;
  ubicacion: unknown;
  telefono: string | null;
  estado: EstadoLocal;
  actualizado: string;
  foto?: Array<{ id: string; local_id: string; url: string; orden: number }>;
  horario?: Array<{
    id: string;
    local_id: string;
    dia: number;
    abre: string;
    cierra: string;
  }>;
}

export async function obtenerLocalVerificadoPorSlug(
  slug: string
): Promise<LocalDetalle | null> {
  const supabase = await crearClienteSupabaseServidor();

  const { data, error } = await supabase
    .from('local')
    .select(
      `
      id,
      nombre,
      slug,
      categoria,
      descripcion,
      precio_ref,
      rango,
      direccion,
      ubicacion,
      telefono,
      estado,
      actualizado,
      foto ( id, local_id, url, orden ),
      horario ( id, local_id, dia, abre, cierra )
      `
    )
    .eq('slug', slug)
    .eq('estado', 'verificado')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const fila = data as unknown as FilaLocalCruda;
  const coords = parsearUbicacionPostGIS(fila.ubicacion);

  const fotosOrdenadas: Foto[] = (fila.foto ?? [])
    .slice()
    .sort((a, b) => a.orden - b.orden);

  const horariosOrdenados: Horario[] = (fila.horario ?? [])
    .map((h) => ({
      id: h.id,
      local_id: h.local_id,
      dia: h.dia as DiaSemana,
      abre: h.abre,
      cierra: h.cierra,
    }))
    .sort((a, b) => a.dia - b.dia);

  return {
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
    actualizado: fila.actualizado,
    lat: coords.lat,
    lng: coords.lng,
    fotos: fotosOrdenadas,
    horarios: horariosOrdenados,
  };
}
