import { PLAZA_ARMAS_HUAMANGA } from '@/compartido/constantes/huamanga';

export interface Coordenadas {
  lat: number;
  lng: number;
}

function leerFloat64Hex(
  hex: string,
  offsetBytes: number,
  littleEndian: boolean
): number {
  const bytes = new Uint8Array(8);
  const startChar = offsetBytes * 2;
  for (let i = 0; i < 8; i++) {
    bytes[i] = Number.parseInt(hex.slice(startChar + i * 2, startChar + i * 2 + 2), 16);
  }
  const view = new DataView(bytes.buffer);
  return view.getFloat64(0, littleEndian);
}

export function parsearUbicacionPostGIS(ubicacion: unknown): Coordenadas {
  if (!ubicacion) {
    return {
      lat: PLAZA_ARMAS_HUAMANGA.lat,
      lng: PLAZA_ARMAS_HUAMANGA.lng,
    };
  }

  if (typeof ubicacion === 'object' && ubicacion !== null) {
    const geo = ubicacion as { type?: string; coordinates?: unknown };
    if (
      geo.type === 'Point' &&
      Array.isArray(geo.coordinates) &&
      geo.coordinates.length >= 2 &&
      typeof geo.coordinates[0] === 'number' &&
      typeof geo.coordinates[1] === 'number'
    ) {
      return {
        lng: geo.coordinates[0],
        lat: geo.coordinates[1],
      };
    }
  }

  if (typeof ubicacion === 'string') {
    const wktMatch = ubicacion.match(
      /POINT\s*\(\s*([-+]?\d+(?:\.\d+)?)\s+([-+]?\d+(?:\.\d+)?)\s*\)/i
    );
    if (wktMatch) {
      return {
        lng: Number.parseFloat(wktMatch[1]),
        lat: Number.parseFloat(wktMatch[2]),
      };
    }

    const limpio = ubicacion.trim().replace(/^0x/i, '');
    if (/^[0-9a-fA-F]+$/.test(limpio) && limpio.length >= 42) {
      const littleEndian = limpio.slice(0, 2) === '01';
      const tipoBytes = new Uint8Array(4);
      for (let i = 0; i < 4; i++) {
        tipoBytes[i] = Number.parseInt(limpio.slice(2 + i * 2, 4 + i * 2), 16);
      }
      const tipoView = new DataView(tipoBytes.buffer);
      const tipoGeom = tipoView.getUint32(0, littleEndian);
      const tieneSrid = (tipoGeom & 0x20000000) !== 0;
      const offsetCoords = tieneSrid ? 9 : 5;

      if (limpio.length >= (offsetCoords + 16) * 2) {
        const lng = leerFloat64Hex(limpio, offsetCoords, littleEndian);
        const lat = leerFloat64Hex(limpio, offsetCoords + 8, littleEndian);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return { lat, lng };
        }
      }
    }
  }

  return {
    lat: PLAZA_ARMAS_HUAMANGA.lat,
    lng: PLAZA_ARMAS_HUAMANGA.lng,
  };
}
