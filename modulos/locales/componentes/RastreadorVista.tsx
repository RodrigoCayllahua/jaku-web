'use client';

import { useEffect, useRef } from 'react';
import { enviarEventoAnalitica } from '@/modulos/analitica/cliente';

interface PropiedadesRastreadorVista {
  localId: string;
}

export function RastreadorVista({ localId }: PropiedadesRastreadorVista) {
  const yaRegistrado = useRef(false);

  useEffect(() => {
    if (yaRegistrado.current) {
      return;
    }
    yaRegistrado.current = true;
    enviarEventoAnalitica(localId, 'vista');
  }, [localId]);

  return null;
}
