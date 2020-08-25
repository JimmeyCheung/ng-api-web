import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/login' },
    { path: 'login', loadChildren: () => import('./layout/login/login.module').then(m => m.LoginModule) },
    { path: 'client', loadChildren: () => import('./layout/client/client.module').then(m => m.ClientModule) }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
