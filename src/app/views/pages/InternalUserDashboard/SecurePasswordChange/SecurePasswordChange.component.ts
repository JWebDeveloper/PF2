import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service'; // For setting full cookies post-reset
 
import { LpuCIFWebService } from 'src/app/_services/lpu-cifweb.service';
import swal from 'sweetalert2';
import { LoginSessionService } from 'src/app/_services/login-session.service';

 
import { AuthService } from 'src/app/_services/auth.service';


import { UntypedFormBuilder } from '@angular/forms';

interface UserDetails {
  candidateName?: string;
  supervisorName?: string;
  mobileNumber?: string;
  organisation?: string;
  departmentName?: string;
  idProofType?: string;
  idProofNumber?: string;
  address?: string;
  emailId?: string;
  userRole?: number;
  department?: string;
  // Add other fields as needed
}

interface ApiResponse {
  item1: UserDetails[];
}

@Component({
  selector: 'app-securePasswordChange',
  templateUrl: './SecurePasswordChange.component.html',
  styleUrls: ['./SecurePasswordChange.component.scss']
})
export class SecurePasswordChangeComponent implements OnInit {
  resetForm: FormGroup;
  isSubmitting = false;
  isVerifying = false;
  isVerified = false;
  userDetails: UserDetails | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  securityMessage = 'For security reasons, you must update your password before continuing.';
  UserEmail:any;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private CIFwebService: LpuCIFWebService,
    private router: Router,
    private cookieService: CookieService,
    private authSession: LoginSessionService ,
    private routerLink: Router,
    private AuthSession: LoginSessionService,
  ) {
    this.resetForm = this.fb.group({
      // Identity Verification Section
      mobileNumber: [{ value: '', disabled: true }, Validators.required],
      idProofType: [{ value: '', disabled: true }, Validators.required],
      idProofNumber: ['', [Validators.required]],

      // Password Section (initially disabled)
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  togglePasswordVisibility(field: 'newPassword' | 'confirmNewPassword'): void {
    const input = document.getElementById(field) as HTMLInputElement;
    input.type = input.type === 'password' ? 'text' : 'password';
  }
  
  ngOnInit(): void {
    this.loadUserDetails();
  }

  private loadUserDetails(): void {

    const GetCookieData = this.cookieService.get('InternalUserAuthData');
    if (!GetCookieData) {
      
      return;
    }
    const retrievedCookies = JSON.parse(GetCookieData);
    this.UserEmail=retrievedCookies.EmailId;
    this.CIFwebService.CIFGetUserDetails(retrievedCookies.EmailId).subscribe({
      next: (data: ApiResponse) => {
        this.userDetails = data.item1[0]; // As per your snippet
        this.resetForm.patchValue({
          mobileNumber: this.userDetails.mobileNumber || '',
          idProofType: this.userDetails.idProofType || ''
        });

        // Disable password fields until verified
        this.resetForm.get('newPassword')?.disable();
        this.resetForm.get('confirmNewPassword')?.disable();
      },
      error: (error) => {
        console.error('Failed to load user details:', error);
        this.errorMessage = 'Failed to load user details. Please log in again.';
        // Optional: alert(this.errorMessage);
        this.router.navigate(['/Login']);
      }
    });
  }

  // Verify identity
  verifyIdentity(): void {
    if (!this.userDetails) {
      this.errorMessage = 'User  details not loaded.';
      return;
    }

    const enteredIdProofNumber = this.resetForm.get('idProofNumber')?.value;
    if (!enteredIdProofNumber) {
      this.errorMessage = 'Please enter your ID Proof Number.';
      return;
    }

    this.isVerifying = true;
    this.errorMessage = null;

    // Client-side match (insecure for prod; replace with backend API)
    if (enteredIdProofNumber === this.userDetails.idProofNumber) {
      this.isVerified = true;
      this.isVerifying = false;
      this.successMessage = 'Identity verified successfully!';
      // Clear after 3s
      setTimeout(() => { this.successMessage = null; }, 3000);

      // Enable password fields
      this.resetForm.get('newPassword')?.enable();
      this.resetForm.get('confirmNewPassword')?.enable();

      // Disable idProofNumber after verification
      this.resetForm.get('idProofNumber')?.disable();
    } else {
      this.isVerifying = false;
      this.resetForm.get('idProofNumber')?.setErrors({ mismatch: true });
      this.errorMessage = 'Invalid details. Please try again.';
    }

 
  }

  onSubmit(): void {
    if (!this.isVerified || this.resetForm.invalid || this.isSubmitting) {
      this.errorMessage = 'Please verify identity and complete the form.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    const { newPassword } = this.resetForm.value;
    const formData = new FormData();
     formData.append('UserId', this.UserEmail);
     formData.append('Password', newPassword);
         
            this.CIFwebService.CIFUpdateUserDetails(formData).subscribe({
              next: (data: any) => {
                const result = data.item1[0]['msg'];
                if (result === 'Success') {
                  swal.fire({
                    title: 'Details Updated Successfully!',
                    text: 'You will be logeed out ',
                    icon: 'success'
                  }).then(() => {
                    this.LogoutUser();
                    // this.router.navigateByUrl('Home');
                    // this.router.navigate(['/cifWebPortal']);
                  });
                } else if (result === 'Failed') {
                  swal.fire({
                    title: 'Unable to Update Details Try Again Later ',
                    icon: 'error'
                  }).then(() => {
                    this.LogoutUser();
                    // this.router.navigateByUrl('Home');
                    // window.location.reload();
                  });
                } else {
                  swal.fire({
                    title: 'Something Went Wrong, Try again later',
                    icon: 'error'
                  }).then(() => {
                    this.LogoutUser();
                    // this.router.navigateByUrl('Home');
                    // window.location.reload();
                  });
                }
          
              },
              error: (error: any) => {
                swal.fire({
                  title: 'Error',
                  text: 'Failed to Update.',
                  icon: 'error'
                }).then(() => {
                  this.LogoutUser();
                  // this.router.navigateByUrl('Home');
                  // window.location.reload();
                });
              },
              complete: () => {
              }
            });
   
  }

  // Custom validator: Password match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.isVerified) return null;
    const newPassword = control.get('newPassword')?.value;
    const confirmNewPassword = control.get('confirmNewPassword')?.value;
    return newPassword === confirmNewPassword ? null : { mismatch: true };
  }

  // Getters for template
  get idProofNumber() { return this.resetForm.get('idProofNumber'); }
  get newPassword() { return this.resetForm.get('newPassword'); }
  get confirmNewPassword() { return this.resetForm.get('confirmNewPassword'); }

  // Clear messages
  clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }


    LogoutUser() {
      swal.fire({
        title: 'Logging out...',
        allowOutsideClick: false,
        didOpen: () => { },
      });
  
      // 1. Clear Data
      this.cookieService.delete('InternalUserAuthData', '/');
      this.AuthSession.clearSession();
  
      this.router.navigate(['Home'], { replaceUrl: true }).then(() => {
        window.location.reload();
      });
    }
}
