'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { crearIconoLocal } from '@/modulos/mapa/iconos';

interface PropiedadesSelectorUbicacionInner {
  lat: number;
  lng: number;
  alCambiar: (lat: number, lng: number) => void;
}

function ManejadorEventosMapa({
  lat,
  lng,
  alCambiar,
}: PropiedadesSelectorUbicacionInner) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);

  useMapEvents({
    click(evento) {
      alCambiar(
        Number(evento.latlng.lat.toFixed(6)),
        Number(evento.latlng.lng.toFixed(6))
      );
    },
  });

  return null;
}

export default function SelectorUbicacionInner({
  lat,
  lng,
  alCambiar,
}: PropiedadesSelectorUbicacionInner) {
  const icono = useMemo(() => crearIconoLocal('PIN', true), []);

  return (
    <div className="h-64 w-full overflow-hidden rounded-xl border border-slate-300">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ManejadorEventosMapa lat={lat} lng={lng} alCambiar={alCambiar} />
        <Marker
          position={[lat, lng]}
          icon={icono}
          draggable
          eventHandlers={{
            dragend(evento) {
              const marker = evento.target;
              const posicion = marker.getLatLng();
              alCambiar(
                Number(posicion.lat.toFixed(6)),
                Number(posicion.lng.toFixed(6))
              );
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
