import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { respuestaErrorApi, respuestaExitoApi } from '@/compartido/utilidades/api';
import { esquemaActualizarLocalAdmin } from '@/modulos/admin/esquemas';
import {
  actualizarLocalAdmin,
  eliminarLocalAdmin,
  obtenerLocalAdminPorId,
  verificarAdminAutenticado,
} from '@/modulos/admin/servicio';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verificarAdminAutenticado();
  if (!auth.ok) {
    return respuestaErrorApi(auth.codigo, auth.mensaje, auth.status);
  }

  const { id } = await context.params;
  const local = await obtenerLocalAdminPorId(id);

  if (!local) {
    return respuestaErrorApi('LOCAL_NO_ENCONTRADO', 'Local no encontrado.', 404);
  }

  return respuestaExitoApi({ local }, 200);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verificarAdminAutenticado();
  if (!auth.ok) {
    return respuestaErrorApi(auth.codigo, auth.mensaje, auth.status);
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respuestaErrorApi('JSON_INVALIDO', 'Cuerpo JSON inválido.', 400);
  }

  const validacion = esquemaActualizarLocalAdmin.safeParse(body);
  if (!validacion.success) {
    return respuestaErrorApi(
      'DATOS_INVALIDOS',
      validacion.error.issues[0]?.message ?? 'Datos de actualización inválidos.',
      400
    );
  }

  try {
    const localActualizado = await actualizarLocalAdmin(id, validacion.data);
    if (!localActualizado) {
      return respuestaErrorApi('LOCAL_NO_ENCONTRADO', 'Local no encontrado.', 404);
    }

    revalidatePath('/explorar');
    revalidatePath(`/local/${localActualizado.slug}`);
    return respuestaExitoApi({ local: localActualizado }, 200);
  } catch (error) {
    return respuestaErrorApi(
      'ERROR_ACTUALIZAR_LOCAL',
      error instanceof Error ? error.message : 'Error al actualizar el local.',
      500
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verificarAdminAutenticado();
  if (!auth.ok) {
    return respuestaErrorApi(auth.codigo, auth.mensaje, auth.status);
  }

  const { id } = await context.params;

  try {
    const existente = await obtenerLocalAdminPorId(id);
    if (!existente) {
      return respuestaErrorApi('LOCAL_NO_ENCONTRADO', 'Local no encontrado.', 404);
    }

    await eliminarLocalAdmin(id);
    revalidatePath('/explorar');
    revalidatePath(`/local/${existente.slug}`);
    return respuestaExitoApi({ eliminado: true }, 200);
  } catch (error) {
    return respuestaErrorApi(
      'ERROR_ELIMINAR_LOCAL',
      error instanceof Error ? error.message : 'Error al eliminar el local.',
      500
    );
  }
}
