# Assignment Project for 3813ICT
Below is all of the information describing the technicalities of as well as the development process of the 3813ICT Software Frameworks Assignment.

# Documentation

Below is the documentation for phase 1 of the assignment. It also contains artefacts of information that may not be implemented yet, and may be inaccurate. This is because this documentation is written as a plan for the future development to be done in phase 2, and represents the end goal rather than the current state.

## Terminology in this report
- `The app/application` - This referse specifically to the angular part of the assignment project, and does not include the node server that hosts the back end.
- `The server` - This refers to the backend server that is not used to handle UI, and containes routes. (Implemented only in phase 2)
- `Group` - This is a group as per the assignment specification, in which users can be assigned and view channels within. Can also have a Group Assis.
- `Channel` -  A channel is where users can type their messages and view the chat history, and these channels are assigned to groups, and only specific users have access to any given channel.
- `User` - A registered user within the data of the project. Can read/write messages, and have permissions which may grant the ability to modify the contents of the database.

## Git
The GitHub repository for the assignment is hosted [here.](https://github.com/dylan-jb1/3813ICT-Software-Frameworks-Assignment)

### Layout
All of the work that has been completed for Phase 1 is hosted on the Main branch, where development will continue. Due to the straightforward nature of the work, the implementation of multiple branches into my workflow would only create unneccessary complications throughout the development process. The benefits of a multi-branch system are clear when a user is working in a group, and must confirm the viability of the changes that are being attempted, but as I am working alone this is an overkill solution and thus wont be implemented.

### Commit Frequency
A commit would be made to the repository when the development of a block functionality was added, and the ability for a rollback was desirable. This saved time with constant commits to the main repository, and also helps to keep the commit history clean. A commit would also be made at the end of each session where development took place, in order to insure that no progress was lost and that I was working on the most up to date version of my application.

For phase 1 of the assignment, there are 4 major commits. 
| Commit Name | Description | Link |
| - | - | - |
| Initial commit | This commit made no functional changes, and simply served as the creation of a new GitHub repository |[Link](https://github.com/dylan-jb1/3813ICT-Software-Frameworks-Assignment/commit/2da063d577aff3f3e9800fdb765c95442e927d67)
| Initial commit and basic UI design | This commit contained major changes to the layout of the git repository, and contained all of the angular code initialisation, as well as a basic layout for the UI of the future project. The project contained no functionality at this stage. | [Link](https://github.com/dylan-jb1/3813ICT-Software-Frameworks-Assignment/commit/f8e23909fd891340f0c7aa588fbd586694925e1c) |
| Login functionality + dynamic content | The changes in this commit brought life to the featurless UI added in the previous commit, and was where the implementation of dynamically setting the page content based on variables in the code was made. At this state of development, information was taken directly from local JSON files rather than as serialised strings stored in code or from a Database. With this, a user was able to log in, see all of the channels and groups that they had been assigned to, and view the chat history of that channel/group combination. | [Link](https://github.com/dylan-jb1/3813ICT-Software-Frameworks-Assignment/commit/b529fb420fc45740613b7d4aa66703a153f9cd2a) |
| README/TODO + Settings functionality | This commit added the settings page to the repository, which is the component in the application that handles the creation/modification/deletion of users, groups, and channels. This page only shows users the relevant forms and abilities that their permissions allow, and the button to access this page is not visible if they aren't permitted to do anything. The commit also initialised this README file with the TODO at the bottom of the page. | [Link](https://github.com/dylan-jb1/3813ICT-Software-Frameworks-Assignment/commit/048a30ab50700ae39875ae59be196df83e1de560) |


# Data Structures
This project has a requirement that uses data extracted from a database (eventually, in phase 2) to dynamically change how a user can interact with the site. There are 4 different types of data structures used in this project, which collectively hold all of the information required to achieve the functionality defined in the assignment specifications.

## Users
The users data structure is an array of user objects, which contains information about all of the registered users and the permissions they have. A user object is of a standard format, which an example of is given below:
```JSON
{
    "id": <UUID>,
    "username": <String>,
    "email": <String>,
    "password": <String>,
    "role": Array<Number 0-2>
}
```
### Values
- `id`: Unique identifier number that represents the user.
- `username`: User defined name of their account that is visible to other users, also unique.
- `email`: The email assigned to this user. Not visible to other users without permissions.
- `password`: The password of this user. Used when logging in to confirm the identity that the client is claiming.
- `role`: A number from 0-2 representing the permissions that the user has in this application. 0 meaning none, 1 meaning Group Admin, and 2 meaning Super Admin. Identification of group assis is defined in the group data object.

## Groups
The groups data structure is an array of group objects, containing all of the linked channels to a group, as well as other information.
```JSON
{
    "_id": <UUID>,
    "name": <String>,
    "channels": Array<UUID>,
    "users": Array<UUID>,
    "groupAssis": Array<UUID>,
}
```

### Values
- `id`: Unique identifier number for this group.
- `name`: The user-friendly name of this group that is displayed to end users.
- `channels`: An array of UUIDs of channels that are assigned to this group.
- `users`: An array of UUIDs of users that have been added to this group.
- `groupAssis`: An array of UUIDs of users that have been granted permission to act as Group Assistant of this group, being able to add new channels and assign/unassign users to channels.

## Channels
The channels array contains channel objects, containing information about the chat history of a given channel, as well as the users who are permitted to access that channel.
```JSON
{
    "_id": <UUID>,
    "name": <String>,
    "userAccess": Array<UUID>,
    "messageHistory": Array<Message>
}
```

### Values
- `_id`: The unique identifier of this channel.
- `name`: The user-friendly name of this channel that will be shown in the UI.
- `userAccess`: The list of users that have read/write access to this channel.
- `messageHistory`: An array of Message objects that contains information about every message that has been sent to this channel.

## Message
A message object contains identification information for a given message, as well as the content and the user that posted that message.

```JSON
{
    "_id": <UUID>,
    "author": <UUID>,
    "content": <String>,
    "time": <Int>
}
```

### Values
- `_id`: The unique identifier of this message.
- `author`: The unique identifier of the author of this message.
- `content`: A string representing the content that was sent with this message.
- `time`: A 64-bit integer that represents the number of milliseconds since the epoch that the message was sent.

# Angular
## Services
When the Node.js server interaction is implemented, there will be a service created that will handle the interaction between the UI and the requests to the server. This will create a disconnect from the view and the controller, and greatly improve the simplicity of this implementation. Due to the requirement stating that data be hosted in local storage for phase 1, the implementation of a Node.js server was deemed unneccesary.

## Components
There are only 4 components used in the creation of this angular project. Each page is represented by a component, so there is one for groups, settings, login, and the home page. Each component has been styled using the css and js provided by the Bootstrap library.

### Home
This is the default route of the program, reach by directing to `/`. This hosts the router module and is a container for the rest of the pages. The code for this page handles redirects to `/login` when a user is not logged in, and to `/groups` when they have successfully authenticated. This component also extracts the json data from the local files when the page is first loaded. This will be changed in phase 2 of the assignment and replaced with functionality in the other components.

### Login
This page handles the login for the user, and can be access at the `/login` route. It consists of 2 text input fields, for username and password, as well as a button to submit login. This page also contains a hidden dialog box that displays an error to the user if the credentials that were used for login are invalid. On a successful login, this page will redirect to `/groups`, where the user can now see the assigned groups and channels, as well as chat history.

### Settings
This page has complex logic behind the scenes to control what screen elements are displayed based on the permissions of the user. It can be accessed at the `/settings` route. The page utilises modals for controlling how components are edited, and the entering of the data that is being changed. Groups, channels, and users can be edited, created, and deleted here if the viewer has the required permissions.

The modals used for editing the components of the data are displayed as popups that cover the screen when the relevant element on the page is selected. The contents of these modals vary depending on the function and the permissions of the user. The page also implements an accordion display, with an accordion item for each group that displayed the channels and members assigned to each one.

**Create user modal** <br/>
This modal contains 3 text boxes for the input of information regarding a user. This includes the `username`, `email`, and the `password`. The modal also has 2 buttons for control of the menu, `close` and `save changes`, which will close the modal without making any change, and create a new user modal respectively. <br/><br/>
_This modal is only visible for users with the `group_admin` permission or above._

**Edit user modal** <br/>
This modal displays a checkbox list that represents all of the groups available, which can be used to assign a user to new groups or remove them from ones that they are already in. If the user is a `super_admin`, there is also a checkbox menu that will allow a user to be reassigned to `super_admin`, `group_admin`, or `no_permissions`. A user with the `super_admin` role can also use this modal to delete a user. <br/><br/>
_This modal is only visible for users with the `group_admin` permission or above._

**Create channel modal** <br/>
This modal contains one text box that allows an admin to enter a channel name, and save the creation of a new channel. The button to activate this is contained under the list of channels under a group accordion item, and it's creation will assign this channel to this group.  <br/><br/>
_This modal is only visible for users with the `group_assis` permission or above._

**Edit channel modal** <br/>
This modal contains only a single text box, allowing an admin to edit the name of this channel. If the admin is a `group_admin` or above, they are also presented with a button that will delete this channel, and remove it's message history.  <br/><br/>
_This modal is only visible for users with the `group_assis` permission or above._

**Edit user in group modal** <br/>
This modal is accessed by selecting a user under a group accordion item. This will allow an admin to select the channels that a user in this group can see and type in via the selection of a list of checkboxes. If a user is a `group_admin` or higher, this modal will also contain a checkbox that the admin can use to make a user a `group_assis` of this group. <br/><br/>
_This modal is only visible for users with the `group_assis` permission or above._

**Create group modal** <br/>
This modal allows an admin to create a new group, which can then have channels and users assigned to it. This modal contains a single text box for inputting the name of the new group that is being created, and a save button to confirm the creation. <br/><br/>
_This modal is only visible for users with the `group_admin` permission or above._

**Group settings accordion** <br/>
This is an accordion UI item that is a list of labels representing each group, that can be expanded. Expanding one of these items will present the channels and the users in this group. A group is only visible is an admin is at least `group_assis` of that group. If a user is `group_admin` or higher, they can see and access all groups. If a user is `super_admin` or above, they will also see a `Delete Group` button. <br/><br/>
_This UI element is only visible for users with the `group_assis` permission or above._

### Groups
This page is where the user will mainly interact, being able to send and view messages, as well as the groups/channels that they have been assigned to in the admin menu. It can be accessed via the `/groups` route. There is a navigation bar up the top, which contains a list of all of the groups that a user can access. When selecting any of these groups, a list of the left side of the screen will update with all of the channels in this group that the user has been given permission to read/write in. In the bottom right of the screen - and taking up most of the screen real estate - is the chat window. This shows the chat history, as well as the authors of each chat message. At the bottom of this window is an input box with a button next to it that will allow a user to type and send a message in phase 2. In the top right is a logout button, and if the user has any kind of admin priviliges, a settings button will also be displayed where they can see their authenticated options.

# Node
As of phase 1 of the assignment, there is no interaction with the node js server and it has not yet been implemented. I had a look through all of the assignment specifications and this was not listed as a requirement, so I took priority in working on the UI and dynamic elements of the Angular site of it.

As per the dividing of responsibilities of each part, the UI will only act as a vehicle for the user, and all of the authentication and data handling will be done by the back end server. This will be accomplished through API routes using a REST interface, where the UI can make requests using an authenticated users information to ensure that the data being changed and requested is allowed. This will add a layer of security and simplicity when it comes to keeping the two seperate.

The UI will send requests to an `/auth` endpoint of the node server, with user login information inside of the body of that request. The server can then send a response back to the front end either allowing or denying the login request, and providing the UI with a token to use as proof of verification for other operations.

# Progress Tracking
### TODO (29/08/2022)
- ~~Add ability to delete channels/groups/users~~ (Done: 07/09/2022)
- ~~Add ability to make new channels~~ (Done: 07/09/2022)
- ~~Add navbar to all pages of application~~ (Done: 30/08/2022)
- Documentation
- Create node js server

### DONE (29/08/2022)
- Chat history
- Correct group/channel display for UI
- Log out button
- Complete log-in functionality
- Hidden settings button if insufficient perms
- Admin screen with permission checks.
    - Super Admin can:
        - Change roles of user (super_admin,group_admin)
        - && everything below
    - Group Admin can:
        - Assign any user to any group
        - Assign any user in a group to any channel 
        - Create new channel
        - Create new Group
        - Create new User
        - Create new Group
        - Add users to channel/group
        - Can make a user group assis
        - && everything below
    - Group Assis can:
        - Add/remove users from a channel

