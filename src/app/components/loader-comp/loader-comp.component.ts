import { Component } from '@angular/core';
import {LoaderService} from "../../core/services/loader/loader.service";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf
  ],
  templateUrl: './loader-comp.component.html',
  styleUrl: './loader-comp.component.css'
})
export class LoaderComponent {
  constructor(public loadingService: LoaderService) {}
}
