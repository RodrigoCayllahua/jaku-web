'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import type { Foto } from '@/compartido/tipos';

interface PropiedadesGaleriaFotos {
  fotos: Foto[];
  nombreLocal: string;
}

export function GaleriaFotos({ fotos, nombreLocal }: PropiedadesGaleriaFotos) {
  const [indiceActivo, setIndiceActivo] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="flex h-60 w-full flex-col items-center justify-center rounded-2xl bg-slate-100 text-slate-400 sm:h-80">
        <ImageOff className="mb-2 h-10 w-10" />
        <span className="text-sm font-medium">Sin fotos registradas</span>
      </div>
    );
  }

  const fotoActiva = fotos[indiceActivo] ?? fotos[0];

  return (
    <div className="space-y-3">
      <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-slate-100 sm:h-96">
        <Image
          src={fotoActiva.url}
          alt={`${nombreLocal} - Foto ${indiceActivo + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
        />
        {fotos.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {indiceActivo + 1} / {fotos.length}
          </span>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {fotos.map((foto, indice) => {
            const seleccionada = indice === indiceActivo;
            return (
              <button
                key={foto.id}
                type="button"
                onClick={() => setIndiceActivo(indice)}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  seleccionada
                    ? 'border-blue-600 ring-2 ring-blue-100'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <Image
                  src={foto.url}
                  alt={`${nombreLocal} miniatura ${indice + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
