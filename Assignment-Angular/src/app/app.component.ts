import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import channelJson from '../assets/channel_list.json'
import groupJson from '../assets/group_list.json'
import userJson from '../assets/user_list.json'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Assignment-Angular';

  constructor(private router: Router, private location: Location) { 
    if (localStorage.getItem('token') == null)
      router.navigate(["/login"])
    
    if (this.location.path() == "/") {
      router.navigate(['/groups'])
    } else if (this.location.path() != "/login") {
      // validate user each time a page is loaded
      const userToken = localStorage.getItem('token');
      fetch("http://localhost:4000/me",{
        method: "GET",
        headers: {
          Authorization: "Basic " + userToken
        }
      }).then(response => {
        if (!response.ok) {
          localStorage.removeItem('token');
          router.navigate(["/login"]);
        }
      })
    }
  }
}
