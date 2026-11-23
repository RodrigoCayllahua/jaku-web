import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function crearRespuestaErrorJson(
  codigo: string,
  mensaje: string,
  status: number
): NextResponse {
  return NextResponse.json(
    { error: { codigo, mensaje } },
    { status }
  );
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  const esRutaPaginaAdmin = pathname.startsWith('/admin');
  const esRutaApiAdmin = pathname.startsWith('/api/v1/admin');
  const esLoginAdmin = pathname === '/admin/login';

  if (!esRutaPaginaAdmin && !esRutaApiAdmin) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (esRutaApiAdmin) {
      return crearRespuestaErrorJson(
        'CONFIGURACION_INVALIDA',
        'Variables de entorno de Supabase no configuradas.',
        500
      );
    }
    return NextResponse.redirect(new URL('/explorar', request.url));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    if (esLoginAdmin) {
      return response;
    }

    if (esRutaApiAdmin) {
      return crearRespuestaErrorJson(
        'NO_AUTENTICADO',
        'Debes iniciar sesión para acceder a este recurso.',
        401
      );
    }

    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const { data: perfilAdmin, error: perfilError } = await supabase
    .from('perfil_admin')
    .select('id, rol')
    .eq('id', user.id)
    .maybeSingle();

  const esAdminValido = !perfilError && perfilAdmin !== null;

  if (!esAdminValido) {
    if (esLoginAdmin) {
      return response;
    }

    if (esRutaApiAdmin) {
      return crearRespuestaErrorJson(
        'NO_AUTORIZADO',
        'Tu cuenta no tiene permisos de administrador.',
        403
      );
    }

    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'sin_permiso');
    return NextResponse.redirect(loginUrl);
  }

  if (esLoginAdmin) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/v1/admin/:path*'],
};
