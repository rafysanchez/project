import { Component, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import {  FormControl } from '@angular/forms';

interface DynamicFormGroup {
  [key: string]: FormControl;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  validations?: any[];
  options?: string[];
}

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h2>Dynamic Registration Form</h2>
      
      <form [formGroup]="dynamicForm" (ngSubmit)="onSubmit()">
        <div *ngFor="let field of formFields" class="form-group">
          <label [for]="field.name">{{ field.label }}</label>
          
          <ng-container [ngSwitch]="field.type">
            <!-- Text/Email/Password inputs -->
            <input *ngSwitchCase="'text'" 
                   [type]="field.type"
                   [id]="field.name"
                   [formControlName]="field.name"
                   class="form-control">
                   
            <!-- Select dropdown -->
            <select *ngSwitchCase="'select'"
                    [id]="field.name"
                    [formControlName]="field.name"
                    class="form-control">
              <option value="">Select...</option>
              <option *ngFor="let opt of field.options" [value]="opt">
                {{opt}}
              </option>
            </select>
          </ng-container>
          
          <!-- Error messages -->
          <div class="error-messages" *ngIf="dynamicForm.get(field.name)?.errors && 
               dynamicForm.get(field.name)?.touched">
            <small class="error" *ngIf="dynamicForm.get(field.name)?.errors?.['required']">
              This field is required
            </small>
            <small class="error" *ngIf="dynamicForm.get(field.name)?.errors?.['email']">
              Please enter a valid email
            </small>
            <small class="error" *ngIf="dynamicForm.get(field.name)?.errors?.['minlength']">
              Minimum length is {{dynamicForm.get(field.name)?.errors?.['minlength'].requiredLength}} characters
            </small>
            <small class="error" *ngIf="dynamicForm.get(field.name)?.errors?.['passwordStrength']">
              Password must contain at least one uppercase letter, one number, and one special character
            </small>
          </div>
        </div>
        
        <button type="submit" [disabled]="!dynamicForm.valid">Submit</button>
      </form>
      
      <div *ngIf="submitted" class="success-message">
        Form submitted successfully!
        <pre>{{ formValues | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      background: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    h2 {
      color: #333;
      margin-bottom: 2rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
    }
    
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    .error-messages {
      margin-top: 0.5rem;
    }
    
    .error {
      color: #dc3545;
      font-size: 0.875rem;
    }
    
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .success-message {
      margin-top: 1rem;
      padding: 1rem;
      background: #d4edda;
      border-radius: 4px;
      color: #155724;
    }
    
    pre {
      background: #fff;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }
  `],
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true
})
export class App {
  dynamicForm: FormGroup;
  submitted = false;
  formValues: any;
  

  formFields: FormField[] = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      validations: [Validators.required, Validators.minLength(3)]
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      validations: [Validators.required, Validators.email]
    },
    {
      name: 'password',
      label: 'Password',
      type: 'text',
      validations: [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: ['Developer', 'Designer', 'Manager', 'Other'],
      validations: [Validators.required]
    }
  ];

  constructor(private fb: FormBuilder) {
    this.dynamicForm = this.createForm();
  }



  createForm(): FormGroup {
    const group: { [key: string]: any[] } = {};
    
    this.formFields.forEach(field => {
      group[field.name] = ['', field.validations];
    });
    
    return this.fb.group(group);
  }

  passwordStrengthValidator() {
    return (control: any) => {
      const value = control.value;
      
      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*]/.test(value);

      const valid = hasUpperCase && hasNumber && hasSpecialChar;
      
      return valid ? null : { passwordStrength: true };
    };
  }

  onSubmit() {
    if (this.dynamicForm.valid) {
      this.submitted = true;
      this.formValues = this.dynamicForm.value;
      console.log('Form Values:', this.formValues);
    } else {
      Object.keys(this.dynamicForm.controls).forEach(key => {
        const control = this.dynamicForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(BrowserAnimationsModule)
  ]
}).catch(err => console.error(err));