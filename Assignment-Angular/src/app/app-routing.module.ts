import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupViewComponent } from './group-view/group-view.component';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {path: "login", component: LoginComponent},
  {path: "groups", component: GroupViewComponent},
  {path: "settings", component: SettingsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
