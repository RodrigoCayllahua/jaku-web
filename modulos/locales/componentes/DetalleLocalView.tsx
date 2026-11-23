import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  MapPin,
  Phone,
  Wallet,
} from 'lucide-react';
import {
  NOMBRES_DIAS_SEMANA,
  ORDEN_DIAS_SEMANA,
} from '@/compartido/constantes/huamanga';
import type { LocalDetalle } from '@/compartido/tipos';
import {
  formatearMoneda,
  formatearRangoSimbolo,
  obtenerEtiquetaRango,
} from '@/compartido/utilidades/formato';
import {
  evaluarEstadoHorarioHoy,
  formatearHoraCorta,
} from '@/compartido/utilidades/horario';
import { MapaDetalle } from '@/modulos/mapa/componentes/MapaDetalle';
import { BotonComoLlegar } from '@/modulos/locales/componentes/BotonComoLlegar';
import { BotonCompartirWhatsApp } from '@/modulos/locales/componentes/BotonCompartirWhatsApp';
import { GaleriaFotos } from '@/modulos/locales/componentes/GaleriaFotos';
import { RastreadorVista } from '@/modulos/locales/componentes/RastreadorVista';

interface PropiedadesDetalleLocal {
  local: LocalDetalle;
}

export function DetalleLocalView({ local }: PropiedadesDetalleLocal) {
  const estadoHorario = evaluarEstadoHorarioHoy(local.horarios);
  const simboloRango = formatearRangoSimbolo(local.rango);
  const etiquetaRango = obtenerEtiquetaRango(local.rango);

  return (
    <main className="min-h-screen bg-slate-50 pb-28 sm:pb-12">
      <RastreadorVista localId={local.id} />

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link
            href="/explorar"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a explorar
          </Link>
          <span className="text-sm font-bold tracking-tight text-blue-600">
            JAKU
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-4 pt-5">
        <GaleriaFotos fotos={local.fotos} nombreLocal={local.nombre} />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {local.categoria}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verificado
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                estadoHorario.abiertoAhora
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {estadoHorario.estadoTexto}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {local.nombre}
          </h1>

          {local.descripcion && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              {local.descripcion}
            </p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
              <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Presupuesto referencial
                </p>
                <p className="mt-0.5 text-base font-bold text-slate-900">
                  {formatearMoneda(local.precio_ref)}{' '}
                  <span className="text-sm font-medium text-slate-600">
                    ({simboloRango} · {etiquetaRango})
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Horario de hoy (Huamanga)
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">
                  {estadoHorario.horarioHoyTexto}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Dirección exacta
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">
                  {local.direccion}
                </p>
              </div>
            </div>

            {local.telefono && (
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Teléfono / Contacto
                  </p>
                  <a
                    href={`tel:${local.telefono}`}
                    className="mt-0.5 inline-block text-sm font-semibold text-blue-700 hover:underline"
                  >
                    {local.telefono}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 hidden gap-3 sm:flex">
            <BotonComoLlegar
              localId={local.id}
              lat={local.lat}
              lng={local.lng}
              className="flex-1"
            />
            <BotonCompartirWhatsApp
              localId={local.id}
              nombre={local.nombre}
              slug={local.slug}
              rango={local.rango}
              precioRef={local.precio_ref}
              direccion={local.direccion}
              className="flex-1"
            />
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              Horarios de atención
            </h2>
            {local.horarios.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No hay horarios semanales registrados.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {ORDEN_DIAS_SEMANA.map((dia) => {
                  const registro = local.horarios.find((h) => h.dia === dia);
                  const esHoy = dia === estadoHorario.diaActualLima;
                  return (
                    <li
                      key={dia}
                      className={`flex items-center justify-between py-2.5 text-sm ${
                        esHoy ? 'font-semibold text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <span>
                        {NOMBRES_DIAS_SEMANA[dia]}
                        {esHoy ? ' (Hoy)' : ''}
                      </span>
                      <span>
                        {registro
                          ? `${formatearHoraCorta(registro.abre)} - ${formatearHoraCorta(
                              registro.cierra
                            )}`
                          : 'Cerrado'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-slate-900">
              Ubicación en Huamanga
            </h2>
            <MapaDetalle
              nombre={local.nombre}
              direccion={local.direccion}
              lat={local.lat}
              lng={local.lng}
            />
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-4xl flex-col gap-2">
          <div className="flex gap-2">
            <BotonComoLlegar
              localId={local.id}
              lat={local.lat}
              lng={local.lng}
              className="shrink-0"
            />
            <BotonCompartirWhatsApp
              localId={local.id}
              nombre={local.nombre}
              slug={local.slug}
              rango={local.rango}
              precioRef={local.precio_ref}
              direccion={local.direccion}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
