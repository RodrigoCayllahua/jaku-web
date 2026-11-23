'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import { crearClienteSupabaseBrowser } from '@/compartido/supabase/browser';

interface PropiedadesFormularioLoginAdmin {
  rutaSiguiente?: string;
  errorInicial?: string;
}

export function FormularioLoginAdmin({
  rutaSiguiente = '/admin',
  errorInicial,
}: PropiedadesFormularioLoginAdmin) {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    errorInicial === 'sin_permiso'
      ? 'Tu cuenta no está registrada como administrador de JAKU.'
      : null
  );

  const manejarSubmit = async (evento: FormEvent) => {
    evento.preventDefault();
    setCargando(true);
    setErrorMsg(null);

    try {
      const supabase = crearClienteSupabaseBrowser();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: correo.trim(),
        password: contrasena,
      });

      if (error || !data.user) {
        setErrorMsg('Correo o contraseña incorrectos.');
        setCargando(false);
        return;
      }

      const { data: perfil, error: perfilError } = await supabase
        .from('perfil_admin')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (perfilError || !perfil) {
        await supabase.auth.signOut();
        setErrorMsg('Esta cuenta no tiene permisos de administrador.');
        setCargando(false);
        return;
      }

      router.push(rutaSiguiente.startsWith('/admin') ? rutaSiguiente : '/admin');
      router.refresh();
    } catch {
      setErrorMsg('Ocurrió un error al iniciar sesión.');
      setCargando(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Panel Administrador JAKU</h1>
        <p className="mt-1 text-sm text-slate-600">
          Acceso exclusivo para administradores del catálogo de Huamanga.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={manejarSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="admin-correo"
            className="mb-1 block text-xs font-semibold text-slate-700"
          >
            Correo electrónico
          </label>
          <input
            id="admin-correo"
            type="email"
            required
            autoComplete="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="usuario@jaku.pe"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="admin-contrasena"
            className="mb-1 block text-xs font-semibold text-slate-700"
          >
            Contraseña
          </label>
          <input
            id="admin-contrasena"
            type="password"
            required
            autoComplete="current-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
        >
          {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
          Ingresar al panel
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/explorar"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al catálogo público
        </Link>
      </div>
    </div>
  );
}
