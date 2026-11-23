import { z } from 'zod';
import { LIMITE_PAGINA_CATALOGO } from '@/compartido/constantes/huamanga';

const numeroOpcional = z.preprocess((valor) => {
  if (valor === undefined || valor === null || valor === '') {
    return undefined;
  }
  const parsed = Number(valor);
  return Number.isNaN(parsed) ? valor : parsed;
}, z.number().optional());

export const esquemaFiltrosCatalogo = z.object({
  precio_max: z.preprocess((valor) => {
    if (valor === undefined || valor === null || valor === '') {
      return undefined;
    }
    const parsed = Number(valor);
    return Number.isNaN(parsed) ? valor : parsed;
  }, z.number().positive('El monto máximo debe ser mayor a 0.').max(10000).optional()),

  rango: z.preprocess((valor) => {
    if (valor === undefined || valor === null || valor === '') {
      return undefined;
    }
    const parsed = Number(valor);
    return Number.isNaN(parsed) ? valor : parsed;
  }, z.union([z.literal(1), z.literal(2), z.literal(3)]).optional()),

  categoria: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .optional(),

  lat: numeroOpcional.refine(
    (v) => v === undefined || (v >= -90 && v <= 90),
    'Latitud inválida.'
  ),

  lng: numeroOpcional.refine(
    (v) => v === undefined || (v >= -180 && v <= 180),
    'Longitud inválida.'
  ),

  radio: z.preprocess((valor) => {
    if (valor === undefined || valor === null || valor === '') {
      return undefined;
    }
    const parsed = Number(valor);
    return Number.isNaN(parsed) ? valor : parsed;
  }, z.number().int().positive().max(50000).optional()),

  orden: z
    .enum(['cercania', 'precio_asc', 'precio_desc', 'recientes'])
    .default('recientes'),

  pagina: z.preprocess((valor) => {
    if (valor === undefined || valor === null || valor === '') {
      return 1;
    }
    const parsed = Number(valor);
    return Number.isNaN(parsed) ? valor : parsed;
  }, z.number().int().min(1).default(1)),

  limite: z.preprocess((valor) => {
    if (valor === undefined || valor === null || valor === '') {
      return LIMITE_PAGINA_CATALOGO;
    }
    const parsed = Number(valor);
    return Number.isNaN(parsed) ? valor : parsed;
  }, z.number().int().min(1).max(50).default(LIMITE_PAGINA_CATALOGO)),
});

export type ParametrosFiltrosValidados = z.infer<typeof esquemaFiltrosCatalogo>;
