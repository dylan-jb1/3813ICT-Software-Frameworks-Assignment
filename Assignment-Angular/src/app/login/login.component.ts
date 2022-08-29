import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  username: String = '';
  password: String = '';
  errorMsg: String = '';
  user: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  loginUser(): void {
    const userJsonString = localStorage.getItem('userJson');
    let userJsonObj;
    if (userJsonString != null)
      userJsonObj = JSON.parse(userJsonString);
    if (userJsonObj.users.some((user: any) => {{if (user.username == this.username && user.password == this.password) {this.user = user; return true} else return false}})) {
      localStorage.setItem('user',JSON.stringify(this.user));
      this.router.navigate(["/groups"]);
    } else {
      this.errorMsg = "Invalid credentials. Please try again.";
    }
  }

}
