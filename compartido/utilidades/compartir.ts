import {
  formatearMoneda,
  formatearRangoSimbolo,
} from '@/compartido/utilidades/formato';
import type { RangoPresupuesto } from '@/compartido/tipos';

export interface ParametrosMensajeCompartir {
  nombre: string;
  rango: RangoPresupuesto | number;
  precioRef: number;
  direccion: string;
  urlLocal: string;
}

export function construirMensajeWhatsApp({
  nombre,
  rango,
  precioRef,
  direccion,
  urlLocal,
}: ParametrosMensajeCompartir): string {
  const simboloRango = formatearRangoSimbolo(rango);
  const precioTexto = formatearMoneda(precioRef);

  return [
    `¡Plan en Huamanga con JAKU!`,
    `*${nombre}*`,
    `Presupuesto: ${simboloRango} (aprox. ${precioTexto} por persona)`,
    `Dirección: ${direccion}`,
    `Míralo aquí: ${urlLocal}`,
  ].join('\n');
}

export function construirUrlWhatsApp(mensaje: string): string {
  return `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
}

export function construirUrlComoLlegar(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function construirDatosWebShare(
  params: ParametrosMensajeCompartir
): ShareData {
  return {
    title: `${params.nombre} | JAKU Huamanga`,
    text: construirMensajeWhatsApp(params),
    url: params.urlLocal,
  };
}
