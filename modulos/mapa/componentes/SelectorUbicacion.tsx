'use client';

import dynamic from 'next/dynamic';

interface PropiedadesSelectorUbicacion {
  lat: number;
  lng: number;
  alCambiar: (lat: number, lng: number) => void;
}

const SelectorUbicacionDinamico = dynamic(
  () => import('@/modulos/mapa/componentes/SelectorUbicacionInner'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-medium text-slate-500">
        Cargando selector de mapa...
      </div>
    ),
  }
);

export function SelectorUbicacion(props: PropiedadesSelectorUbicacion) {
  return <SelectorUbicacionDinamico {...props} />;
}
