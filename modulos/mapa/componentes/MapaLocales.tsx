'use client';

import dynamic from 'next/dynamic';
import type { LocalBusqueda } from '@/compartido/tipos';

interface PropiedadesMapaLocales {
  locales: LocalBusqueda[];
  centroLat?: number;
  centroLng?: number;
  tieneUbicacionUsuario: boolean;
  radioMetros?: number;
}

const MapaLocalesDinamico = dynamic(
  () => import('@/modulos/mapa/componentes/MapaLocalesInner'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[440px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-sm font-medium text-slate-500 sm:h-[540px]">
        Cargando mapa de Huamanga...
      </div>
    ),
  }
);

export function MapaLocales(props: PropiedadesMapaLocales) {
  return <MapaLocalesDinamico {...props} />;
}
