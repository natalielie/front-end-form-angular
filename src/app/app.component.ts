import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  NgForm,
  FormArray,
} from '@angular/forms';

import { frameworksWithVer } from './utils/frameworks';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  selectedFramework: string = '';
  selectedVersion: string = '';
  currentHobby!: string;
  #destroy: Subject<boolean> = new Subject<boolean>();

  constructor(
    //private configService: ConfigService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      firstName: new FormControl<string>('', [Validators.required]),
      lastName: new FormControl<string>('', [Validators.required]),
      dateOfBirth: new FormControl<Date>(new Date(), [Validators.required]),
      framework: new FormControl('', [Validators.required]),
      frameworkVersion: new FormControl('', [Validators.required]),
      email: new FormControl<string>(
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          // emailDomainValidator,
        ])
      ),
      hobbies: this.formBuilder.array([new FormControl<string>('')]),
    });

    /* this.userForm = this.fb.group({
      firstName: this.fb.control<string>('', [Validators.required]),
      lastName: this.fb.control<string>('', [Validators.required]),
      dateOfBirth: this.fb.control<Date>(new Date(), [Validators.required]),
      framework: this.fb.control(this.selectedFramework),
      frameworkVersion: this.fb.control(this.selectedVersion),
      email: this.fb.control<string>(
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          emailDomainValidator,
        ])
      ),
      hobbies: this.fb.array([], Validators.required),
    });*/

    this.userForm.valueChanges
      .pipe(takeUntil(this.#destroy))
      .subscribe((value) => {
        console.log('changed value', value);
      });
  }

  ngOnDestroy() {
    this.#destroy.next(true);
    this.#destroy.unsubscribe();
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

  onSubmit() {
    console.log(this.selectedFramework);
    console.log(this.selectedVersion);
    //this.user = this.userForm.getRawValue();
    console.log(this.userForm.value);

    this.userForm.disable();
  }
}
