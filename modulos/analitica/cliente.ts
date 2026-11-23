'use client';

import type { TipoEvento } from '@/compartido/tipos';

export function enviarEventoAnalitica(localId: string, tipo: TipoEvento): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = JSON.stringify({ local_id: localId, tipo });

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      const enviado = navigator.sendBeacon('/api/v1/eventos', blob);
      if (enviado) {
        return;
      }
    }

    void fetch('/api/v1/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });
  } catch {
    // La analítica no debe interrumpir la navegación del usuario.
  }
}
