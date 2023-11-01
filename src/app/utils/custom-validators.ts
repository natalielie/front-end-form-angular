import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';

import { UserService } from '../services/user-api.service';

/**
 * A class with custom validators
 */
export class CustomValidators {
  /**
   * validation of minimum age
   */
  static minimumAgeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!control.value) {
        return null;
      }
      const birthDate = new Date(control.value).getTime();
      const currentDate = Date.now();
      const age = Math.floor(
        (currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
      );

      if (age < 18 || age > 123) {
        return { ageInvalid: true };
      }
      return null;
    };
  }

  /**
   * validion of existing email
   */
  static emailValidator(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return userService.checkEmailExists(control.value).pipe(
        map((isEmailTaken) => (isEmailTaken ? { emailTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }
}
