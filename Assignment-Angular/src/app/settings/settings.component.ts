import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  currentUser: any = {};

  users: any = [];
  groups: any = [];
  channels: any = [];

  groupValues: any = {};
  channelValues: any = {};
  adminVal: string = '';

  formVal: number = 0;

  userTarget: any = {};
  channelTarget: any = {};
  groupTarget: any = {};

  constructor(private router: Router, private ref:ChangeDetectorRef) {
    this.getUserList();
    this.getChannelList();
    this.getGroupList();

    const userToken = localStorage.getItem('token');
    if (userToken != null)
      this.getCurrentUser();
    else {
      router.navigate(['/login']);
    }
  }

  async getCurrentUser() {
    const userToken = localStorage.getItem('token');

    fetch("http://localhost:4000/me", {
      method: "GET",
      headers: {
        "Authorization": "Basic " + userToken,
        "Content-Type": "application/json"
      }
    })
      .then(data => data.json())
      .then(data => {
        this.currentUser = data;
        this.ref.detectChanges();
      })
      .catch(e => console.log(e));
  }

  async getUserList() {
    const userToken = localStorage.getItem('token');

    fetch("http://localhost:4000/users", {
      method: "GET",
      headers: {
        "Authorization": "Basic " + userToken,
        "Content-Type": "application/json"
      }
    })
      .then(data => data.json())
      .then(data => {
        this.users = data;
        this.ref.detectChanges();
      })
      .catch(e => console.log(e));
  }

  async getChannelList() {
    const userToken = localStorage.getItem('token');

    fetch("http://localhost:4000/channels", {
      method: "GET",
      headers: {
        "Authorization": "Basic " + userToken,
        "Content-Type": "application/json"
      }
    })
      .then(data => data.json())
      .then(data => {
        this.channels = data;
        this.ref.detectChanges();
      })
      .catch(e => console.log(e));
  }

  async getGroupList() {
    const userToken = localStorage.getItem('token');

    fetch("http://localhost:4000/groups", {
      method: "GET",
      headers: {
        "Authorization": "Basic " + userToken,
        "Content-Type": "application/json"
      }
    })
      .then(data => data.json())
      .then(data => {
        this.groups = data;
        this.ref.detectChanges();
      })
      .catch(e => console.log(e));
  }

  ngOnInit(): void {}

  returnToGroups() {
    this.router.navigate(['/groups'])
  }

  async deleteUser(user: any) {
    const userToken = localStorage.getItem('token');
    await fetch("http://localhost:4000/users/"+user['_id'], {
      method: "DELETE",
      headers: {
        Authorization: "Basic " + userToken,
        "Content-Type": "application/json"
      }
    })
  }

  async deleteChannel(channel: any) {
    const userToken = localStorage.getItem('token');
    await fetch("http://localhost:4000/channels/"+channel['_id'], {
      method: "DELETE",
      headers: {
        Authorization: "Basic " + userToken,
        "Content-Type": "application/json"
      }
    })
  }

  async deleteGroup(group: any) {
    const userToken = localStorage.getItem('token');
    await fetch("http://localhost:4000/groups/"+group['_id'], {
      method: "DELETE",
      headers: {
        Authorization: "Basic " + userToken,
        "Content-Type": "application/json"
      }
    })
  }

  async userExists(user: any) {
    const userToken = localStorage.getItem('token');
    const userFound = await (await fetch("http://localhost:4000/user?user="+user["_id"], {
      method: "GET",
      headers: {
        Authorization: "Basic " + userToken,
        "Content-Type": "application/json"
      }
    })).json()

    if (userFound == null) {
      return null
    } else {
      return userFound.username;
    }
  }

  roleRequired(role: string, group: any): boolean {
    const roles = ['super_admin', 'group_admin', 'group_assis'];
    const requiredAuth = roles.indexOf(role);
    const userAuth = this.currentUser.role;

    if (requiredAuth ==2 && group != null && group.groupAssis && group.groupAssis.includes(this.currentUser["_id"])) {
      return true;
    } else if (requiredAuth >= 1 && this.currentUser.role == 1) {
      return true;
    } else if (requiredAuth >= 0 && this.currentUser.role == 2) {
      return true;
    }

    return false;
  }

  filter(channels: any, group: any) {
    return channels.filter((channel: any) => group.channels.includes(channel['_id']));
  }

  getRoles(user: any, group: any) {
    const roles = ["","group_admin", "super_admin"];
    let roleArr = user.role> 0 ?[roles[user.role]]:[];
    if (group.groupAssis.includes(user["_id"]))
      roleArr.push('group_assis (This group)');

    return roleArr.join(', ');
  }

  getChannels(user: any, group: any) {
    if (group.channels != undefined) {
      // filter to only channels where user is included in the userAccess
      const userAuthChannels = group.channels.filter((channel: any) => {
        // find the channel object from the channelId;
        const channelObj = this.channels.find((thisChannel: any) => {
          return thisChannel['_id'] == channel;
        });
        if (channelObj != null)
          return channelObj.userAccess.includes(user._id);
      });
      return userAuthChannels;
    }
    return [];
  }

  async updateData() {
    this.getUserList();
    this.getChannelList();
    this.getGroupList();
  }

  getUser(userId: string) {
    return this.users.find((user: any) => {
      return (user._id == userId);
    });
  }

  userGroups(user: any) {
    return this.groups
      .filter((group: any) => {
        return group.users.includes(user._id);
      })
      .map((group: any) => group['_id']);
  }

  async createGroup(groupName: string) {
    const userToken = localStorage.getItem('token');
    var newObj;
    await fetch('http://localhost:4000/groups', {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "Authorization": "Basic " + userToken
      },
      body: JSON.stringify({
        users: [],
        channels: [],
        groupAssis: [],
        name: groupName
      })
    }).then(data => data.json())
    .then(groupObject => {
      newObj = groupObject;
    }).catch(e => {
      console.log(e);
    })
    this.updateData();
    return newObj;
  }

  async createChannel(channelName: string, groupId: string) {
    const userToken = localStorage.getItem('token');
    var newObj;
    await fetch('http://localhost:4000/channels', {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "Authorization": "Basic " + userToken
      },
      body: JSON.stringify({
        userAccess: [],
        messageHistory: [],
        name: channelName
      })
    }).then(data => data.json())
    .then(async channelObj => {
      newObj = channelObj;
      await this.updateGroup(groupId, {channels: channelObj.channelId}, {}, {})
    }).catch(e => {
      console.log(e);
    })
    this.updateData();
    return newObj;
  }

  async createNewUser(username: string, email: string, password: string) {
    const userToken = localStorage.getItem('token');
    var newObj;
    await fetch('http://localhost:4000/users', {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "Authorization": "Basic " + userToken
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password
      })
    }).then(data => data.json())
    .then(userObj => {
      newObj = userObj;
    }).catch(e => {
      console.log(e);
    })
    this.updateData();
    return newObj;
  }

  async updateGroup(groupId: string, addData: any, removeData: any, updateData: any) {
    const userToken = localStorage.getItem('token');
    await fetch("http://localhost:4000/groups/"+groupId, {
      method: "PATCH",
      headers: {
        "Content-Type":"application/json",
        "Authorization": "Basic " + userToken
      },
      body: JSON.stringify({
        add: addData,
        remove: removeData,
        update: updateData
      })
    }).then(response => {
      if (response.ok) {
        console.log("Group information changed successfully.");
      } else {
        console.log(response.status);
      }
    })
    this.updateData();
  }

  async updateChannel(channelId: string, addData: any, removeData: any, updateData: any) {
    const userToken = localStorage.getItem('token');
    await fetch("http://localhost:4000/channels/"+channelId, {
      method: "PATCH",
      headers: {
        "Content-Type":"application/json",
        "Authorization": "Basic " + userToken
      },
      body: JSON.stringify({
        add: addData,
        remove: removeData,
        update: updateData
      })
    }).then(response => {
      if (response.ok) {
        console.log("Channel information changed successfully.");
      } else {
        console.log(response.status);
      }
    })
    this.updateData();
  }

  async updateUser(userId: string, addData: any, removeData: any, updateData: any) {
    const userToken = localStorage.getItem('token');
    await fetch("http://localhost:4000/users/"+userId, {
      method: "PATCH",
      headers: {
        "Content-Type":"application/json",
        "Authorization": "Basic " + userToken
      },
      body: JSON.stringify({
        add: addData,
        remove: removeData,
        update: updateData
      })
    }).then(response => {
      if (response.ok) {
        console.log("User information changed successfully.");
      } else {
        console.log(response.status);
      }
    })
    this.updateData();
  }

  updateGroupValues(userTarget: any) {
    Object.keys(this.groupValues).forEach((key) => {
      this.updateGroup(
        key,
        {'users': this.groupValues[key] ? userTarget._id : undefined},
        {'users': this.groupValues[key] ? undefined : userTarget._id},
        {}
      )
    });
    this.groupValues = {};
  }

  updateChannelValues(userTarget: any) {
    Object.keys(this.channelValues).forEach((key) => {
      this.updateChannel(
        key,
        {'userAccess': this.channelValues[key] ? userTarget._id : undefined},
        {'userAccess': this.channelValues[key] ? undefined : userTarget._id},
        {}
      )
    });
    this.channelValues = {};
  }

  setGroupValue(groupId: string, event: any) {
    this.groupValues[groupId] = event.target.checked;
  }

  setChannelValue(channelId: string, event: any) {
    this.channelValues[channelId] = event.target.checked;
  }

  validUser(username: string, email: string, password: string): boolean {
    return !(this.users.some((user: any) => {return user.username==username})) && username.trim() != '' && password.trim() != '' && email.trim() != '';
  }
}
