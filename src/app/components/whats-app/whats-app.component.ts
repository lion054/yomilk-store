import { Component } from '@angular/core';

@Component({
  selector: 'app-whats-app',
  standalone: true,
  imports: [],
  templateUrl: './whats-app.component.html',
  styleUrl: './whats-app.component.css'
})
export class WhatsAppComponent {

  phoneNumber = '263782978460'; // Replace with your number
  defaultMessage = "Hello, I'm interested in your products"; // Custom message


  protected readonly encodeURIComponent = encodeURIComponent;
}
