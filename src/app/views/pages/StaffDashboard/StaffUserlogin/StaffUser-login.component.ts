import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { LpuCIFWebService } from 'src/app/_services/lpu-cifweb.service';
import { LoginSessionService } from 'src/app/_services/login-session.service';
import { CookieService } from 'ngx-cookie-service';

import { LpuCIFWebServiceNewService } from 'src/app/_services/lpu-cifweb-new-way.service';

@Component({
  selector: 'app-StaffUserlogin',
  templateUrl: './StaffUser-login.component.html',
  styleUrls: ['./StaffUser-login.component.scss'],
})
export class StaffUserLoginComponent implements OnInit {
  @ViewChild('table') table: ElementRef;
  @ViewChild('facilitiesSection') facilitiesSection!: ElementRef;
  gotoFacilities() {
    this.facilitiesSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  formdata!: FormGroup;
  submitted = false;
  showPassword = false;
  loginError: string | null = null;
  isLoginFailed = false;
  showNoDataFoundMessage = false;
  loadingIndicator = false;
  storeResult = 0;
  CandidateName: any;
  UserId: any;
  Department: any;
  DepartmentName: any;
  Designation: any;
  EmailId: any;
  MobileNo: any;
  UserRole: any;
  SupervisorName: any;
  SecretKey: any;
  EmployeeDetails: any;
  EmployeeName: any;
  EmployeeCode: any;
  ErrMessage: any = '';
  serverConnectionError = false;
  constructor(
    private fb: FormBuilder,
    private CIFwebServiceNew: LpuCIFWebServiceNewService,
    private authService: AuthService,
    private storageService: StorageService,
    private CIFwebService: LpuCIFWebService,
    private AuthSession: LoginSessionService,
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService,
  ) {}

  ngOnInit(): void {
    this.AuthSession.clearSession(); // Keep session clear on entry, not cookie
    this.loadForm();
  }

  loadForm(): void {
    this.formdata = this.fb.group({
      Email: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
    this.submitted = false;
    this.loginError = null;
  }

  get email(): AbstractControl | null {
    return this.formdata.get('Email');
  }

  get passwordText(): AbstractControl | null {
    return this.formdata.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  OnSubmit(): void {
    if (this.formdata.invalid) return;

    const { Email, password } = this.formdata.value;
    const encodedEmail = btoa(Email ?? '');
    const encodedPassword = btoa(password ?? '');
    this.SecretKey = password ?? '';

    this.getToken(encodedEmail, encodedPassword);
  }

  getToken(encodedEmail: string, encodedPassword: string): void {
    this.authService
      .loginInternalUser(atob(encodedEmail), atob(encodedPassword))
      .subscribe({
        next: (data) => {
          this.storageService.saveUser(data.token);
          // this.GetEmployeeDetails();
          this.GetEmployeeDetails(encodedEmail);
        },
        error: (err) => {
          this.handleLoginFailure(err);
        },
      });
  }

  readonly defaultCifUserList = [
    {
      uid: '24374',
      uiD_Name: 'Dr. Vijay Kumar',
    },
    {
      uid: '20362',
      uiD_Name: 'Dr. Nupur Prasad',
    },
    {
      uid: '16477',
      uiD_Name: 'Prashant Kumar',
    },
    {
      uid: '27727',
      uiD_Name: 'Dr. Nabaparna Chakraborty',
    },
    {
      uid: '26918',
      uiD_Name: 'Baljit Bangar',
    },
    {
      uid: '30694',
      uiD_Name: 'Amandeep Kaur',
    },
    {
      uid: '29159',
      uiD_Name: 'Kamlash Rani',
    },
    {
      uid: '31691',
      uiD_Name: 'Sameer Singh Pathania',
    },
    {
      uid: '33476',
      uiD_Name: 'Sanjeev Kumar Verma',
    },
    {
      uid: '34185',
      uiD_Name: 'Dr. Puneet',
    },
    {
      uid: '34228',
      uiD_Name: 'Monika Kumari',
    },
    {
      uid: '35395',
      uiD_Name: 'Dr. Vandana Sharma',
    },
    {
      uid: '35317',
      uiD_Name: 'Dr. Diksha Devi',
    },
    {
      uid: '35479',
      uiD_Name: 'Kajal Dadwal',
    },
    {
      uid: '31309',
      uiD_Name: 'Jatinder Kumar',
    },
  ];

  AllCifUserList: any[] = [...this.defaultCifUserList];

  getAllCifUserList(callback?: () => void): void {
    this.CIFwebService.GetAllUserLists().subscribe({
      next: (response) => {
        if (response.item1 && response.item1.length > 0) {
          this.AllCifUserList = response.item1;
        }
        // Ensure id 31309 (not in api data) and default users are always present in AllCifUserList
        for (const defaultUser of this.defaultCifUserList) {
          const exists = this.AllCifUserList.some(
            (item: any) =>
              (item.uid || item.UID)?.toString().trim() === defaultUser.uid,
          );
          if (!exists) {
            this.AllCifUserList.push(defaultUser);
          }
        }
        if (callback) {
          callback();
        }
      },
      error: (err) => {
        console.error('Failed to get UIDS:', err);
        // Ensure default users and 31309 are preserved even if API fails
        for (const defaultUser of this.defaultCifUserList) {
          const exists = this.AllCifUserList.some(
            (item: any) =>
              (item.uid || item.UID)?.toString().trim() === defaultUser.uid,
          );
          if (!exists) {
            this.AllCifUserList.push(defaultUser);
          }
        }
        if (callback) {
          callback();
        }
      },
    });
  }

  // GetEmployeeDetails(): void {
  //   this.mouDocumentsService.GetEmployeeDetails().subscribe({
  GetEmployeeDetails(UserId: any) {
    this.CIFwebService.GetInternalUserDetails(UserId).subscribe({
      next: (response) => {
        if (response.item1 && response.item1.length > 0) {
          this.EmployeeDetails = response.item1;
          const emp = response.item1[0];

          this.CandidateName = this.EmployeeName = emp.employeeName;
          this.UserId = this.EmployeeCode = emp.employeeCode;
          this.Department = emp.department;
          this.DepartmentName = emp.departmentName;
          this.Designation = emp.department;
          this.EmailId = emp.email;
          this.MobileNo = emp.contactNo;
          this.UserRole = 'Admin-User';
          this.SupervisorName = emp.department;
          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;

          const empCode = this.EmployeeCode
            ? this.EmployeeCode.toString().trim()
            : '';
          const isAllowed =
            empCode === '31309' ||
            this.AllCifUserList.some((item: any) => {
              const uid = (item.uid || item.UID)?.toString().trim();
              return uid === empCode;
            });

          if (!isAllowed) {
            this.cookieService.delete('StaffUserAuthData');
            this.AuthSession.clearSession();
            this.storageService.clean();
            this.isLoginFailed = true;
            this.ErrMessage =
              'Not Authorised.  This Dashboard is only for CIF Staff Members!';
            swal.fire({
              title: 'Not Authorised',
              text: 'Not Authorised. This Dashboard is only for CIF Staff Members!',
              icon: 'warning',
            });
          } else {
            const userCookiesData = {
              CandidateName: this.CandidateName,
              UserId: this.UserId,
              Department: this.Department,
              DepartmentName: this.DepartmentName,
              Designation: this.Designation,
              EmailId: this.EmailId,
              MobileNo: this.MobileNo,
              UserRole: this.UserRole,
              SupervisorName: this.SupervisorName,
              ProofNumber: this.MobileNo,
              ProofName: 'Mobile',
              PasswordText: this.SecretKey,
            };
            this.isLoginFailed = false;
            this.AuthSession.addToSession(this.EmployeeDetails);

            const UserCookies = JSON.stringify(userCookiesData);
            // this.cookieService.set('StaffUserAuthData', UserCookies);
            const expirationMinutes = 45; // Set expiration time in minutes
            const expirationDate = new Date();
            expirationDate.setMinutes(
              expirationDate.getMinutes() + expirationMinutes,
            ); // Set expiration time
            this.cookieService.set(
              'StaffUserAuthData',
              UserCookies,
              expirationDate, // Set the expiration date
              '/', // Path
              undefined, // Domain
              true, // Secure: should be true in production
              'Lax', // SameSite policy
            );
            this.router.navigate(['/StaffActionBookings']);
          }
        } else {
          this.cookieService.delete('StaffUserAuthData');
          this.AuthSession.clearSession();
          this.storageService.clean();
          this.EmployeeDetails = [];
          this.showNoDataFoundMessage = true;
          this.isLoginFailed = true;
          this.ErrMessage = 'Not Authorised. Employee details not found.';
          swal.fire({
            title: 'Not Authorised',
            text: 'Employee details not found.',
            icon: 'warning',
          });
        }
      },
      error: (err) => {
        this.handleLoginFailure(err);
      },
    });

    this.formdata.reset();
  }

  handleLoginFailure(error: any): void {
    this.cookieService.delete('StaffUserAuthData');
    this.AuthSession.clearSession();
    this.isLoginFailed = true;
    this.ErrMessage = 'Login Failed. Invalid Details.';

    swal.fire({
      title: 'Login Failed',
      text: 'Login details are invalid. Please try again.',
      icon: 'warning',
    });
  }

  StoreInternalUserInDataBase(): void {
    const formData = new FormData();
    formData.append('UserEmail', this.EmailId);
    formData.append('CandidateName', this.CandidateName);
    formData.append('SupervisorName', this.SupervisorName);
    formData.append('MobileNumber', this.MobileNo);
    formData.append('SchoolName', this.Department);
    formData.append('DepartmentName', this.DepartmentName);
    formData.append('IdProofType', 'UMSID');
    formData.append('IdProofNumber', this.UserId);
    formData.append('UserType', this.UserRole);
    formData.append('Address', 'Internal User');
    formData.append('PasswordText', btoa(this.SecretKey));

    this.CIFwebServiceNew.NewUserRecord(formData).subscribe({
      // this.CIFwebService.NewUserRecord(formData).subscribe({
      next: (data) => {
        // Check if response has error flag from service
        if (data && data.error) {
          this.serverConnectionError = true;
          this.storeResult = -1;
          return;
        }

        const result = data?.item1?.[0]?.['msg'];
        const errorCode = data?.item1?.[0]?.['returnId'];

        if (result === 'Success') {
          this.storeResult = 1;
        } else if (errorCode === -1) {
          this.storeResult = 0;
        } else {
          this.storeResult = -1;
        }
      },
      error: (err) => {
        console.error('Error saving user:', err);
        this.storeResult = -1;
      },
    });
  }
}

//   // GetEmployeeDetails(): void {
//   //   this.mouDocumentsService.GetEmployeeDetails().subscribe({
//     GetEmployeeDetails(UserId:any) {
//     this.CIFwebService.GetInternalUserDetails(UserId).subscribe({
//       next: response => {
//         if (response.item1 && response.item1.length > 0) {
//           this.EmployeeDetails = response.item1;
//           const emp = response.item1[0];

//           this.CandidateName = this.EmployeeName = emp.employeeName;
//           this.UserId = this.EmployeeCode = emp.employeeCode;
//           this.Department = emp.department;
//           this.DepartmentName = emp.departmentName;
//           this.Designation = emp.department;
//           this.EmailId = emp.email;
//           this.MobileNo = emp.contactNo;
//           this.UserRole = 'Admin-User';
//           this.SupervisorName = emp.department;
//           this.loadingIndicator = false;
//           this.showNoDataFoundMessage = false;
//           const AllallowedIds = [
//             { uid: '24374' },// vijay
//             { uid: '20362' },// napoor
//             { uid: '25760' },// anju
//             { uid: '34228' },// monika
//             { uid: '34185' },//puneet
//             { uid: '16477' },// prashant
//             { uid: '27727' },// naperna
//             { uid: '27808' },// kamlesh
//             { uid: '26918' },// baljeet
//             { uid: '30694' },// Aman
//             { uid: '29159' },//
//             { uid: '31691' },// sameer
//             { uid: '33476' },// sanjeev
//             { uid: '31309' },// jatinder
//           ];

//           const isAllowed = AllallowedIds.some(item => item.uid === this.EmployeeCode);

//           if (!isAllowed) {
//             this.isLoginFailed = true;
//             this.ErrMessage = 'Not Authorised.  This Dashboard is only for CIF Staff Members!';
//           } else {
//             const userCookiesData = {
//               CandidateName: this.CandidateName,
//               UserId: this.UserId,
//               Department: this.Department,
//               DepartmentName: this.DepartmentName,
//               Designation: this.Designation,
//               EmailId: this.EmailId,
//               MobileNo: this.MobileNo,
//               UserRole: this.UserRole,
//               SupervisorName: this.SupervisorName,
//               ProofNumber: this.MobileNo,
//               ProofName: 'Mobile',
//               PasswordText: this.SecretKey,
//             };
//             this.isLoginFailed = false;
//             this.AuthSession.addToSession(this.EmployeeDetails);

//             const UserCookies = JSON.stringify(userCookiesData);
//             // this.cookieService.set('StaffUserAuthData', UserCookies);
//             const expirationMinutes = 35; // Set expiration time in minutes
//             const expirationDate = new Date();
//             expirationDate.setMinutes(expirationDate.getMinutes() + expirationMinutes); // Set expiration time
//             this.cookieService.set(
//               'StaffUserAuthData',
//               UserCookies,
//               expirationDate, // Set the expiration date
//               '/',           // Path
//               undefined,     // Domain
//               true,          // Secure: should be true in production
//               'Lax'          // SameSite policy
//             );
//             this.router.navigate(['/StaffActionBookings']);
//           }
//         } else {
//           this.EmployeeDetails = [];
//           this.showNoDataFoundMessage = true;
//           this.isLoginFailed = true;
//         }
//       },
//       error: err => {
//         this.handleLoginFailure(err);
//       }
//     });

//     this.formdata.reset();
//   }

//   handleLoginFailure(error: any): void {
//     this.cookieService.delete('StaffUserAuthData');
//     this.AuthSession.clearSession();
//     this.isLoginFailed = true;
//      this.ErrMessage = 'Login Failed. Invalid Details.';

//     swal.fire({
//       title: 'Login Failed',
//       text: 'Login details are invalid. Please try again.',
//       icon: 'warning',
//     });
//   }

//   StoreInternalUserInDataBase(): void {
//     const formData = new FormData();
//     formData.append("UserEmail", this.EmailId);
//     formData.append("CandidateName", this.CandidateName);
//     formData.append("SupervisorName", this.SupervisorName);
//     formData.append("MobileNumber", this.MobileNo);
//     formData.append("SchoolName", this.Department);
//     formData.append("DepartmentName", this.DepartmentName);
//     formData.append("IdProofType", 'UMSID');
//     formData.append("IdProofNumber", this.UserId);
//     formData.append("UserType", this.UserRole);
//     formData.append("Address", 'Internal User');
//     formData.append("PasswordText", btoa(this.SecretKey));

//     this.CIFwebServiceNew.NewUserRecord(formData).subscribe({
//     // this.CIFwebService.NewUserRecord(formData).subscribe({
//       next: (data) => {
//         // Check if response has error flag from service
//         if (data && data.error) {
//           this.serverConnectionError = true;
//           this.storeResult = -1;
//           return;
//         }

//         const result = data.item1[0]['msg'];
//         const errorCode = data.item1[0]['returnId'];

//         if (result === 'Success') {
//           this.storeResult = 1;
//         } else if (errorCode === -1) {
//           this.storeResult = 0;
//         } else {
//           this.storeResult = -1;
//         }
//       },
//       error: (err) => {
//         console.error('Error saving user:', err);
//         this.storeResult = -1;
//       }
//     });
//   }
// }
