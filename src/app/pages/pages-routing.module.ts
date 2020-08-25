import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientComponent } from 'app/layout/client/client.component';

const routes: Routes = [
    {
        path: '',
        component: ClientComponent,
        children: [
            { path: '', redirectTo: 'index', pathMatch: 'full' },
            {
                path: 'index',
                loadChildren: () => import('./index/index.module').then(m => m.IndexModule),
            },
            {
                path: 'api-doc',
                loadChildren: () => import('./api-doc/api-doc.module').then(m => m.ApiDocModule),
            },
            {
                path: 'api-lib',
                loadChildren: () => import('./api-lib/api-lib.module').then(m => m.ApiLibModule),
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PagesRoutingModule {}
