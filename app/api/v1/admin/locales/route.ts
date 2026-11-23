import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { respuestaErrorApi, respuestaExitoApi } from '@/compartido/utilidades/api';
import { esquemaCrearLocalAdmin } from '@/modulos/admin/esquemas';
import {
  crearLocalAdmin,
  listarLocalesAdmin,
  verificarAdminAutenticado,
} from '@/modulos/admin/servicio';

export async function GET() {
  const auth = await verificarAdminAutenticado();
  if (!auth.ok) {
    return respuestaErrorApi(auth.codigo, auth.mensaje, auth.status);
  }

  try {
    const locales = await listarLocalesAdmin();
    return respuestaExitoApi({ locales }, 200);
  } catch (error) {
    return respuestaErrorApi(
      'ERROR_LISTAR_LOCALES',
      error instanceof Error ? error.message : 'Error al listar locales.',
      500
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await verificarAdminAutenticado();
  if (!auth.ok) {
    return respuestaErrorApi(auth.codigo, auth.mensaje, auth.status);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respuestaErrorApi('JSON_INVALIDO', 'Cuerpo JSON inválido.', 400);
  }

  const validacion = esquemaCrearLocalAdmin.safeParse(body);
  if (!validacion.success) {
    return respuestaErrorApi(
      'DATOS_INVALIDOS',
      validacion.error.issues[0]?.message ?? 'Datos del local inválidos.',
      400
    );
  }

  try {
    const local = await crearLocalAdmin(validacion.data);
    revalidatePath('/explorar');
    revalidatePath(`/local/${local.slug}`);
    return respuestaExitoApi({ local }, 201);
  } catch (error) {
    return respuestaErrorApi(
      'ERROR_CREAR_LOCAL',
      error instanceof Error ? error.message : 'Error al crear el local.',
      500
    );
  }
}
