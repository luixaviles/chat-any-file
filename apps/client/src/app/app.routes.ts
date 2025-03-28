import { ActivatedRouteSnapshot, CanActivateFn, Route, RouterStateSnapshot } from '@angular/router';
import { ChatComponent } from '@app/ui';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FileHandlerService } from '@app/ui';
import { HomeComponent } from './home/home.component';

export const chatGuardFunction: CanActivateFn = (
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const router = inject(Router);
    const fileHandlerService = inject(FileHandlerService);
    const fileParam = next.queryParamMap.get('file');

    if (!fileParam) {
        router.navigate(['/home']);
        return of(false);
    }

    return fileHandlerService.getFileType(fileParam).pipe(
        map(fileType => !!fileType),
        catchError(() => {
            router.navigate(['/home']);
            return of(false);
        })
    );
}

export const appRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'chat',
        component: ChatComponent,
        canActivate: [chatGuardFunction]
    }
];
