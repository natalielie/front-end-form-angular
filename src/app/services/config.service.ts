import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../interfaces/user';

const httpOptions: { headers: HttpHeaders } = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private API_URL = 'http://localhost:3000/users/';

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http
      .get<User[]>(this.API_URL)
      .subscribe((val) => console.log(val));
  }

  public addUser(user: User): Observable<User> {
    return this.http.post<User>(this.API_URL, user, httpOptions);
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http
      .get<User[]>(`${this.API_URL}?email=${email}`)
      .pipe(map((users) => users.length > 0));
  }
}
