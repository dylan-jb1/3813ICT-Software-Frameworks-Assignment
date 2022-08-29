import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-view',
  templateUrl: './group-view.component.html',
  styleUrls: ['./group-view.component.css']
})
export class GroupViewComponent implements OnInit {

  username: String;
  user: any;
  groups: any = [];
  channels: any = [];
  activeGroup: any = {};
  activeChannel: any = {empty:true};

  constructor(private router: Router) { 
    const user = localStorage.getItem('user');
    if (user == null) {
      this.username = '';
      this.router.navigate(["/login"]);
    } else {
      const userObj = JSON.parse(user);
      this.username = userObj.username;
      this.user = userObj;

      let groupJson;
      const groupJsonString = localStorage.getItem('groupJson');
      if (groupJsonString != null)
        groupJson = JSON.parse(groupJsonString);
      
      this.groups = groupJson.groups.filter((group: any) => {
        if (group.users.includes(this.username.toString())) return true; else return false;
      })

      if (this.groups.length > 0) {
        this.activeGroup = this.groups[0];
  
        let channelJson;
        const channelJsonString = localStorage.getItem('channelJson');
        if (channelJsonString != null)
          channelJson = JSON.parse(channelJsonString);

        this.channels = channelJson.channels.filter((channel: any) => {
          if (!([...channel.userAccess, ''].includes(this.username.toString())) || !this.activeGroup.channels.includes(channel.channelId)) {return false;} else {return true};
        })
  
        console.log(this.channels)
        if (this.channels.length > 0)
          this.activeChannel = this.channels[0];
      }
    }
  }

  ngOnInit(): void {
    if (this.username == '') {
      localStorage.removeItem('user');
      this.router.navigate(["/login"]);
    } else {

    }
  }

  updateChannel(channel: any): void {
    this.activeChannel = channel;
  }

  updateGroup(group: any): void {
    this.activeGroup = group;

  
    let channelJson;
    const channelJsonString = localStorage.getItem('channelJson');
    if (channelJsonString != null)
      channelJson = JSON.parse(channelJsonString);

    this.channels = channelJson.channels.filter((channel: any) => {
      if (!([...channel.userAccess, ''].includes(this.username.toString())) || !this.activeGroup.channels.includes(channel.channelId)) {return false;} else {return true};
    })

    if (!this.activeGroup.channels.includes(this.activeChannel.channelId))
      if (this.channels.length > 0)
        this.activeChannel = this.channels[0];
      else {
        this.activeChannel = {empty: true}
      }
  }

  userHasPrivilige(): boolean {
    return this.user.roles.length >0 || this.groups.some((group: any) => {return group.groupAssis.includes(this.username)})
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(["/login"]);
  }
}
