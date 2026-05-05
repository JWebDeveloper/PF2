import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { AdminMouComponent } from './admin-mou.component';
import { AdminDashboardModule } from '../AdminDashboard/AdminDashboard.module';

const routes: Routes = [
  {
    path: '',
    component: AdminMouComponent,
  }
];

 

@NgModule({
  declarations: [
    AdminMouComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,          
    NgbModalModule,       
    AdminDashboardModule, 

    // ✅ FIX 1 — register the lazy child route so the component renders
    RouterModule.forChild(routes),
  ],
})
export class AdminMouModule { }
