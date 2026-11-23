import type { NextRequest } from 'next/server';
import { respuestaErrorApi, respuestaExitoApi } from '@/compartido/utilidades/api';
import {
  subirFotoStorageAdmin,
  verificarAdminAutenticado,
} from '@/modulos/admin/servicio';

export async function POST(request: NextRequest) {
  const auth = await verificarAdminAutenticado();
  if (!auth.ok) {
    return respuestaErrorApi(auth.codigo, auth.mensaje, auth.status);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return respuestaErrorApi('FORM_INVALIDO', 'Se esperaba multipart/form-data.', 400);
  }

  const archivo = formData.get('archivo');
  if (!(archivo instanceof File)) {
    return respuestaErrorApi(
      'ARCHIVO_REQUERIDO',
      'Debes adjuntar un archivo de imagen en el campo "archivo".',
      400
    );
  }

  try {
    const resultado = await subirFotoStorageAdmin(archivo);
    return respuestaExitoApi(resultado, 201);
  } catch (error) {
    return respuestaErrorApi(
      'ERROR_SUBIDA_IMAGEN',
      error instanceof Error ? error.message : 'No se pudo subir la imagen.',
      400
    );
  }
}
