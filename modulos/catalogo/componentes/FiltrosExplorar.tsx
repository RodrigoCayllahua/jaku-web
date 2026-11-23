'use client';

import {
  List,
  Loader2,
  Map as MapIcon,
  LocateFixed,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  CATEGORIAS_LOCAL,
  OPCIONES_RADIO_METROS,
  RANGOS_PRESUPUESTO,
} from '@/compartido/constantes/huamanga';
import type { OrdenCatalogo, RangoPresupuesto } from '@/compartido/tipos';

export type ModoVistaExplorar = 'lista' | 'mapa';

interface PropiedadesFiltrosExplorar {
  rangoSeleccionado?: RangoPresupuesto;
  precioMaxTexto: string;
  categoriaSeleccionada: string;
  ordenSeleccionado: OrdenCatalogo;
  cercaniaActiva: boolean;
  ubicacionDenegada: boolean;
  cargandoUbicacion: boolean;
  radioMetros?: number;
  modoVista: ModoVistaExplorar;
  alCambiarRango: (rango?: RangoPresupuesto) => void;
  alCambiarPrecioMax: (valor: string) => void;
  alCambiarCategoria: (categoria: string) => void;
  alCambiarOrden: (orden: OrdenCatalogo) => void;
  alActivarCercania: () => void;
  alCambiarRadio: (radio?: number) => void;
  alCambiarModoVista: (modo: ModoVistaExplorar) => void;
  alLimpiarFiltros: () => void;
}

export function FiltrosExplorar({
  rangoSeleccionado,
  precioMaxTexto,
  categoriaSeleccionada,
  ordenSeleccionado,
  cercaniaActiva,
  ubicacionDenegada,
  cargandoUbicacion,
  radioMetros,
  modoVista,
  alCambiarRango,
  alCambiarPrecioMax,
  alCambiarCategoria,
  alCambiarOrden,
  alActivarCercania,
  alCambiarRadio,
  alCambiarModoVista,
  alLimpiarFiltros,
}: PropiedadesFiltrosExplorar) {
  const hayFiltrosActivos =
    Boolean(rangoSeleccionado) ||
    Boolean(precioMaxTexto) ||
    Boolean(categoriaSeleccionada) ||
    cercaniaActiva;

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
          Tu presupuesto por persona
        </div>

        <div className="flex items-center rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => alCambiarModoVista('lista')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              modoVista === 'lista'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Lista
          </button>
          <button
            type="button"
            onClick={() => alCambiarModoVista('mapa')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              modoVista === 'mapa'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            Mapa
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {RANGOS_PRESUPUESTO.map((rango) => {
          const activo = rangoSeleccionado === rango.valor;
          return (
            <button
              key={rango.valor}
              type="button"
              onClick={() =>
                alCambiarRango(activo ? undefined : rango.valor)
              }
              className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                activo
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50/40'
              }`}
            >
              <span className="font-bold">{rango.simbolo}</span>{' '}
              <span className="font-medium">{rango.etiqueta}</span>{' '}
              <span className={activo ? 'text-blue-100' : 'text-slate-500'}>
                ({rango.descripcion})
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="filtro-monto-max"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Monto máximo (S/)
          </label>
          <input
            id="filtro-monto-max"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="Ej. 25"
            value={precioMaxTexto}
            onChange={(e) => alCambiarPrecioMax(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="filtro-categoria"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Categoría
          </label>
          <select
            id="filtro-categoria"
            value={categoriaSeleccionada}
            onChange={(e) => alCambiarCategoria(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS_LOCAL.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filtro-orden"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Ordenar por
          </label>
          <select
            id="filtro-orden"
            value={ordenSeleccionado}
            onChange={(e) => alCambiarOrden(e.target.value as OrdenCatalogo)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="recientes">Recomendados</option>
            <option value="cercania">Más cercanos primero</option>
            <option value="precio_asc">Menor precio</option>
            <option value="precio_desc">Mayor precio</option>
          </select>
        </div>

        <div>
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Cercanía y radio
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={alActivarCercania}
              disabled={cargandoUbicacion}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                cercaniaActiva
                  ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              {cargandoUbicacion ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LocateFixed className="h-3.5 w-3.5" />
              )}
              Más cercanos
            </button>

            {cercaniaActiva && (
              <select
                aria-label="Radio de búsqueda"
                value={radioMetros ?? ''}
                onChange={(e) =>
                  alCambiarRadio(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="">Todo</option>
                {OPCIONES_RADIO_METROS.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {ubicacionDenegada && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          No se obtuvo permiso de ubicación en tu navegador. Mostrando lugares
          ordenados desde la Plaza Mayor de Huamanga.
        </p>
      )}

      {hayFiltrosActivos && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={alLimpiarFiltros}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  );
}
