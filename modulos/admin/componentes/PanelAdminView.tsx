'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  LogOut,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { crearClienteSupabaseBrowser } from '@/compartido/supabase/browser';
import type { EstadoLocal, PerfilAdmin } from '@/compartido/tipos';
import {
  formatearMoneda,
  formatearRangoSimbolo,
} from '@/compartido/utilidades/formato';
import { FormularioLocalAdmin } from '@/modulos/admin/componentes/FormularioLocalAdmin';
import type { LocalAdminConMetricas } from '@/modulos/admin/servicio';

interface PropiedadesPanelAdminView {
  perfilAdmin: PerfilAdmin;
  localesIniciales: LocalAdminConMetricas[];
}

export function PanelAdminView({
  perfilAdmin,
  localesIniciales,
}: PropiedadesPanelAdminView) {
  const router = useRouter();
  const [locales, setLocales] =
    useState<LocalAdminConMetricas[]>(localesIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | EstadoLocal>(
    'todos'
  );
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [localEditando, setLocalEditando] =
    useState<LocalAdminConMetricas | null>(null);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  const localesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return locales.filter((local) => {
      const coincideEstado =
        filtroEstado === 'todos' || local.estado === filtroEstado;
      const coincideTexto =
        termino === '' ||
        local.nombre.toLowerCase().includes(termino) ||
        local.categoria.toLowerCase().includes(termino) ||
        local.direccion.toLowerCase().includes(termino);
      return coincideEstado && coincideTexto;
    });
  }, [locales, busqueda, filtroEstado]);

  const cerrarSesion = async () => {
    const supabase = crearClienteSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const cambiarEstadoRapido = async (
    local: LocalAdminConMetricas,
    nuevoEstado: EstadoLocal
  ) => {
    setProcesandoId(local.id);
    try {
      const res = await fetch(`/api/v1/admin/locales/${local.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const data = (await res.json()) as { local?: LocalAdminConMetricas };
      if (res.ok && data.local) {
        setLocales((prev) =>
          prev.map((item) => (item.id === local.id ? data.local! : item))
        );
      }
    } finally {
      setProcesandoId(null);
    }
  };

  const eliminarLocal = async (local: LocalAdminConMetricas) => {
    if (
      !window.confirm(
        `¿Seguro que deseas eliminar "${local.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setProcesandoId(local.id);
    try {
      const res = await fetch(`/api/v1/admin/locales/${local.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLocales((prev) => prev.filter((item) => item.id !== local.id));
      }
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              JAKU · Administración
            </span>
            <h1 className="text-lg font-bold text-slate-900">
              Negocios resgistrados de Huamanga
            </h1>
            <p className="text-xs text-slate-500">
              Conectado como {perfilAdmin.nombre} ({perfilAdmin.rol})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/explorar"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver Negocios Huamanga
            </Link>
            <button
              type="button"
              onClick={cerrarSesion}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-5 px-4 pt-6">
        {mostrandoFormulario ? (
          <FormularioLocalAdmin
            localInicial={localEditando}
            alCancelar={() => {
              setMostrandoFormulario(false);
              setLocalEditando(null);
            }}
            alGuardarExito={(localGuardado) => {
              setLocales((prev) => {
                const existe = prev.some((l) => l.id === localGuardado.id);
                if (existe) {
                  return prev.map((l) =>
                    l.id === localGuardado.id ? localGuardado : l
                  );
                }
                return [localGuardado, ...prev];
              });
              setMostrandoFormulario(false);
              setLocalEditando(null);
            }}
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-wrap gap-2">
                <div className="relative min-w-[220px] flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar local, categoría o dirección..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={filtroEstado}
                  onChange={(e) =>
                    setFiltroEstado(e.target.value as 'todos' | EstadoLocal)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                >
                  <option value="todos">Todos ({locales.length})</option>
                  <option value="verificado">Verificados</option>
                  <option value="borrador">Borradores</option>
                  <option value="oculto">Ocultos</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLocalEditando(null);
                  setMostrandoFormulario(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Nuevo local
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Local</th>
                      <th className="px-4 py-3">Presupuesto</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Analítica</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localesFiltrados.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-sm text-slate-500"
                        >
                          No hay locales que coincidan con el filtro actual.
                        </td>
                      </tr>
                    ) : (
                      localesFiltrados.map((local) => (
                        <tr key={local.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900">
                              {local.nombre}
                            </p>
                            <p className="text-xs text-slate-500">
                              {local.categoria} · {local.direccion}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {formatearRangoSimbolo(local.rango)} ·{' '}
                            {formatearMoneda(local.precio_ref)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                local.estado === 'verificado'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : local.estado === 'borrador'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {local.estado === 'verificado' && (
                                <BadgeCheck className="h-3.5 w-3.5" />
                              )}
                              {local.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            <div>Vistas: {local.metricas.vistas}</div>
                            <div>
                              Llegar: {local.metricas.comoLlegar} · WA:{' '}
                              {local.metricas.compartidos}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1.5">
                              {local.estado !== 'verificado' ? (
                                <button
                                  type="button"
                                  disabled={procesandoId === local.id}
                                  onClick={() =>
                                    void cambiarEstadoRapido(
                                      local,
                                      'verificado'
                                    )
                                  }
                                  title="Publicar"
                                  className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={procesandoId === local.id}
                                  onClick={() =>
                                    void cambiarEstadoRapido(local, 'oculto')
                                  }
                                  title="Ocultar"
                                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100"
                                >
                                  <EyeOff className="h-4 w-4" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setLocalEditando(local);
                                  setMostrandoFormulario(true);
                                }}
                                title="Editar"
                                className="rounded-lg border border-slate-200 bg-white p-1.5 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                disabled={procesandoId === local.id}
                                onClick={() => void eliminarLocal(local)}
                                title="Eliminar"
                                className="rounded-lg border border-slate-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
