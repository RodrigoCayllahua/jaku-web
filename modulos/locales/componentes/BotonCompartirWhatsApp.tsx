'use client';

import { useState } from 'react';
import { Check, Share2, MessageCircle } from 'lucide-react';
import {
  construirDatosWebShare,
  construirMensajeWhatsApp,
  construirUrlWhatsApp,
} from '@/compartido/utilidades/compartir';
import type { RangoPresupuesto } from '@/compartido/tipos';
import { enviarEventoAnalitica } from '@/modulos/analitica/cliente';

interface PropiedadesBotonCompartir {
  localId: string;
  nombre: string;
  slug: string;
  rango: RangoPresupuesto;
  precioRef: number;
  direccion: string;
  className?: string;
}

export function BotonCompartirWhatsApp({
  localId,
  nombre,
  slug,
  rango,
  precioRef,
  direccion,
  className = '',
}: PropiedadesBotonCompartir) {
  const [copiado, setCopiado] = useState(false);

  const obtenerUrlLocal = (): string => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/local/${slug}`;
    }
    return `https://jaku.pe/local/${slug}`;
  };

  const manejarCompartirWhatsApp = () => {
    enviarEventoAnalitica(localId, 'compartir');
    const urlLocal = obtenerUrlLocal();
    const mensaje = construirMensajeWhatsApp({
      nombre,
      rango,
      precioRef,
      direccion,
      urlLocal,
    });
    const urlWa = construirUrlWhatsApp(mensaje);
    window.open(urlWa, '_blank', 'noopener,noreferrer');
  };

  const manejarCompartirNativo = async () => {
    enviarEventoAnalitica(localId, 'compartir');
    const urlLocal = obtenerUrlLocal();
    const datos = construirDatosWebShare({
      nombre,
      rango,
      precioRef,
      direccion,
      urlLocal,
    });

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(datos);
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(urlLocal);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } else {
      manejarCompartirWhatsApp();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={manejarCompartirWhatsApp}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99]"
      >
        <MessageCircle className="h-4 w-4" />
        Compartir por WhatsApp
      </button>
      <button
        type="button"
        onClick={manejarCompartirNativo}
        aria-label="Compartir enlace del local"
        title="Más opciones para compartir"
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        {copiado ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
