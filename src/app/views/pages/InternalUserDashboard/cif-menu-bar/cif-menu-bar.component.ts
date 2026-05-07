import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { CookieService } from 'ngx-cookie-service';
import { LoginSessionService } from 'src/app/_services/login-session.service';

@Component({
  selector: 'app-cif-menu-bar',
  templateUrl: './cif-menu-bar.component.html',
  styleUrls: ['./cif-menu-bar.component.scss'],
})
export class CifMenuBarComponent implements OnInit {
  UserRole: any; supervisorName: any; departmentName: any;
  user_Email: any;
  candidateName: any;
  isNavbarCollapsed: boolean = true;
  loadingIndicator: boolean = false;

  constructor(
    private routerLink: Router,
    private router: Router,
    private cookieService: CookieService,
    private AuthSession: LoginSessionService,
  ) {
    
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() {
    try {
      const cookieData = this.cookieService.get('InternalUserAuthData');
      if (cookieData) {
        const parsed = JSON.parse(cookieData);
        this.UserRole = parsed.UserRole;
        this.user_Email = parsed.EmailId;
        this.candidateName = parsed.CandidateName;
        this.supervisorName = parsed.SupervisorName;
        this.departmentName = parsed.DepartmentName;
      }
      else{
        this.LogoutUser();
      }
    } catch (error) {
      console.error('Error parsing user session', error);
    }
  }

  openSampleInstructions() {
    swal.fire({
      title: 'Send Samples at the following Address :',
      html: `
         <address>
          <div class="contact-text">
           Central Instrumentation Facility (CIF) <br/>
          Lovely Professional University <br/>
          Block-38, Room No.106 <br/>
          Jalandhar - Delhi G.T. Road, <br/>
          Phagwara, Punjab (India) - 144411 <br/>
          Phone : <a href="tel:+911824444021">+91 1824-444021</a><br>
          Email : cif@lpu.co.in<br>
          </div>
         </address>`,
      icon: 'info',
    });
  }

  VisitUrl(url: string, name: string, id: any, categoryId: any) {
    const targetUrl = url.startsWith('/') ? url : '/' + url;
    this.router.navigate([targetUrl, name, id, categoryId]);

    
  }

  goto(path: string) {
    this.isNavbarCollapsed = true;
    const targetPath = path.startsWith('/') ? path : '/' + path;
    this.router.navigate([targetPath]);
  }
 

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
  LogoutUser() {
    swal.fire({
      title: 'Logging out...',
      allowOutsideClick: false,
      didOpen: () => { },
    });

    this.cookieService.delete('InternalUserAuthData', '/');
    this.AuthSession.clearSession();

    this.router.navigateByUrl('Home', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/Home']);
    });

  }

 
 

  CheckUser(): boolean {
    return String(this.UserRole) === '400000';
  }
}
