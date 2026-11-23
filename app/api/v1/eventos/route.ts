import type { NextRequest } from 'next/server';
import { respuestaErrorApi, respuestaExitoApi } from '@/compartido/utilidades/api';
import { esquemaRegistrarEvento } from '@/modulos/analitica/esquemas';
import { registrarEventoLocal } from '@/modulos/analitica/servicio';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respuestaErrorApi('JSON_INVALIDO', 'El cuerpo de la petición debe ser JSON válido.', 400);
  }

  const validacion = esquemaRegistrarEvento.safeParse(body);
  if (!validacion.success) {
    return respuestaErrorApi(
      'DATOS_INVALIDOS',
      validacion.error.issues[0]?.message ?? 'Datos de evento inválidos.',
      400
    );
  }

  const resultado = await registrarEventoLocal(
    validacion.data.local_id,
    validacion.data.tipo
  );

  if (!resultado.ok) {
    return respuestaErrorApi(
      'EVENTO_RECHAZADO',
      resultado.error ?? 'No se pudo registrar el evento.',
      404
    );
  }

  return respuestaExitoApi({ registrado: true }, 201);
}
