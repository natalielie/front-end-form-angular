import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../interfaces/user';
/**
 * headers for requests
 */
const httpOptions: { headers: HttpHeaders } = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

/**
 * a service to work with user requests from server
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_URL = 'http://localhost:3000/users/';

  constructor(private http: HttpClient) {}

  /**
   * getting all users from the db
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  /**
   * adding a user to the db
   */
  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.API_URL, user, httpOptions);
  }

  /**
   * getting the users and checking wheter the given email is already in the db
   */
  checkEmailExists(email: string): Observable<boolean> {
    return this.http
      .get<User[]>(this.API_URL)
      .pipe(map((users) => users.some((user) => user.email === email)));
  }
}
