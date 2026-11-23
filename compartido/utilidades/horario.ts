import {
  NOMBRES_DIAS_SEMANA,
  ZONA_HORARIA_PERU,
} from '@/compartido/constantes/huamanga';
import type { DiaSemana, HorarioItem } from '@/compartido/tipos';

export interface EstadoHorarioHoy {
  abiertoAhora: boolean;
  estadoTexto: 'Abierto ahora' | 'Cerrado ahora' | 'Horario no disponible';
  horarioHoyTexto: string;
  abre: string | null;
  cierra: string | null;
  diaActualLima: DiaSemana;
}

interface TiempoLimaActual {
  dia: DiaSemana;
  minutosDesdeMedianoche: number;
}

const MAPA_DIAS_INGLES: Record<string, DiaSemana> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function formatearHoraCorta(hora: string): string {
  const partes = hora.trim().split(':');
  if (partes.length < 2) {
    return hora;
  }
  return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
}

function convertirHoraAMinutos(hora: string): number | null {
  const partes = hora.trim().split(':');
  if (partes.length < 2) {
    return null;
  }
  const horas = Number.parseInt(partes[0], 10);
  const minutos = Number.parseInt(partes[1], 10);

  if (
    Number.isNaN(horas) ||
    Number.isNaN(minutos) ||
    horas < 0 ||
    horas > 23 ||
    minutos < 0 ||
    minutos > 59
  ) {
    return null;
  }

  return horas * 60 + minutos;
}

export function obtenerTiempoActualLima(fechaReferencia: Date = new Date()): TiempoLimaActual {
  const formateador = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA_HORARIA_PERU,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const partes = formateador.formatToParts(fechaReferencia);
  const weekday = partes.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hourStr = partes.find((p) => p.type === 'hour')?.value ?? '0';
  const minuteStr = partes.find((p) => p.type === 'minute')?.value ?? '0';

  const dia = MAPA_DIAS_INGLES[weekday] ?? 1;
  const horas = Number.parseInt(hourStr, 10) % 24;
  const minutos = Number.parseInt(minuteStr, 10);

  return {
    dia,
    minutosDesdeMedianoche: horas * 60 + minutos,
  };
}

export function evaluarEstadoHorarioHoy(
  horarios: readonly HorarioItem[],
  fechaReferencia: Date = new Date()
): EstadoHorarioHoy {
  const { dia, minutosDesdeMedianoche } = obtenerTiempoActualLima(fechaReferencia);
  const diaAyer = ((dia + 6) % 7) as DiaSemana;

  const horarioHoy = horarios.find((h) => h.dia === dia) ?? null;
  const horarioAyer = horarios.find((h) => h.dia === diaAyer) ?? null;

  if (horarioAyer) {
    const abreAyer = convertirHoraAMinutos(horarioAyer.abre);
    const cierraAyer = convertirHoraAMinutos(horarioAyer.cierra);

    if (
      abreAyer !== null &&
      cierraAyer !== null &&
      cierraAyer <= abreAyer &&
      minutosDesdeMedianoche < cierraAyer
    ) {
      const abreStr = formatearHoraCorta(horarioAyer.abre);
      const cierraStr = formatearHoraCorta(horarioAyer.cierra);
      return {
        abiertoAhora: true,
        estadoTexto: 'Abierto ahora',
        horarioHoyTexto: `${NOMBRES_DIAS_SEMANA[diaAyer]} ${abreStr} - ${cierraStr}`,
        abre: abreStr,
        cierra: cierraStr,
        diaActualLima: dia,
      };
    }
  }

  if (!horarioHoy) {
    return {
      abiertoAhora: false,
      estadoTexto: horarios.length > 0 ? 'Cerrado ahora' : 'Horario no disponible',
      horarioHoyTexto:
        horarios.length > 0
          ? `Cerrado hoy (${NOMBRES_DIAS_SEMANA[dia]})`
          : 'Sin horario registrado',
      abre: null,
      cierra: null,
      diaActualLima: dia,
    };
  }

  const abreHoy = convertirHoraAMinutos(horarioHoy.abre);
  const cierraHoy = convertirHoraAMinutos(horarioHoy.cierra);
  const abreStr = formatearHoraCorta(horarioHoy.abre);
  const cierraStr = formatearHoraCorta(horarioHoy.cierra);

  if (abreHoy === null || cierraHoy === null) {
    return {
      abiertoAhora: false,
      estadoTexto: 'Horario no disponible',
      horarioHoyTexto: `${NOMBRES_DIAS_SEMANA[dia]} ${abreStr} - ${cierraStr}`,
      abre: abreStr,
      cierra: cierraStr,
      diaActualLima: dia,
    };
  }

  const abiertoAhora =
    cierraHoy > abreHoy
      ? minutosDesdeMedianoche >= abreHoy && minutosDesdeMedianoche < cierraHoy
      : minutosDesdeMedianoche >= abreHoy || minutosDesdeMedianoche < cierraHoy;

  return {
    abiertoAhora,
    estadoTexto: abiertoAhora ? 'Abierto ahora' : 'Cerrado ahora',
    horarioHoyTexto: `Hoy (${NOMBRES_DIAS_SEMANA[dia]}): ${abreStr} - ${cierraStr}`,
    abre: abreStr,
    cierra: cierraStr,
    diaActualLima: dia,
  };
}
