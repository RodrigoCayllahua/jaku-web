'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import {
  CATEGORIAS_LOCAL,
  NOMBRES_DIAS_CORTOS,
  ORDEN_DIAS_SEMANA,
  PLAZA_ARMAS_HUAMANGA,
  RANGOS_PRESUPUESTO,
} from '@/compartido/constantes/huamanga';
import type {
  DiaSemana,
  EstadoLocal,
  RangoPresupuesto,
} from '@/compartido/tipos';
import { formatearHoraCorta } from '@/compartido/utilidades/horario';
import type { LocalAdminConMetricas } from '@/modulos/admin/servicio';
import { SelectorUbicacion } from '@/modulos/mapa/componentes/SelectorUbicacion';

interface PropiedadesFormularioLocalAdmin {
  localInicial?: LocalAdminConMetricas | null;
  alGuardarExito: (localGuardado: LocalAdminConMetricas) => void;
  alCancelar: () => void;
}

interface HorarioEditable {
  dia: DiaSemana;
  activo: boolean;
  abre: string;
  cierra: string;
}

function crearHorariosIniciales(
  local?: LocalAdminConMetricas | null
): HorarioEditable[] {
  return ORDEN_DIAS_SEMANA.map((dia) => {
    const encontrado = local?.horarios.find((h) => h.dia === dia);
    return {
      dia,
      activo: Boolean(encontrado),
      abre: encontrado ? formatearHoraCorta(encontrado.abre) : '09:00',
      cierra: encontrado ? formatearHoraCorta(encontrado.cierra) : '22:00',
    };
  });
}

function sugerirRangoPorPrecio(precio: number): RangoPresupuesto {
  if (precio <= 20) return 1;
  if (precio <= 50) return 2;
  return 3;
}

export function FormularioLocalAdmin({
  localInicial,
  alGuardarExito,
  alCancelar,
}: PropiedadesFormularioLocalAdmin) {
  const esEdicion = Boolean(localInicial);

  const [nombre, setNombre] = useState(localInicial?.nombre ?? '');
  const [categoria, setCategoria] = useState(
    localInicial?.categoria ?? CATEGORIAS_LOCAL[0]
  );
  const [descripcion, setDescripcion] = useState(
    localInicial?.descripcion ?? ''
  );
  const [precioRef, setPrecioRef] = useState(
    localInicial ? String(localInicial.precio_ref) : '18'
  );
  const [rango, setRango] = useState<RangoPresupuesto>(
    localInicial?.rango ?? 1
  );
  const [direccion, setDireccion] = useState(localInicial?.direccion ?? '');
  const [telefono, setTelefono] = useState(localInicial?.telefono ?? '');
  const [estado, setEstado] = useState<EstadoLocal>(
    localInicial?.estado ?? 'verificado'
  );
  const [lat, setLat] = useState(
    localInicial?.lat ?? PLAZA_ARMAS_HUAMANGA.lat
  );
  const [lng, setLng] = useState(
    localInicial?.lng ?? PLAZA_ARMAS_HUAMANGA.lng
  );
  const [horarios, setHorarios] = useState<HorarioEditable[]>(() =>
    crearHorariosIniciales(localInicial)
  );
  const [fotosUrls, setFotosUrls] = useState<string[]>(
    localInicial?.fotos.map((f) => f.url) ?? []
  );

  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const manejarCambioPrecio = (valor: string) => {
    setPrecioRef(valor);
    const num = Number(valor);
    if (Number.isFinite(num) && num > 0) {
      setRango(sugerirRangoPorPrecio(num));
    }
  };

  const manejarSubidaFotos = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivos = evento.target.files;
    if (!archivos || archivos.length === 0) {
      return;
    }

    setSubiendoFoto(true);
    setErrorMsg(null);

    try {
      const nuevasUrls: string[] = [];

      for (const archivo of Array.from(archivos)) {
        const formData = new FormData();
        formData.append('archivo', archivo);

        const res = await fetch('/api/v1/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const payload = (await res.json()) as {
          url?: string;
          error?: { mensaje: string };
        };

        if (!res.ok || !payload.url) {
          throw new Error(
            payload.error?.mensaje ?? 'Error al subir una de las imágenes.'
          );
        }

        nuevasUrls.push(payload.url);
      }

      setFotosUrls((prev) => [...prev, ...nuevasUrls]);
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : 'Error al subir fotos.'
      );
    } finally {
      setSubiendoFoto(false);
      evento.target.value = '';
    }
  };

  const aplicarHorarioATodos = () => {
    const base = horarios.find((h) => h.activo) ?? horarios[0];
    setHorarios((prev) =>
      prev.map((h) => ({
        ...h,
        activo: true,
        abre: base.abre,
        cierra: base.cierra,
      }))
    );
  };

  const manejarSubmit = async (evento: FormEvent) => {
    evento.preventDefault();
    setGuardando(true);
    setErrorMsg(null);

    try {
      const payload = {
        nombre: nombre.trim(),
        categoria,
        descripcion: descripcion.trim() || null,
        precio_ref: Number(precioRef),
        rango,
        direccion: direccion.trim(),
        lat,
        lng,
        telefono: telefono.trim() || null,
        estado,
        horarios: horarios
          .filter((h) => h.activo)
          .map((h) => ({
            dia: h.dia,
            abre: h.abre,
            cierra: h.cierra,
          })),
        fotos: fotosUrls.map((url, idx) => ({
          url,
          orden: idx,
        })),
      };

      const endpoint = esEdicion
        ? `/api/v1/admin/locales/${localInicial?.id}`
        : '/api/v1/admin/locales';
      const metodo = esEdicion ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        local?: LocalAdminConMetricas;
        error?: { mensaje: string };
      };

      if (!res.ok || !data.local) {
        throw new Error(
          data.error?.mensaje ?? 'No se pudo guardar el local.'
        );
      }

      alGuardarExito(data.local);
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : 'Error al guardar el local.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-900">
          {esEdicion ? `Editar: ${localInicial?.nombre}` : 'Nuevo local aliado'}
        </h2>
        <button
          type="button"
          onClick={alCancelar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={manejarSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Nombre del local *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Café Andino"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Categoría *
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
            >
              {CATEGORIAS_LOCAL.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Precio referencial por persona (S/) *
            </label>
            <input
              type="number"
              required
              min={1}
              step="0.5"
              value={precioRef}
              onChange={(e) => manejarCambioPrecio(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Rango de presupuesto *
            </label>
            <select
              value={rango}
              onChange={(e) =>
                setRango(Number(e.target.value) as RangoPresupuesto)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
            >
              {RANGOS_PRESUPUESTO.map((r) => (
                <option key={r.valor} value={r.valor}>
                  {r.simbolo} · {r.etiqueta} ({r.descripcion})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Dirección exacta *
            </label>
            <input
              type="text"
              required
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej. Jr. 28 de Julio 145, Huamanga"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Teléfono / WhatsApp (opcional)
            </label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. 966123456"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Descripción breve
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Platos destacados, ambiente o promociones referenciales..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700">
              Ubicación en Huamanga (haz clic o arrastra el pin)
            </label>
            <div className="flex gap-2 text-xs">
              <input
                type="number"
                step="0.000001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-slate-800"
                aria-label="Latitud"
              />
              <input
                type="number"
                step="0.000001"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-slate-800"
                aria-label="Longitud"
              />
            </div>
          </div>
          <SelectorUbicacion
            lat={lat}
            lng={lng}
            alCambiar={(nuevaLat, nuevaLng) => {
              setLat(nuevaLat);
              setLng(nuevaLng);
            }}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Horarios de atención
            </label>
            <button
              type="button"
              onClick={aplicarHorarioATodos}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Copiar primer horario a todos los días
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {horarios.map((item, idx) => (
              <div
                key={item.dia}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
              >
                <label className="flex items-center gap-2 font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={item.activo}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHorarios((prev) =>
                        prev.map((h, i) =>
                          i === idx ? { ...h, activo: checked } : h
                        )
                      );
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  {NOMBRES_DIAS_CORTOS[item.dia]}
                </label>

                {item.activo ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={item.abre}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHorarios((prev) =>
                          prev.map((h, i) =>
                            i === idx ? { ...h, abre: val } : h
                          )
                        );
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="time"
                      value={item.cierra}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHorarios((prev) =>
                          prev.map((h, i) =>
                            i === idx ? { ...h, cierra: val } : h
                          )
                        );
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                    />
                  </div>
                ) : (
                  <span className="text-slate-400">Cerrado</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Fotos del local (bucket fotos-locales)
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              {subiendoFoto ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {subiendoFoto ? 'Subiendo...' : 'Subir fotos'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={subiendoFoto}
                onChange={manejarSubidaFotos}
                className="hidden"
              />
            </label>
          </div>

          {fotosUrls.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {fotosUrls.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="relative h-24 w-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                >
                  <Image
                    src={url}
                    alt={`Foto ${idx + 1}`}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFotosUrls((prev) => prev.filter((_, i) => i !== idx))
                    }
                    aria-label="Eliminar foto"
                    className="absolute right-1 top-1 rounded-full bg-slate-900/75 p-1 text-white hover:bg-rose-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">
              Estado:
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoLocal)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
            >
              <option value="verificado">Verificado (Público)</option>
              <option value="borrador">Borrador</option>
              <option value="oculto">Oculto</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={alCancelar}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || subiendoFoto}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {guardando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {estado === 'verificado' ? 'Publicar local' : 'Guardar local'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
