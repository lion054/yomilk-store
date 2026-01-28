import {Component, Input, OnInit} from '@angular/core';
import {StoreService} from "../../core/services/store/store.service";
import {CurrencyService} from "../../core/services/currency/currency.service";
import {ProductCardComponent} from "../products/product-card/product-card.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-product-shelf',
  standalone: true,
  imports: [
    ProductCardComponent,
    NgIf
  ],
  templateUrl: './product-shelf.component.html',
  styleUrl: './product-shelf.component.css'
})
export class ProductShelfComponent implements OnInit{

  products:any[] = []

  @Input({required: true})
  title!:String

  @Input({required: true})
  itemCount!:number

  @Input({required: true})
  itemGroupCode!:any


   arr:any[] = []



  constructor(private storeService:StoreService, private currencyService:CurrencyService) {

  }

  ngOnInit() {
    this.arr = Array(this.itemCount);
    this.currencyService.selectedCurrency$.subscribe(currency => {
      console.log("Item Group Number: ", this.itemGroupCode);

       let  searchString = `$filter = ItemsGroupCode eq ${this.itemGroupCode}`


      this.storeService.getStoreItems(currency.code, this.itemCount,1,'', searchString).subscribe(
        (response:any) => {
          this.products = response.values;
        }
      )
    })
  }


}
