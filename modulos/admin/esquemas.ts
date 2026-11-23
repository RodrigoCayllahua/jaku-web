import { z } from 'zod';

const esquemaHorarioEntrada = z.object({
  dia: z.number().int().min(0).max(6),
  abre: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de apertura inválida (HH:MM).'),
  cierra: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de cierre inválida (HH:MM).'),
});

const esquemaFotoEntrada = z.object({
  url: z.string().url('URL de foto inválida.'),
  orden: z.number().int().min(0).default(0),
});

export const esquemaCrearLocalAdmin = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(120),
  slug: z.string().trim().min(2).max(140).optional(),
  categoria: z.string().trim().min(2, 'Selecciona una categoría.').max(60),
  descripcion: z.string().trim().max(1200).nullable().optional(),
  precio_ref: z.coerce
    .number()
    .positive('El precio referencial debe ser mayor a 0.')
    .max(5000),
  rango: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  direccion: z.string().trim().min(4, 'Ingresa la dirección exacta.').max(200),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  telefono: z.string().trim().max(30).nullable().optional(),
  estado: z.enum(['borrador', 'verificado', 'oculto']).default('borrador'),
  horarios: z.array(esquemaHorarioEntrada).max(7).default([]),
  fotos: z.array(esquemaFotoEntrada).max(10).default([]),
});

export const esquemaActualizarLocalAdmin = esquemaCrearLocalAdmin.partial();

export type EntradaCrearLocalAdmin = z.infer<typeof esquemaCrearLocalAdmin>;
export type EntradaActualizarLocalAdmin = z.infer<typeof esquemaActualizarLocalAdmin>;
