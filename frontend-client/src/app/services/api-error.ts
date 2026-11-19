import { HttpErrorResponse } from '@angular/common/http';

export function apiError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'No se pudo completar la operación.';
  const body: unknown = error.error;
  const message = typeof body === 'object' && body !== null && 'error' in body
    && typeof body.error === 'string' ? body.error : undefined;

  switch (error.status) {
    case 0: return 'No se pudo conectar con el servicio. Intenta de nuevo.';
    case 400: return message ?? 'Revisa los datos ingresados.';
    case 401: return message ?? 'Tu sesión ya no es válida.';
    case 403: return 'No tienes permisos para realizar esta operación.';
    case 404: return message ?? 'El recurso ya no está disponible.';
    case 409: return message ?? 'La operación no se pudo completar con los datos actuales.';
    case 503: return 'El servicio no está disponible en este momento. Intenta de nuevo.';
    default: return 'Ocurrió un problema en el servidor. Intenta de nuevo.';
  }
}
