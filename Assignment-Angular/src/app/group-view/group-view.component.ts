import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import channelJson from '../../assets/channel_list.json'
import groupJson from '../../assets/group_list.json'

@Component({
  selector: 'app-group-view',
  templateUrl: './group-view.component.html',
  styleUrls: ['./group-view.component.css']
})
export class GroupViewComponent implements OnInit {

  username: String;
  groups: any = [];
  channels: any = [];
  activeGroup: any = {};
  activeChannel: any = {empty:true};

  constructor(private router: Router) { 
    const username = localStorage.getItem('username');
    if (username == null) {
      this.username = '';
      this.router.navigate(["/login"]);
    } else {
      this.username = username;
      
      this.groups = groupJson.groups.filter(group => {
        if (group.users.includes(username)) return true; else return false;
      })

      if (this.groups.length > 0) {
        this.activeGroup = this.groups[0];
  
        this.channels = channelJson.channels.filter(channel => {
          if ([...channel.bannedUsers, ''].includes(username) || !this.activeGroup.channels.includes(channel.channelId)) {return false;} else {return true};
        })
  
        this.activeChannel = this.channels[0];
      }
    }
  }

  ngOnInit(): void {
    if (this.username == '') {
      localStorage.removeItem('username');
      this.router.navigate(["/login"]);
    } else {

    }
  }

  updateChannel(channel: any): void {
    this.activeChannel = channel;
  }

  updateGroup(group: any): void {
    this.activeGroup = group;

    this.channels = channelJson.channels.filter(channel => {
      if ([...channel.bannedUsers, ''].includes(this.username.toString()) || !this.activeGroup.channels.includes(channel.channelId)) {return false;} else {return true};
    })

    if (!this.activeGroup.channels.includes(this.activeChannel.channelId))
      this.activeChannel = this.channels[0];
  }

  logout(): void {
    localStorage.removeItem('username');
    this.router.navigate(["/login"]);
  }
}
