import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupViewComponent } from './group-view/group-view.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {path: "login", component: LoginComponent},
  {path: "groups", component: GroupViewComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
