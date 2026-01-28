import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Redirect to cart since checkout is handled there
    this.router.navigate(['/cart']);
  }
}
