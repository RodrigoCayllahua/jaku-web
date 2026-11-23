export type EstadoLocal = 'borrador' | 'verificado' | 'oculto';

export type RangoPresupuesto = 1 | 2 | 3;

export type TipoEvento = 'vista' | 'como_llegar' | 'compartir';

export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Horario {
  id: string;
  local_id: string;
  dia: DiaSemana;
  abre: string;
  cierra: string;
}

export interface HorarioItem {
  dia: DiaSemana;
  abre: string;
  cierra: string;
}

export interface Foto {
  id: string;
  local_id: string;
  url: string;
  orden: number;
}

export interface PerfilAdmin {
  id: string;
  nombre: string;
  rol: string;
}

export interface Evento {
  id: string;
  local_id: string;
  tipo: TipoEvento;
  fecha: string;
}

export interface LocalBase {
  id: string;
  nombre: string;
  slug: string;
  categoria: string;
  descripcion: string | null;
  precio_ref: number;
  rango: RangoPresupuesto;
  direccion: string;
  telefono: string | null;
  estado: EstadoLocal;
  actualizado: string;
}

export interface LocalBusqueda extends LocalBase {
  lat: number;
  lng: number;
  distancia_metros: number | null;
  foto_principal: string | null;
  horarios: HorarioItem[];
}

export interface LocalDetalle extends LocalBase {
  lat: number;
  lng: number;
  fotos: Foto[];
  horarios: Horario[];
}

export type OrdenCatalogo = 'cercania' | 'precio_asc' | 'precio_desc' | 'recientes';

export interface FiltrosCatalogo {
  precioMax?: number;
  rango?: RangoPresupuesto;
  categoria?: string;
  lat?: number;
  lng?: number;
  radioMetros?: number;
  orden?: OrdenCatalogo;
  pagina?: number;
  limite?: number;
}

export interface ApiErrorPayload {
  error: {
    codigo: string;
    mensaje: string;
  };
}

export interface RespuestaPaginadaLocales {
  locales: LocalBusqueda[];
  pagina: number;
  limite: number;
  hayMas: boolean;
}
