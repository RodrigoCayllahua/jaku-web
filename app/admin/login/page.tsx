import { FormularioLoginAdmin } from '@/modulos/admin/componentes/FormularioLoginAdmin';

export default async function PaginaLoginAdmin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rutaSiguiente =
    typeof params.next === 'string' ? params.next : '/admin';
  const errorInicial =
    typeof params.error === 'string' ? params.error : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <FormularioLoginAdmin
        rutaSiguiente={rutaSiguiente}
        errorInicial={errorInicial}
      />
    </main>
  );
}
