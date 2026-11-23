import Image from 'next/image';
import Link from 'next/link';
import { Clock, ImageOff, MapPin } from 'lucide-react';
import type { LocalBusqueda } from '@/compartido/tipos';
import {
  formatearDistancia,
  formatearMoneda,
  formatearRangoSimbolo,
} from '@/compartido/utilidades/formato';
import { evaluarEstadoHorarioHoy } from '@/compartido/utilidades/horario';

interface PropiedadesTarjetaLocal {
  local: LocalBusqueda;
}

export function TarjetaLocal({ local }: PropiedadesTarjetaLocal) {
  const estadoHorario = evaluarEstadoHorarioHoy(local.horarios);
  const distancia = formatearDistancia(local.distancia_metros);
  const simboloRango = formatearRangoSimbolo(local.rango);

  return (
    <Link
      href={`/local/${local.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
    >
      <div className="relative h-44 w-full bg-slate-100">
        {local.foto_principal ? (
          <Image
            src={local.foto_principal}
            alt={local.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
            <ImageOff className="mb-1 h-7 w-7" />
            <span className="text-xs">Sin foto</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur">
            {local.categoria}
          </span>
        </div>

        <div className="absolute right-3 top-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
              estadoHorario.abiertoAhora
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900/75 text-white'
            }`}
          >
            {estadoHorario.abiertoAhora ? 'Abierto' : 'Cerrado'}
          </span>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow">
            {simboloRango} · {formatearMoneda(local.precio_ref)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-bold text-slate-900 group-hover:text-blue-700">
            {local.nombre}
          </h3>

          <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-600">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{local.direccion}</span>
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
          <span className="inline-flex items-center gap-1 text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {estadoHorario.abre && estadoHorario.cierra
              ? `${estadoHorario.abre} - ${estadoHorario.cierra}`
              : 'Ver horarios'}
          </span>

          {distancia && (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 font-semibold text-orange-700">
              a {distancia}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
