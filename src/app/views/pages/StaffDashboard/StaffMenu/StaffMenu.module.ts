import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffMenuComponent } from './StaffMenu.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    StaffMenuComponent  
  ],
  exports: [
    StaffMenuComponent  
  ],
  imports: [
    CommonModule  ,
    RouterModule
  ]
})
export class StaffMenuModule {}
// Added by Jatinder Kumar 31309
