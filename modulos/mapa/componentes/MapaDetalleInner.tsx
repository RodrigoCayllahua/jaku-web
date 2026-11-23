'use client';

import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { crearIconoLocal } from '@/modulos/mapa/iconos';

interface PropiedadesMapaDetalleInner {
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
}

export default function MapaDetalleInner({
  nombre,
  direccion,
  lat,
  lng,
}: PropiedadesMapaDetalleInner) {
  const icono = useMemo(() => crearIconoLocal('JAKU', true), []);

  return (
    <div className="h-64 w-full overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={icono}>
          <Popup>
            <div className="text-xs">
              <p className="font-bold text-slate-900">{nombre}</p>
              <p className="text-slate-600">{direccion}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
