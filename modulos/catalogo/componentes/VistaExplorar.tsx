'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, SearchX } from 'lucide-react';
import {
  LIMITE_PAGINA_CATALOGO,
  PLAZA_ARMAS_HUAMANGA,
  RADIO_DEFECTO_METROS,
} from '@/compartido/constantes/huamanga';
import type {
  LocalBusqueda,
  OrdenCatalogo,
  RangoPresupuesto,
  RespuestaPaginadaLocales,
} from '@/compartido/tipos';
import {
  FiltrosExplorar,
  type ModoVistaExplorar,
} from '@/modulos/catalogo/componentes/FiltrosExplorar';
import { TarjetaLocal } from '@/modulos/catalogo/componentes/TarjetaLocal';
import { MapaLocales } from '@/modulos/mapa/componentes/MapaLocales';

interface PropiedadesVistaExplorar {
  localesIniciales: LocalBusqueda[];
  hayMasInicial: boolean;
}

export function VistaExplorar({
  localesIniciales,
  hayMasInicial,
}: PropiedadesVistaExplorar) {
  const [locales, setLocales] = useState<LocalBusqueda[]>(localesIniciales);
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(hayMasInicial);
  const [cargando, setCargando] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rango, setRango] = useState<RangoPresupuesto | undefined>(undefined);
  const [precioMaxTexto, setPrecioMaxTexto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [orden, setOrden] = useState<OrdenCatalogo>('recientes');
  const [modoVista, setModoVista] = useState<ModoVistaExplorar>('lista');

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [tieneUbicacionUsuario, setTieneUbicacionUsuario] = useState(false);
  const [ubicacionDenegada, setUbicacionDenegada] = useState(false);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
  const [radioMetros, setRadioMetros] = useState<number | undefined>(undefined);

  const esPrimerRender = useRef(true);

  const consultarLocales = useCallback(
    async (
      paginaObjetivo: number,
      agregarAlFinal: boolean,
      coordenadasOverride?: { lat: number; lng: number } | null,
      ordenOverride?: OrdenCatalogo,
      radioOverride?: number | undefined
    ) => {
      if (agregarAlFinal) {
        setCargandoMas(true);
      } else {
        setCargando(true);
      }
      setErrorMsg(null);

      try {
        const params = new URLSearchParams();
        const precioNum = Number(precioMaxTexto);
        if (precioMaxTexto.trim() !== '' && Number.isFinite(precioNum) && precioNum > 0) {
          params.set('precio_max', String(precioNum));
        }
        if (rango) {
          params.set('rango', String(rango));
        }
        if (categoria) {
          params.set('categoria', categoria);
        }

        const coordsUsadas =
          coordenadasOverride !== undefined ? coordenadasOverride : coords;
        const ordenUsado = ordenOverride ?? orden;
        const radioUsado =
          radioOverride !== undefined ? radioOverride : radioMetros;

        if (coordsUsadas) {
          params.set('lat', String(coordsUsadas.lat));
          params.set('lng', String(coordsUsadas.lng));
        }
        if (radioUsado) {
          params.set('radio', String(radioUsado));
        }
        params.set('orden', ordenUsado);
        params.set('pagina', String(paginaObjetivo));
        params.set('limite', String(LIMITE_PAGINA_CATALOGO));

        const respuesta = await fetch(`/api/v1/locales?${params.toString()}`);
        if (!respuesta.ok) {
          throw new Error('No pudimos cargar los lugares en este momento.');
        }

        const datos = (await respuesta.json()) as RespuestaPaginadaLocales;

        setLocales((anteriores) =>
          agregarAlFinal ? [...anteriores, ...datos.locales] : datos.locales
        );
        setPagina(datos.pagina);
        setHayMas(datos.hayMas);
      } catch (error) {
        setErrorMsg(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error al buscar lugares.'
        );
      } finally {
        setCargando(false);
        setCargandoMas(false);
      }
    },
    [categoria, coords, orden, precioMaxTexto, radioMetros, rango]
  );

  useEffect(() => {
    if (esPrimerRender.current) {
      esPrimerRender.current = false;
      return;
    }

    const temporizador = setTimeout(() => {
      void consultarLocales(1, false);
    }, 220);

    return () => clearTimeout(temporizador);
  }, [rango, precioMaxTexto, categoria, orden, coords, radioMetros, consultarLocales]);

  const activarCercania = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setUbicacionDenegada(true);
      setTieneUbicacionUsuario(false);
      setCoords({
        lat: PLAZA_ARMAS_HUAMANGA.lat,
        lng: PLAZA_ARMAS_HUAMANGA.lng,
      });
      setOrden('cercania');
      setRadioMetros((prev) => prev ?? RADIO_DEFECTO_METROS);
      return;
    }

    setCargandoUbicacion(true);
    setUbicacionDenegada(false);

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const nuevaUbicacion = {
          lat: posicion.coords.latitude,
          lng: posicion.coords.longitude,
        };
        setCargandoUbicacion(false);
        setTieneUbicacionUsuario(true);
        setCoords(nuevaUbicacion);
        setOrden('cercania');
        setRadioMetros((prev) => prev ?? RADIO_DEFECTO_METROS);
      },
      () => {
        setCargandoUbicacion(false);
        setUbicacionDenegada(true);
        setTieneUbicacionUsuario(false);
        setCoords({
          lat: PLAZA_ARMAS_HUAMANGA.lat,
          lng: PLAZA_ARMAS_HUAMANGA.lng,
        });
        setOrden('cercania');
        setRadioMetros((prev) => prev ?? RADIO_DEFECTO_METROS);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  };

  const manejarCambioOrden = (nuevoOrden: OrdenCatalogo) => {
    if (nuevoOrden === 'cercania' && !coords) {
      activarCercania();
      return;
    }
    setOrden(nuevoOrden);
  };

  const limpiarFiltros = () => {
    setRango(undefined);
    setPrecioMaxTexto('');
    setCategoria('');
    setOrden('recientes');
    setCoords(null);
    setTieneUbicacionUsuario(false);
    setUbicacionDenegada(false);
    setRadioMetros(undefined);
  };

  return (
    <div className="space-y-5">
      <FiltrosExplorar
        rangoSeleccionado={rango}
        precioMaxTexto={precioMaxTexto}
        categoriaSeleccionada={categoria}
        ordenSeleccionado={orden}
        cercaniaActiva={Boolean(coords)}
        ubicacionDenegada={ubicacionDenegada}
        cargandoUbicacion={cargandoUbicacion}
        radioMetros={radioMetros}
        modoVista={modoVista}
        alCambiarRango={(nuevoRango) => {
          setRango(nuevoRango);
          if (nuevoRango) {
            setPrecioMaxTexto('');
          }
        }}
        alCambiarPrecioMax={(valor) => {
          setPrecioMaxTexto(valor);
          if (valor.trim() !== '') {
            setRango(undefined);
          }
        }}
        alCambiarCategoria={setCategoria}
        alCambiarOrden={manejarCambioOrden}
        alActivarCercania={activarCercania}
        alCambiarRadio={setRadioMetros}
        alCambiarModoVista={setModoVista}
        alLimpiarFiltros={limpiarFiltros}
      />

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      {cargando ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="h-40 rounded-xl bg-slate-200" />
              <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : locales.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <SearchX className="mb-3 h-10 w-10 text-slate-400" />
          <h2 className="text-base font-bold text-slate-900">
            No encontramos lugares con ese filtro
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-600">
            Prueba ampliando tu presupuesto, eligiendo otra categoría o
            aumentando el radio de búsqueda en Huamanga.
          </p>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Ver todos los lugares
          </button>
        </div>
      ) : modoVista === 'mapa' ? (
        <MapaLocales
          locales={locales}
          centroLat={coords?.lat ?? PLAZA_ARMAS_HUAMANGA.lat}
          centroLng={coords?.lng ?? PLAZA_ARMAS_HUAMANGA.lng}
          tieneUbicacionUsuario={tieneUbicacionUsuario}
          radioMetros={radioMetros}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locales.map((local) => (
              <TarjetaLocal key={local.id} local={local} />
            ))}
          </div>

          {hayMas && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                disabled={cargandoMas}
                onClick={() => void consultarLocales(pagina + 1, true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              >
                {cargandoMas && <Loader2 className="h-4 w-4 animate-spin" />}
                Cargar más lugares
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
