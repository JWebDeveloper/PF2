import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminDashboardModule } from '../AdminDashboard/AdminDashboard.module';
import { AOfflineBookingUploadComponent } from './AOfflineBookingUpload.component';

const routes: Routes = [
  {
    path: '',
    component: AOfflineBookingUploadComponent,
  },
];

@NgModule({
  declarations: [AOfflineBookingUploadComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgbNavModule,
    AdminDashboardModule,
  ],
  exports: [AOfflineBookingUploadComponent],
})
export class AOfflineBookingUploadModule {}

