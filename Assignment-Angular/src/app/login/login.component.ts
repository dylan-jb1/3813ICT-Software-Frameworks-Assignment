import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import userJson from "../../assets/user_list.json";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  username: String = '';
  password: String = '';
  errorMsg: String = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  loginUser(): void {
    console.log(this.username + " " + this.password)
    if (userJson.users.some((user) => {console.log(user);return user.username == this.username && user.password == this.password})) {
      localStorage.setItem('username',this.username.toString());
      this.router.navigate(["/groups"]);
    } else {
      this.errorMsg = "Invalid credentials. Please try again.";
    }
  }

}
