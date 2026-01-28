import {Component, Input} from '@angular/core';
import {CartService} from "../../../core/services/cart/cart.service";
import {DecimalPipe} from "@angular/common";

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [
    DecimalPipe
  ],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss'
})
export class CartItemComponent {

  @Input()
  cartItem:any;

  @Input()
  index:any

  constructor(private cartService: CartService) {}

  removeItem(index: number) {
    this.cartService.removeFromCart(index);

  }

  incrementQuantity() {
    // // Create a shallow copy of `this.cartItem`
    // const sendItem = { ...this.cartItem };
    // // Set the quantity in the copy to 1
    // sendItem.quantity = 1;
    // // Send the modified copy to `addToCart`
    // this.cartService.addToCart(sendItem, sendItem.uom);

    this.cartService.incrementItem(this.cartItem, this.cartItem.uom)
  }

  decrementQuantity() {
    this.removeItem(this.index);
  }

}
