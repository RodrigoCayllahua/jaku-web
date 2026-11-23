import type { DiaSemana, RangoPresupuesto } from '@/compartido/tipos';

export const PLAZA_ARMAS_HUAMANGA = {
  lat: -13.16058,
  lng: -74.22567,
  nombre: 'Plaza Mayor de Huamanga',
} as const;

export const ZONA_HORARIA_PERU = 'America/Lima';

export const RADIO_DEFECTO_METROS = 2000;

export const OPCIONES_RADIO_METROS = [
  { valor: 500, etiqueta: '500 m' },
  { valor: 1000, etiqueta: '1 km' },
  { valor: 2000, etiqueta: '2 km' },
  { valor: 5000, etiqueta: '5 km' },
] as const;

export const LIMITE_PAGINA_CATALOGO = 20;

export const BUCKET_FOTOS_LOCALES = 'fotos-locales';

export const MAX_TAMANO_FOTO_BYTES = 5 * 1024 * 1024;

export const CATEGORIAS_LOCAL = [
  'Restaurante',
  'Pollería',
  'Cevichería',
  'Chifa',
  'Café',
  'Heladería',
  'Bar',
  'Restobar',
  'Karaoke',
  'Discoteca',
  'Cine',
  'Recreo campestre',
  'Mirador',
  'Museo',
  'Iglesia',
] as const;

export interface DefinicionRango {
  valor: RangoPresupuesto;
  simbolo: string;
  etiqueta: string;
  descripcion: string;
}

export const RANGOS_PRESUPUESTO: readonly DefinicionRango[] = [
  {
    valor: 1,
    simbolo: 'S/',
    etiqueta: 'Económico',
    descripcion: 'Hasta S/ 20',
  },
  {
    valor: 2,
    simbolo: 'S/ S/',
    etiqueta: 'Moderado',
    descripcion: 'S/ 20 a S/ 50',
  },
  {
    valor: 3,
    simbolo: 'S/ S/ S/',
    etiqueta: 'Lujoso',
    descripcion: 'Más de S/ 50',
  },
] as const;

export const NOMBRES_DIAS_SEMANA: Record<DiaSemana, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

export const NOMBRES_DIAS_CORTOS: Record<DiaSemana, string> = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
};

export const ORDEN_DIAS_SEMANA: readonly DiaSemana[] = [1, 2, 3, 4, 5, 6, 0];
