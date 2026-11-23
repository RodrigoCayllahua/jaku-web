import { BUCKET_FOTOS_LOCALES, MAX_TAMANO_FOTO_BYTES } from '@/compartido/constantes/huamanga';
import { crearClienteSupabaseAdmin } from '@/compartido/supabase/admin';
import { crearClienteSupabaseServidor } from '@/compartido/supabase/server';
import type {
  DiaSemana,
  EstadoLocal,
  Foto,
  Horario,
  LocalDetalle,
  PerfilAdmin,
  RangoPresupuesto,
} from '@/compartido/tipos';
import { generarSlug } from '@/compartido/utilidades/formato';
import { parsearUbicacionPostGIS } from '@/modulos/locales/ubicacion';
import type {
  EntradaActualizarLocalAdmin,
  EntradaCrearLocalAdmin,
} from '@/modulos/admin/esquemas';

export interface LocalAdminConMetricas extends LocalDetalle {
  metricas: {
    vistas: number;
    comoLlegar: number;
    compartidos: number;
  };
}

interface FilaAdminLocal {
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
  foto?: Foto[];
  horario?: Array<{
    id: string;
    local_id: string;
    dia: number;
    abre: string;
    cierra: string;
  }>;
  evento?: Array<{ tipo: 'vista' | 'como_llegar' | 'compartir' }>;
}

export async function verificarAdminAutenticado(): Promise<
  | { ok: true; perfil: PerfilAdmin }
  | { ok: false; status: 401 | 403; codigo: string; mensaje: string }
> {
  const supabase = await crearClienteSupabaseServidor();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      status: 401,
      codigo: 'NO_AUTENTICADO',
      mensaje: 'Debes iniciar sesión como administrador.',
    };
  }

  const { data: perfil, error: perfilError } = await supabase
    .from('perfil_admin')
    .select('id, nombre, rol')
    .eq('id', user.id)
    .maybeSingle();

  if (perfilError || !perfil) {
    return {
      ok: false,
      status: 403,
      codigo: 'NO_AUTORIZADO',
      mensaje: 'Tu cuenta no tiene permisos de administrador.',
    };
  }

  return {
    ok: true,
    perfil: perfil as PerfilAdmin,
  };
}

function mapearLocalAdmin(fila: FilaAdminLocal): LocalAdminConMetricas {
  const coords = parsearUbicacionPostGIS(fila.ubicacion);
  const fotos = (fila.foto ?? []).slice().sort((a, b) => a.orden - b.orden);
  const horarios: Horario[] = (fila.horario ?? [])
    .map((h) => ({
      id: h.id,
      local_id: h.local_id,
      dia: h.dia as DiaSemana,
      abre: h.abre,
      cierra: h.cierra,
    }))
    .sort((a, b) => a.dia - b.dia);

  const eventos = fila.evento ?? [];
  const metricas = {
    vistas: eventos.filter((e) => e.tipo === 'vista').length,
    comoLlegar: eventos.filter((e) => e.tipo === 'como_llegar').length,
    compartidos: eventos.filter((e) => e.tipo === 'compartir').length,
  };

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
    fotos,
    horarios,
    metricas,
  };
}

export async function listarLocalesAdmin(): Promise<LocalAdminConMetricas[]> {
  const supabase = crearClienteSupabaseAdmin();

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
      horario ( id, local_id, dia, abre, cierra ),
      evento ( tipo )
      `
    )
    .order('actualizado', { ascending: false });

  if (error) {
    throw new Error(`Error al listar locales: ${error.message}`);
  }

  return ((data ?? []) as unknown as FilaAdminLocal[]).map(mapearLocalAdmin);
}

export async function obtenerLocalAdminPorId(
  id: string
): Promise<LocalAdminConMetricas | null> {
  const supabase = crearClienteSupabaseAdmin();

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
      horario ( id, local_id, dia, abre, cierra ),
      evento ( tipo )
      `
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapearLocalAdmin(data as unknown as FilaAdminLocal);
}

export async function crearLocalAdmin(
  datos: EntradaCrearLocalAdmin
): Promise<LocalAdminConMetricas> {
  const supabase = crearClienteSupabaseAdmin();
  const slugBase = generarSlug(datos.slug || datos.nombre);

  const { data: existente } = await supabase
    .from('local')
    .select('id')
    .eq('slug', slugBase)
    .maybeSingle();

  const slugFinal = existente
    ? `${slugBase}-${Date.now().toString().slice(-4)}`
    : slugBase;

  const puntoWkt = `SRID=4326;POINT(${datos.lng} ${datos.lat})`;

  const { data: insertado, error: errorInsert } = await supabase
    .from('local')
    .insert({
      nombre: datos.nombre,
      slug: slugFinal,
      categoria: datos.categoria,
      descripcion: datos.descripcion ?? null,
      precio_ref: datos.precio_ref,
      rango: datos.rango,
      direccion: datos.direccion,
      ubicacion: puntoWkt,
      telefono: datos.telefono ?? null,
      estado: datos.estado,
      actualizado: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (errorInsert || !insertado) {
    throw new Error(errorInsert?.message ?? 'No se pudo crear el local.');
  }

  const localId = insertado.id as string;

  if (datos.horarios.length > 0) {
    const { error: errorHorarios } = await supabase.from('horario').insert(
      datos.horarios.map((h) => ({
        local_id: localId,
        dia: h.dia,
        abre: h.abre,
        cierra: h.cierra,
      }))
    );
    if (errorHorarios) {
      throw new Error(`Error al guardar horarios: ${errorHorarios.message}`);
    }
  }

  if (datos.fotos.length > 0) {
    const { error: errorFotos } = await supabase.from('foto').insert(
      datos.fotos.map((f, index) => ({
        local_id: localId,
        url: f.url,
        orden: f.orden ?? index,
      }))
    );
    if (errorFotos) {
      throw new Error(`Error al guardar fotos: ${errorFotos.message}`);
    }
  }

  const creado = await obtenerLocalAdminPorId(localId);
  if (!creado) {
    throw new Error('No se pudo recuperar el local recién creado.');
  }
  return creado;
}

export async function actualizarLocalAdmin(
  id: string,
  datos: EntradaActualizarLocalAdmin
): Promise<LocalAdminConMetricas | null> {
  const supabase = crearClienteSupabaseAdmin();

  const actual = await obtenerLocalAdminPorId(id);
  if (!actual) {
    return null;
  }

  const camposActualizacion: Record<string, unknown> = {
    actualizado: new Date().toISOString(),
  };

  if (datos.nombre !== undefined) camposActualizacion.nombre = datos.nombre;
  if (datos.slug !== undefined) camposActualizacion.slug = generarSlug(datos.slug);
  if (datos.categoria !== undefined) camposActualizacion.categoria = datos.categoria;
  if (datos.descripcion !== undefined) camposActualizacion.descripcion = datos.descripcion;
  if (datos.precio_ref !== undefined) camposActualizacion.precio_ref = datos.precio_ref;
  if (datos.rango !== undefined) camposActualizacion.rango = datos.rango;
  if (datos.direccion !== undefined) camposActualizacion.direccion = datos.direccion;
  if (datos.telefono !== undefined) camposActualizacion.telefono = datos.telefono;
  if (datos.estado !== undefined) camposActualizacion.estado = datos.estado;

  if (datos.lat !== undefined && datos.lng !== undefined) {
    camposActualizacion.ubicacion = `SRID=4326;POINT(${datos.lng} ${datos.lat})`;
  }

  const { error: errorUpdate } = await supabase
    .from('local')
    .update(camposActualizacion)
    .eq('id', id);

  if (errorUpdate) {
    throw new Error(`Error al actualizar el local: ${errorUpdate.message}`);
  }

  if (datos.horarios !== undefined) {
    await supabase.from('horario').delete().eq('local_id', id);
    if (datos.horarios.length > 0) {
      const { error: errorHorarios } = await supabase.from('horario').insert(
        datos.horarios.map((h) => ({
          local_id: id,
          dia: h.dia,
          abre: h.abre,
          cierra: h.cierra,
        }))
      );
      if (errorHorarios) {
        throw new Error(`Error al actualizar horarios: ${errorHorarios.message}`);
      }
    }
  }

  if (datos.fotos !== undefined) {
    await supabase.from('foto').delete().eq('local_id', id);
    if (datos.fotos.length > 0) {
      const { error: errorFotos } = await supabase.from('foto').insert(
        datos.fotos.map((f, index) => ({
          local_id: id,
          url: f.url,
          orden: f.orden ?? index,
        }))
      );
      if (errorFotos) {
        throw new Error(`Error al actualizar fotos: ${errorFotos.message}`);
      }
    }
  }

  return obtenerLocalAdminPorId(id);
}

export async function eliminarLocalAdmin(id: string): Promise<boolean> {
  const supabase = crearClienteSupabaseAdmin();
  const { error } = await supabase.from('local').delete().eq('id', id);
  if (error) {
    throw new Error(`Error al eliminar local: ${error.message}`);
  }
  return true;
}

const TIPOS_MIME_PERMITIDOS = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export async function subirFotoStorageAdmin(
  archivo: File
): Promise<{ url: string; path: string }> {
  if (!TIPOS_MIME_PERMITIDOS.has(archivo.type)) {
    throw new Error('Formato no permitido. Usa JPG, PNG o WEBP.');
  }

  if (archivo.size > MAX_TAMANO_FOTO_BYTES) {
    throw new Error('La imagen supera el límite de 5 MB.');
  }

  const supabase = crearClienteSupabaseAdmin();
  const extension = archivo.name.split('.').pop()?.toLowerCase() || 'jpg';
  const nombreSeguro = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const rutaArchivo = `locales/${nombreSeguro}`;

  const buffer = await archivo.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_FOTOS_LOCALES)
    .upload(rutaArchivo, buffer, {
      contentType: archivo.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Error al subir foto a Storage: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(BUCKET_FOTOS_LOCALES)
    .getPublicUrl(rutaArchivo);

  return {
    url: data.publicUrl,
    path: rutaArchivo,
  };
}
