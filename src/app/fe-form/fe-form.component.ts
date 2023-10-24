import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, delay, map, of, takeUntil, tap } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormArray,
  FormGroupDirective,
  MinLengthValidator,
} from '@angular/forms';

import { UserService } from '../services/user-api.service';
import { frameworksWithVer } from '../utils/frameworks';
import { CustomValidators } from '../utils/custom-validators';

/**
 * A component that represents a front-end form
 */
@Component({
  selector: 'app-fe-form',
  templateUrl: './fe-form.component.html',
  styleUrls: ['./fe-form.component.scss'],
})
export class FeFormComponent implements OnInit, OnDestroy {
  /**
   * A reference to the `userForm` template within the component's view.
   * Allows working with a form reference, not form itself
   */
  @ViewChild('userForm', { static: false }) formReference?: FormGroupDirective;

  userForm!: FormGroup;
  selectedFramework: string = '';
  selectedVersion: string = '';
  /**
   * A subject to prevent memory leaks
   */
  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public UserService: UserService,
    private formBuilder: FormBuilder
  ) {}

  /**
   * creating form's form controls with validators
   */
  ngOnInit() {
    this.userForm = this.formBuilder.group({
      firstName: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      lastName: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      dateOfBirth: new FormControl<Date>(new Date(), [
        Validators.required,
        CustomValidators.minimumAgeValidator(),
      ]),
      framework: new FormControl('', [Validators.required]),
      frameworkVersion: new FormControl({ value: '', disabled: true }, [
        Validators.required,
      ]),
      email: new FormControl<string>(
        '',
        [Validators.required, Validators.email],
        [CustomValidators.emailValidator(this.UserService)]
      ),
      hobbies: this.formBuilder.array([
        new FormControl<string>('', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ]),
      ]),
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * getting versions from array with frameworks and versions
   *
   * @param frameworksWithVer.keys a framework options
   *
   */
  get frameworks(): string[] {
    return Array.from(frameworksWithVer.keys());
  }

  /**
   * getting versions from array with frameworks and versions
   *
   * @param selectedFramework a framework wich user should to
   * choose to be able to choose a version
   *
   */
  get versions(): string[] | undefined {
    this.enableVersion();
    return frameworksWithVer.get(this.selectedFramework);
  }

  /** Enable framework versions select after choosing the framework */
  public enableVersion(): void {
    this.userForm.get('frameworkVersion')?.enable();
  }

  get hobbies(): FormArray {
    return this.userForm.get('hobbies') as FormArray;
  }

  /**
   * Adding hobby to a hobby array
   */
  addHobby(): void {
    this.hobbies.push(this.formBuilder.control(''));
  }

  /**
   * deleting a hobby on user's request
   */
  removeHobby(index: number): void {
    const hobbies = this.userForm?.get('hobbies') as FormArray;
    hobbies.removeAt(index);
  }

  /**
   * setting the value when user choose framework
   */
  onFramworkChange(): void {
    this.userForm.controls['framework'].setValue(this.selectedFramework);
  }

  /**
   * setting the value when user choose framework version
   */
  onVersionChange(): void {
    this.userForm.controls['frameworkVersion'].setValue(this.selectedVersion);
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.UserService.addUser(this.userForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            of(null)
              .pipe(
                delay(5000),
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
    } else {
      alert('Something went wrong, try again, please');
    }
  }
}
