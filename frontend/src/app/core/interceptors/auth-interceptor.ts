import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token vencido o usuario desactivado: cerrar sesión y volver al login.
      // El login también responde 401 ante credenciales incorrectas; ahí lo maneja la pantalla.
      if (error.status === 401 && !req.url.endsWith('/auth/login')) {
        localStorage.removeItem('token');
        router.navigate(['/']);
      }
      return throwError(() => error);
    })
  );
};
