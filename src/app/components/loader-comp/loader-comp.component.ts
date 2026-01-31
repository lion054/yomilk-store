import { Component } from '@angular/core';
import {LoaderService} from "../../core/services/loader/loader.service";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    AsyncPipe
],
  templateUrl: './loader-comp.component.html',
  styleUrl: './loader-comp.component.css'
})
export class LoaderComponent {
  constructor(public loadingService: LoaderService) {}
}
