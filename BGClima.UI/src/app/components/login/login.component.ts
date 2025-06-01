import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect to home if already logged in
    if (this.authService.isAuthenticated()) {
      console.log('User is already authenticated, redirecting to admin');
      this.router.navigate(['/admin']);
    }
    
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    
    this.returnUrl = '/admin';
  }

  ngOnInit() {
    // Get return url from route parameters or default to '/admin'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
    console.log('Return URL:', this.returnUrl);
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    console.log('Login form submitted');

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    this.loading = true;
    console.log('Attempting login with:', this.f['username'].value);
    
    this.authService.login({
      username: this.f['username'].value,
      password: this.f['password'].value
    })
      .pipe(first())
      .subscribe({
        next: (user) => {
          console.log('Login successful:', user);
          console.log('Redirecting to:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        },
        error: error => {
          console.error('Login error:', error);
          this.error = error.message || 'Invalid username or password';
          this.loading = false;
        }
      });
  }
} 