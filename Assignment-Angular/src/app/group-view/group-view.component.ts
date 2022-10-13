import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-view',
  templateUrl: './group-view.component.html',
  styleUrls: ['./group-view.component.css']
})
export class GroupViewComponent implements OnInit {

  username: String = '';
  user: any;
  groups: any = [];
  channels: any = [];
  groupChannels: any = [];
  activeGroup: any = {};
  activeChannel: any = {empty:true};
  userdata: any = {};

  constructor(private router: Router,private ref:ChangeDetectorRef) { 
  }

  async populateFields() {
    const userToken = localStorage.getItem('token');

    if (userToken == null) {
      this.router.navigate(["/login"]);
    } else {
      const userInfoRes = await (await fetch("http://localhost:4000/me", {
        method: "GET",
        headers: {
          Authorization: "Basic " + userToken
        }
      }));

      const groupInfoRes = await (await fetch("http://localhost:4000/display/groups", {
        method: "GET",
        headers: {
          Authorization: "Basic " + userToken
        }
      }));
      
      const channelInfoRes = await (await fetch("http://localhost:4000/display/channels", {
        method: "GET",
        headers: {
          Authorization: "Basic " + userToken
        }
      }));
      
      const userInfo = userInfoRes.ok ? (await userInfoRes.json()) : {};
      const groupInfo = groupInfoRes.ok ? (await groupInfoRes.json()) : [];
      const channelInfo = channelInfoRes.ok ? (await channelInfoRes.json()) : [];

      this.username = userInfo.username;

      this.user = userInfo;
      this.groups = groupInfo;
      this.channels = channelInfo;

      if (this.groups.length > 0) {
        this.activeGroup = this.groups[0];
        this.groupChannels = this.channelIdsToObjects(this.activeGroup.channels);

        for (let x = 0; x < this.groupChannels.length; x++) {
          for (let z = 0; z < this.groupChannels[x].messageHistory.length; z++) {
            this.userData(this.groupChannels[x].messageHistory[z].author)
          }
        }
  
        if (this.groupChannels.length > 0)
          this.activeChannel = this.groupChannels[0];
      }
    }
  }

  async userData(userId: string) {
    const userToken = localStorage.getItem('token');
    if (this.userdata[userId]) {
      return this.userdata[userId]
    } else {
      //fetch user info
      const userInfo = await (await fetch("http://localhost:4000/id?user="+userId, {
        method: "GET",
        headers: {
          "Authorization": "Basic " + userToken,
          "Content-Type": "application/json"
        }
      })).json()
      if (userInfo) {
        this.userdata[userId] = userInfo;
        console.log(this.userdata);
        this.ref.detectChanges();
        return userInfo;
      } else {
        return {};
      }
    }
  }

  async ngOnInit() {
    await this.populateFields();
  }

  channelIdsToObjects(channelIds: Array<string>) {
    const channelArr = [];
    for (let x = 0; x < this.channels.length; x++) {
      if (channelIds.includes(this.channels[x]['_id'])) {
        channelArr.push(this.channels[x]);
      }
    }
    return channelArr;
  }

  updateChannel(channel: any): void {
    this.activeChannel = channel;
  }

  updateGroup(group: any) {
    this.activeGroup = group;
    this.groupChannels = this.channelIdsToObjects(this.activeGroup.channels);

    for (let x = 0; x < this.groupChannels.length; x++) {
      for (let z = 0; z < this.groupChannels[x].messageHistory.length; z++) {
        this.userData(this.groupChannels[x].messageHistory[z].author)
      }
    }

    if (!this.activeGroup.channels.includes(this.activeChannel['_id']))
      if (this.groupChannels.length > 0)
        this.activeChannel = this.groupChannels[0];
      else {
        this.activeChannel = {empty: true}
      }
  }

  userHasPrivilige(): boolean {
    if (this.user)
      return this.user.role>0 || this.groups.some((group: any) => {return group.groupAssis.includes(this.user["_id"])})
    return false
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(["/login"]);
  }
}
