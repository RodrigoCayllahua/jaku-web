import Link from 'next/link';
import { MapPin, ShieldCheck } from 'lucide-react';
import { LIMITE_PAGINA_CATALOGO } from '@/compartido/constantes/huamanga';
import { buscarLocalesCatalogo } from '@/modulos/catalogo/servicio';
import { VistaExplorar } from '@/modulos/catalogo/componentes/VistaExplorar';

export const revalidate = 60;

export default async function PaginaExplorar({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const rangoParam =
    typeof params.rango === 'string' ? Number(params.rango) : undefined;
  const rangoValido =
    rangoParam === 1 || rangoParam === 2 || rangoParam === 3
      ? rangoParam
      : undefined;

  const precioMaxParam =
    typeof params.precio_max === 'string'
      ? Number(params.precio_max)
      : undefined;

  const categoriaParam =
    typeof params.categoria === 'string' && params.categoria.trim() !== ''
      ? params.categoria.trim()
      : undefined;

  const datosIniciales = await buscarLocalesCatalogo({
    rango: rangoValido,
    precioMax:
      precioMaxParam && Number.isFinite(precioMaxParam) && precioMaxParam > 0
        ? precioMaxParam
        : undefined,
    categoria: categoriaParam,
    orden: 'recientes',
    pagina: 1,
    limite: LIMITE_PAGINA_CATALOGO,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/explorar" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-base font-extrabold text-white shadow-sm">
              J
            </span>
            <div>
              <span className="block text-lg font-extrabold leading-none tracking-tight text-slate-900">
                JAKU
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <MapPin className="h-3 w-3 text-orange-500" />
                Huamanga, Ayacucho
              </span>
            </div>
          </Link>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            Administrador
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            ¿Qué hacemos hoy en Huamanga?
          </h1>
          <p className="text-sm text-slate-600">
            Elige cuánto quieres gastar y encuentra locales verificados cerca de
            ti en segundos.
          </p>
        </div>

        <VistaExplorar
          localesIniciales={datosIniciales.locales}
          hayMasInicial={datosIniciales.hayMas}
        />
      </main>
    </div>
  );
}
