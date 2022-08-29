import { Component, OnInit } from '@angular/core';
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

  userTarget: any = {};
  channelTarget: any = {};
  groupTarget: any = {};

  constructor(private router: Router) {
    const userJsonString = localStorage.getItem('userJson');
    if (userJsonString != null) this.users = JSON.parse(userJsonString).users;

    const channelJsonString = localStorage.getItem('channelJson');
    if (channelJsonString != null)
      this.channels = JSON.parse(channelJsonString).channels;

    const groupJsonString = localStorage.getItem('groupJson');
    if (groupJsonString != null)
      this.groups = JSON.parse(groupJsonString).groups;

    const currentUserJsonString = localStorage.getItem('user');
    if (currentUserJsonString != null)
      this.currentUser = JSON.parse(currentUserJsonString);
    else {
      router.navigate(['/login']);
    }
  }

  ngOnInit(): void {}

  roleRequired(role: string, group: any): boolean {
    const roles = ['super_admin', 'group_admin', 'group_assis'];
    const requiredAuth = roles.indexOf(role);
    let maxUserAuth =
      group != null && group.groupAssis.includes(this.currentUser.username)
        ? 2
        : 3;
    for (let x = 0; x < this.currentUser.roles.length; x++) {
      const roleIndex = roles.indexOf(this.currentUser.roles[x]);
      if (maxUserAuth > roleIndex && roleIndex != -1) {
        maxUserAuth = roleIndex;
      }
    }

    return maxUserAuth <= requiredAuth;
  }

  filter(channels: any, group: any) {
    return channels.filter((channel: any) =>
      group.channels.includes(channel.channelId)
    );
  }

  getRoles(user: any, group: any) {
    let roleArr = [];
    if (user.roles.length > 0) roleArr.push(user.roles.join(', '));
    if (group.groupAssis.includes(user.username))
      roleArr.push('group_assis (This group)');

    return roleArr.join(', ');
  }

  getChannels(user: any, group: any) {
    if (group.channels != undefined) {
      // filter to only channels where user is included in the userAccess
      const userAuthChannels = group.channels.filter((channel: any) => {
        // find the channel object from the channelId;
        const channelObj = this.channels.find((thisChannel: any) => {
          return thisChannel.channelId == channel;
        });
        return channelObj.userAccess.includes(user.username);
      });
      return userAuthChannels;
    } else return [];
  }

  getUser(username: string) {
    return this.users.find((user: any) => {
      return user.username == username;
    });
  }

  userGroups(user: any) {
    return this.groups
      .filter((group: any) => {
        return group.users.includes(user.username);
      })
      .map((group: any) => group.groupId);
  }

  saveGroup(groupName: string, groupId: string) {
    this.groups.push({
      groupId: groupId,
      groupName: groupName,
      channels: [],
      users: [],
      groupAssis: [],
    });

    localStorage.setItem('groupJson', JSON.stringify({ groups: this.groups }));
  }

  validNewGroup(groupId: string, groupValue: string) {
    return (
      groupId.includes(' ') ||
      groupId == '' ||
      groupValue == '' ||
      this.groups.filter((group: any) => {
        return group.groupId == groupId;
      }).length != 0
    );
  }

  saveGroupChanges(username: string) {
    const changes = Object.keys(this.groupValues);

    for (let x = 0; x < changes.length; x++) {
      const groupObj = this.groups.find((group: any) => {
        return group.groupId == changes[x];
      });
      if (this.groupValues[changes[x]] == false) {
        // if user is in this group
        if (groupObj.users.includes(username)) {
          // remove them from group
          groupObj.users.splice(groupObj.users.indexOf(username), 1);
        } else {
          // dont need to do anything
        }
      } /* if true */ else {
        // if user already in this group
        if (groupObj.users.includes(username)) {
          // dont need to do anything
        } else {
          // add user to group
          groupObj.users.push(username);
        }
      }
    }

    this.groupValues = {};
    // update groups with changes
    localStorage.setItem('groupJson', JSON.stringify({ groups: this.groups }));
  }

  saveChannelChanges(username: string, makeGroupAssis: boolean | null, group: any) {
    const changes = Object.keys(this.channelValues);

    console.log(changes);

    for (let x = 0; x < changes.length; x++) {
      const channelObj = this.channels.find((channel: any) => {
        return channel.channelId == changes[x];
      });
      if (this.channelValues[changes[x]] == false) {
        // if user is in this channel
        if (channelObj.userAccess.includes(username)) {
          // remove them from channel
          channelObj.userAccess.splice(
            channelObj.userAccess.indexOf(username),
            1
          );
        } else {
          // dont need to do anything
        }
      } /* if true */ else {
        // if user already in this channel
        if (channelObj.userAccess.includes(username)) {
          // dont need to do anything
        } else {
          // add user to channel
          channelObj.userAccess.push(username);
        }
      }
    }

    if (group != null && makeGroupAssis != null) {
      const groupObj = this.groups.find((thisGroup: any) => {return thisGroup.groupId == group.groupId})
      if (makeGroupAssis) {
        if (!groupObj.groupAssis.includes(username))
          groupObj.groupAssis.push(username);
      }
      else {
        if (groupObj.groupAssis.includes(username))
          groupObj.groupAssis.splice(groupObj.groupAssis.indexOf(username),1);
      }
    }

    this.channelValues = {};
    // update groups with changes
    localStorage.setItem(
      'channelJson',
      JSON.stringify({ channels: this.channels })
    );
    localStorage.setItem(
      'groupJson',
      JSON.stringify({ groups: this.groups })
    );
  }

  setGroupValue(groupId: string, event: any) {
    this.groupValues[groupId] = event.target.checked;
  }

  setChannelValue(channelId: string, event: any) {
    this.channelValues[channelId] = event.target.checked;
  }

  saveAdminChanges(username: string) {
    const radioList: any = document.querySelector('input[name="flexRadioDefault"]:checked');
    if (radioList != null) {
      this.adminVal = radioList.value
    } else {
      this.adminVal = '';
    }

    this.users.find((user: any) => {return user.username == username}).roles = this.adminVal == '' ? [] : [this.adminVal];
    
    // update users with changes
    localStorage.setItem(
      'userJson',
      JSON.stringify({ users: this.users })
    );
  }

  createNewUser(username: string, email: string, password: string) {
    this.users.push({
      username: username,
      email: email,
      password: password,
      roles: []
    })

    localStorage.setItem('userJson', JSON.stringify({users: this.users}))
  }

  validUser(username: string, email: string, password: string): boolean {
    return !(this.users.some((user: any) => {return user.username==username})) && username.trim() != '' && password.trim() != '' && email.trim() != '';
  }
}
