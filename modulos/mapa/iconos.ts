'use client';

import L from 'leaflet';

export function crearIconoLocal(simboloRango: string, seleccionado = false): L.DivIcon {
  const fondo = seleccionado ? '#ea580c' : '#2563eb';
  const borde = '#ffffff';

  return L.divIcon({
    className: 'jaku-pin-local',
    html: `
      <div style="
        display:inline-flex;
        align-items:center;
        justify-content:center;
        background:${fondo};
        color:#ffffff;
        border:2px solid ${borde};
        border-radius:9999px;
        padding:4px 9px;
        font-size:11px;
        font-weight:700;
        white-space:nowrap;
        box-shadow:0 4px 10px rgba(15,23,42,0.28);
      ">${simboloRango}</div>
    `,
    iconSize: [52, 28],
    iconAnchor: [26, 14],
    popupAnchor: [0, -14],
  });
}

export function crearIconoUsuario(): L.DivIcon {
  return L.divIcon({
    className: 'jaku-pin-usuario',
    html: `
      <div style="
        width:18px;
        height:18px;
        border-radius:9999px;
        background:#f97316;
        border:3px solid #ffffff;
        box-shadow:0 0 0 6px rgba(249,115,22,0.25);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}
