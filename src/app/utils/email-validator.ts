import { FormControl } from '@angular/forms';
import { ConfigService } from '../services/config.service';

let configService: ConfigService;

export function emailDomainValidator(control: FormControl) {
  let email = control.value;
  if (configService.findEmail(email)) {
    throw new Error();
  }
  return null;
}
