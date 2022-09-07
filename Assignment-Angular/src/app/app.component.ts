import { Component } from '@angular/core';
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

  constructor(private router: Router) { 
    if (localStorage.getItem('userJson') == null)
      localStorage.setItem('userJson',JSON.stringify(userJson));
    if (localStorage.getItem('groupJson') == null)
      localStorage.setItem('groupJson',JSON.stringify(groupJson));
    if (localStorage.getItem('channelJson') == null)
      localStorage.setItem('channelJson',JSON.stringify(channelJson));

    if (localStorage.getItem('user') == null)
      router.navigate(["/login"])
    
    console.log(router.url)
    if (router.url == "/") {
      router.navigate(['/groups'])
    }
  }
}
