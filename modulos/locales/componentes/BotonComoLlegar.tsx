'use client';

import { Navigation } from 'lucide-react';
import { construirUrlComoLlegar } from '@/compartido/utilidades/compartir';
import { enviarEventoAnalitica } from '@/modulos/analitica/cliente';

interface PropiedadesBotonComoLlegar {
  localId: string;
  lat: number;
  lng: number;
  className?: string;
}

export function BotonComoLlegar({
  localId,
  lat,
  lng,
  className = '',
}: PropiedadesBotonComoLlegar) {
  const url = construirUrlComoLlegar(lat, lng);

  const manejarClic = () => {
    enviarEventoAnalitica(localId, 'como_llegar');
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={manejarClic}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] ${className}`}
    >
      <Navigation className="h-4 w-4" />
      Cómo llegar
    </a>
  );
}
