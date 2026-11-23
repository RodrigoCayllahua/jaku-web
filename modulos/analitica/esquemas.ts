import { z } from 'zod';

export const esquemaRegistrarEvento = z.object({
  local_id: z.string().uuid('El identificador del local no es válido.'),
  tipo: z.enum(['vista', 'como_llegar', 'compartir']),
});

export type EntradaRegistrarEvento = z.infer<typeof esquemaRegistrarEvento>;
