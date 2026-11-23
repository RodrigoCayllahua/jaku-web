import { redirect } from 'next/navigation';
import {
  listarLocalesAdmin,
  verificarAdminAutenticado,
} from '@/modulos/admin/servicio';
import { PanelAdminView } from '@/modulos/admin/componentes/PanelAdminView';

export const dynamic = 'force-dynamic';

export default async function PaginaAdmin() {
  const auth = await verificarAdminAutenticado();
  if (!auth.ok) {
    redirect('/admin/login');
  }

  const locales = await listarLocalesAdmin();

  return (
    <PanelAdminView
      perfilAdmin={auth.perfil}
      localesIniciales={locales}
    />
  );
}
