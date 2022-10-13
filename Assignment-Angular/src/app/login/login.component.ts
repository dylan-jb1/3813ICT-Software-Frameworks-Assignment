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
    fetch("http://localhost:4000/login", {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        username: this.username,
        password: this.password
      })
    }).then(data => data.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token',data.token);
          this.router.navigate(["/groups"]);
        } else {
          this.errorMsg = "Invalid credentials. Please try again.";
        }
      }).catch(e => this.errorMsg = e.toString());
  }

}
