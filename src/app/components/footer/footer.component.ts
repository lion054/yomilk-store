import { Component } from '@angular/core';
import {environment} from "../../../environments/environment";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  CompanyName: any = environment.companyName;

}
