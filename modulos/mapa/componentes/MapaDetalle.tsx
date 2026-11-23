'use client';

import dynamic from 'next/dynamic';

interface PropiedadesMapaDetalle {
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
}

const MapaDetalleDinamico = dynamic(
  () => import('@/modulos/mapa/componentes/MapaDetalleInner'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-medium text-slate-500">
        Cargando mapa...
      </div>
    ),
  }
);

export function MapaDetalle(props: PropiedadesMapaDetalle) {
  return <MapaDetalleDinamico {...props} />;
}
