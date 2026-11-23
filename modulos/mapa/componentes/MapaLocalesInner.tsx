'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import { PLAZA_ARMAS_HUAMANGA } from '@/compartido/constantes/huamanga';
import type { LocalBusqueda } from '@/compartido/tipos';
import {
  formatearDistancia,
  formatearMoneda,
  formatearRangoSimbolo,
} from '@/compartido/utilidades/formato';
import { crearIconoLocal, crearIconoUsuario } from '@/modulos/mapa/iconos';

interface PropiedadesMapaLocalesInner {
  locales: LocalBusqueda[];
  centroLat?: number;
  centroLng?: number;
  tieneUbicacionUsuario: boolean;
  radioMetros?: number;
}

function ControladorCentro({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);

  return null;
}

export default function MapaLocalesInner({
  locales,
  centroLat = PLAZA_ARMAS_HUAMANGA.lat,
  centroLng = PLAZA_ARMAS_HUAMANGA.lng,
  tieneUbicacionUsuario,
  radioMetros,
}: PropiedadesMapaLocalesInner) {
  const iconoUsuario = useMemo(() => crearIconoUsuario(), []);

  return (
    <div className="h-[440px] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm sm:h-[540px]">
      <MapContainer
        center={[centroLat, centroLng]}
        zoom={15}
        scrollWheelZoom
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ControladorCentro lat={centroLat} lng={centroLng} />

        {tieneUbicacionUsuario && (
          <Marker position={[centroLat, centroLng]} icon={iconoUsuario}>
            <Popup>
              <div className="text-xs font-semibold text-slate-800">
                Tu ubicación actual
              </div>
            </Popup>
          </Marker>
        )}

        {tieneUbicacionUsuario && radioMetros && radioMetros > 0 && (
          <Circle
            center={[centroLat, centroLng]}
            radius={radioMetros}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#3b82f6',
              fillOpacity: 0.08,
              weight: 1.5,
            }}
          />
        )}

        {locales.map((local) => {
          const simbolo = formatearRangoSimbolo(local.rango);
          const distancia = formatearDistancia(local.distancia_metros);

          return (
            <Marker
              key={local.id}
              position={[local.lat, local.lng]}
              icon={crearIconoLocal(simbolo)}
            >
              <Popup>
                <div className="min-w-[190px] space-y-1.5 py-0.5">
                  <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                    {local.categoria}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {local.nombre}
                  </h3>
                  <p className="text-xs font-medium text-slate-700">
                    {formatearMoneda(local.precio_ref)} · {simbolo}
                    {distancia ? ` · a ${distancia}` : ''}
                  </p>
                  <p className="text-[11px] text-slate-500">{local.direccion}</p>
                  <Link
                    href={`/local/${local.slug}`}
                    className="mt-1 inline-block w-full rounded-lg bg-blue-600 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Ver ficha
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
