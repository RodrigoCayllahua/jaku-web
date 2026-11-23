import Link from 'next/link';
import { MapPinOff } from 'lucide-react';

export default function LocalNoEncontrado() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <MapPinOff className="mx-auto mb-3 h-10 w-10 text-slate-400" />
        <h1 className="text-xl font-bold text-slate-900">
          Este lugar no está disponible
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Es posible que el enlace haya cambiado o que el local aún esté en
          revisión por el equipo de JAKU.
        </p>
        <Link
          href="/explorar"
          className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Explorar lugares en Huamanga
        </Link>
      </div>
    </main>
  );
}
