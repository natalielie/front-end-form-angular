import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormArray,
  FormGroupDirective,
} from '@angular/forms';

import { ConfigService } from './services/config.service';
import { frameworksWithVer } from './utils/frameworks';
import { CustomValidators } from './utils/custom-validators';
import { Subject, delay, of, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  selectedFramework: string = '';
  selectedVersion: string = '';
  private destroy$: Subject<boolean> = new Subject<boolean>();

  /**
   * A reference to the `userForm` template within the component's view.
   * This allows for direct interaction with the form's underlying `FormGroupDirective`.
   */
  @ViewChild('userForm', { static: false }) formReference?: FormGroupDirective;

  constructor(
    public configService: ConfigService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      firstName: new FormControl<string>('', [Validators.required]),
      lastName: new FormControl<string>('', [Validators.required]),
      dateOfBirth: new FormControl<Date>(new Date(), [
        Validators.required,
        CustomValidators.minimumAgeValidator(),
      ]),
      framework: new FormControl('', [Validators.required]),
      frameworkVersion: new FormControl('', [Validators.required]),
      email: new FormControl<string>('', {
        validators: [
          Validators.required,
          Validators.email,
          Validators.pattern('[^ @]*@[^ @]*'),
          CustomValidators.emailValidator(this.configService),
        ],
      }),
      hobbies: this.formBuilder.array([
        new FormControl<string>('', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ]),
      ]),
    });

    this.userForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        console.log('changed value', value);
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  get frameworks(): string[] {
    return Array.from(frameworksWithVer.keys());
  }

  get versions(): string[] | undefined {
    return frameworksWithVer.get(this.selectedFramework);
  }

  get hobbies(): FormArray {
    return this.userForm.get('hobbies') as FormArray;
  }

  addHobby() {
    this.hobbies.push(this.formBuilder.control(''));
  }

  removeHobby(index: number) {
    const hobbies = this.userForm?.get('hobbies') as FormArray;
    hobbies.removeAt(index);
  }

  onFramworkChange() {
    this.userForm.controls['framework'].setValue(this.selectedFramework);
  }

  onVersionChange() {
    this.userForm.controls['frameworkVersion'].setValue(this.selectedVersion);
  }

  onSubmit(): void {
    /*.subscribe({
        next: (): void => {
          // reset form to initial state
          this.userForm.reset();
          this.selectedFramework = '';
          this.selectedVersion = '';
        },
        error: (err): void =>
          this.userForm.get('email')?.setErrors({ isExists: err.message }),
      });*/
    //alert('Sorry, this email is already taken. Please, choose another one');
    //console.log(this.configService.getUsers().subscribe());
    if (this.userForm.valid) {
      this.configService
        .addUser(this.userForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            of(null)
              .pipe(
                delay(3000),
                tap(() => {
                  this.formReference?.resetForm();
                  this.selectedFramework = '';
                  this.selectedVersion = '';
                  this.hobbies.clear();
                }),
                takeUntil(this.destroy$)
              )
              .subscribe();
          },
        });
    }
  }
}
