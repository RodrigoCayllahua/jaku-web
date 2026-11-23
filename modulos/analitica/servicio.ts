import { crearClienteSupabaseAdmin } from '@/compartido/supabase/admin';
import type { TipoEvento } from '@/compartido/tipos';

export async function registrarEventoLocal(
  localId: string,
  tipo: TipoEvento
): Promise<{ ok: boolean; error?: string }> {
  const supabase = crearClienteSupabaseAdmin();

  const { data: localExiste, error: errorLocal } = await supabase
    .from('local')
    .select('id, estado')
    .eq('id', localId)
    .maybeSingle();

  if (errorLocal || !localExiste || localExiste.estado !== 'verificado') {
    return {
      ok: false,
      error: 'El local no existe o no está publicado.',
    };
  }

  const { error } = await supabase.from('evento').insert({
    local_id: localId,
    tipo,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
