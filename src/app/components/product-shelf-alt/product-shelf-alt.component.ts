import {AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {StoreService} from "../../core/services/store/store.service";
import {CurrencyService} from "../../core/services/currency/currency.service";

import {ProductCardComponent} from "../products/product-card/product-card.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-product-shelf-alt',
  standalone: true,
  imports: [
    ProductCardComponent,
    RouterLink
],
  templateUrl: './product-shelf-alt.component.html',
  styleUrl: './product-shelf-alt.component.css'
})
export class ProductShelfAltComponent implements OnInit , AfterViewInit{
  products:any[] = []

  @Input({required: true})
  title!:String

  @Input({required: true})
  itemCount!:number

  @Input({required: true})
  itemGroupCode!:any

  @ViewChild('productContainer') productContainer!: ElementRef;


  arr:any[] = []
  scrollPosition = 0;
  cardWidth = 220; // Default card width


  ngAfterViewInit(): void {
    // Determine card width based on screen size
    this.updateCardWidth();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateCardWidth();
  }

  updateCardWidth() {
    if (window.innerWidth < 640) {
      this.cardWidth = 160;
    } else if (window.innerWidth < 768) {
      this.cardWidth = 180;
    } else {
      this.cardWidth = 220;
    }
  }

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

  scrollLeft(): void {
    if (this.productContainer) {
      const container = this.productContainer.nativeElement;
      const scrollAmount = this.cardWidth + (window.innerWidth < 768 ? 16 : 24); // Card width + gap
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    if (this.productContainer) {
      const container = this.productContainer.nativeElement;
      const scrollAmount = this.cardWidth + (window.innerWidth < 768 ? 16 : 24); // Card width + gap
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}
