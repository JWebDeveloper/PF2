import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CifMenuBarComponent } from './cif-menu-bar.component';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
@NgModule({
  declarations: [
    CifMenuBarComponent  
  ],
  exports: [
    CifMenuBarComponent  
  ],
  imports: [
    CommonModule ,
    RouterModule
  ]
})
export class CifMenuBarModule {}
// Added by Jatinder Kumar 31309
