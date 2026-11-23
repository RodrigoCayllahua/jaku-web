import { RANGOS_PRESUPUESTO } from '@/compartido/constantes/huamanga';
import type { RangoPresupuesto } from '@/compartido/tipos';

export function formatearMoneda(monto: number): string {
  if (!Number.isFinite(monto)) {
    return 'S/ 0';
  }
  const redondeado = Math.round(monto * 100) / 100;
  const tieneDecimales = redondeado % 1 !== 0;

  return `S/ ${redondeado.toLocaleString('es-PE', {
    minimumFractionDigits: tieneDecimales ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatearRangoSimbolo(rango: RangoPresupuesto | number): string {
  const encontrado = RANGOS_PRESUPUESTO.find((item) => item.valor === rango);
  return encontrado ? encontrado.simbolo : 'S/';
}

export function obtenerEtiquetaRango(rango: RangoPresupuesto | number): string {
  const encontrado = RANGOS_PRESUPUESTO.find((item) => item.valor === rango);
  return encontrado ? encontrado.etiqueta : 'Económico';
}

export function formatearDistancia(metros: number | null | undefined): string {
  if (metros === null || metros === undefined || !Number.isFinite(metros)) {
    return '';
  }
  if (metros < 1000) {
    return `${Math.max(10, Math.round(metros))} m`;
  }
  const km = metros / 1000;
  return `${km.toFixed(1)} km`;
}

export function generarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
