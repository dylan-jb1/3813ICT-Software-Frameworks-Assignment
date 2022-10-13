import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Socket, io } from 'socket.io-client';

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

  socket: any = {};

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
          this.updateChannel(this.groupChannels[0]);
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
        this.userdata[userId] = {userInfo:userInfo,color:Math.floor(Math.random()*16777215).toString(16)};
        this.ref.detectChanges();
        return userInfo;
      } else {
        return {};
      }
    }
  }

  async profilePictureUpload(event : EventTarget | null) {
    const userToken = localStorage.getItem('token');
    const fileEvent = (event as HTMLInputElement);
    if (fileEvent != null && fileEvent.files && fileEvent.files.length > 0) {
      const uploadedFile = fileEvent.files[0];
      console.log(uploadedFile)

      this.uploadImage(uploadedFile).then((response:any) => response.json()).then(async (data:any) => {
        await fetch("http://localhost:4000/pfp/"+this.user._id, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + userToken
          },
          body: JSON.stringify({
            imgPath: data.imgPath
          })
        })
      });
    }
  }

  async imageChatMessage(event : EventTarget | null) {
    const fileEvent = (event as HTMLInputElement);
    if (fileEvent != null && fileEvent.files && fileEvent.files.length > 0) {
      const uploadedFile = fileEvent.files[0];
      console.log(uploadedFile)

      this.uploadImage(uploadedFile).then((response:any) => response.json()).then((data:any) => {
        this.sendMessage(data);
      });
    }
  }

  async uploadImage(image: File) {
    const userToken = localStorage.getItem('token');

    return fetch('http://localhost:4000/upload', {
      method: "POST",
      headers: {
        Authorization: "Basic " + userToken
      },
      body: image
    })
  };

  async ngOnInit() {
    await this.populateFields();
    this.socket = io("ws://localhost:4000");

    this.socket.on("UserLeftRoom", (username:any) => {
      this.messageReceived({
        "author": "6348324541b6956e6ef7aec2",
        "content": `${username} has left the chat`,
        "time": Math.floor(Date.now()/1000)
      })
      this.userData("6348324541b6956e6ef7aec2");
      this.ref.detectChanges();
    })

    this.socket.on("UserJoinedRoom", (username:any) => {
      this.messageReceived({
        "author": "6348324541b6956e6ef7aec2",
        "content": `${username} has joined the chat`,
        "time": Math.floor(Date.now()/1000)
      })
      this.userData("6348324541b6956e6ef7aec2");
      this.ref.detectChanges();
    })

    this.socket.on("NewMessage", (message: any) => {
      this.messageReceived(message);
    })
  }

  sendMessage(content: any) {
    const newMessage = {content: content, author: this.user._id, time:Math.floor(Date.now()/1000)};
    this.socket.emit("UserMessage", {newMessage:newMessage,channelId:this.activeChannel._id});
  }

  messageReceived(message: any) {
    this.activeChannel.messageHistory.push(message);
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
    if (this.socket.connected)
      this.socket.emit('ChannelUpdate',{newChannel:channel._id,oldChannel:this.activeChannel._id,username:this.user.username});

    this.activeChannel = channel;
    this.updateMessageHistory()
  }

  async updateMessageHistory() {
    const userToken = localStorage.getItem('token');
    const channelInfoRes = (await fetch("http://localhost:4000/display/channels", {
      method: "GET",
      headers: {
        Authorization: "Basic " + userToken
      }
    }));
    const channelInfo = channelInfoRes.ok ? (await channelInfoRes.json()) : [];
    this.channels = channelInfo;
  }

  updateGroup(group: any) {
    this.activeGroup = group;
    this.groupChannels = this.channelIdsToObjects(this.activeGroup.channels);

    for (let x = 0; x < this.groupChannels.length; x++) {
      for (let z = 0; z < this.groupChannels[x].messageHistory.length; z++) {
        this.userData(this.groupChannels[x].messageHistory[z].author)
      }
    }

    if (this.groupChannels.length > 0)
      this.updateChannel(this.groupChannels[0]);
    else {
      this.updateChannel({empty: true})
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
