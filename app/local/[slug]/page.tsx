import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  formatearMoneda,
  formatearRangoSimbolo,
} from '@/compartido/utilidades/formato';
import { DetalleLocalView } from '@/modulos/locales/componentes/DetalleLocalView';
import { obtenerLocalVerificadoPorSlug } from '@/modulos/locales/servicio';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const local = await obtenerLocalVerificadoPorSlug(slug);

  if (!local) {
    return {
      title: 'Local no encontrado',
    };
  }

  const titulo = `${local.nombre} (${formatearRangoSimbolo(local.rango)})`;
  const descripcion = `${local.categoria} en Huamanga · Presupuesto aprox. ${formatearMoneda(
    local.precio_ref
  )} · ${local.direccion}`;
  const imagenPrincipal = local.fotos[0]?.url;

  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: `${titulo} | JAKU Huamanga`,
      description: descripcion,
      type: 'website',
      images: imagenPrincipal ? [{ url: imagenPrincipal }] : [],
    },
  };
}

export default async function PaginaDetalleLocal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const local = await obtenerLocalVerificadoPorSlug(slug);

  if (!local) {
    notFound();
  }

  return <DetalleLocalView local={local} />;
}
