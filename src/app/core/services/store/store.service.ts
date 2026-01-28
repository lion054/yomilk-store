import { Injectable } from '@angular/core';
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, catchError, Observable, of, tap, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  apiUrl = environment.apiURL;
  constructor(private http: HttpClient) { }


  private storeCategories = new BehaviorSubject<any[]>([]);
  storeCategories$:any = this.storeCategories.asObservable();

  private productCache:any = {
    params: {
      currency: null,
      pageSize: null,
      pageNumber: null,
      filterExtension: null
    },
    expireDateTime: null,
    products: null
  }


  ///Gets Store items with params
  // getStoreItems(currency:any = 'BWP', pageSize:any = 20, pageNumber:any=1, filterExtension:any =''){
  //
  //   const currentDate = new Date();
  //
  //   if( currentDate.getTime() > this.productCache.expireDateTime){
  //     let params = {
  //       currency: currency,
  //       pageSize: pageSize,
  //       pageNumber: pageNumber,
  //       filterExtension: filterExtension
  //     }
  //      this.http.get(`${this.apiUrl}StoreItems`,{params:params}).subscribe((response:any) => {
  //
  //         this.productCache.expireDateTime = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);
  //         this.productCache.params = params;
  //         this.productCache.products = response;
  //      },
  //        (error:any)=>{
  //
  //        },
  //        ()=>{
  //          return of(this.productCache.products)
  //        }
  //        )
  //   } else {
  //     return of(this.productCache.products)
  //   }
  //
  //
  //
  //
  //
  // }

  //Get store items with Cache
  getStoreItems(currency: any = environment.currency, pageSize:any, pageNumber: any = 1, queryExtension:any = '', filterExtension: String = "" ): Observable<any> {
    const currentDate = new Date();
    let  itemGroupFilter:any = filterExtension
    // if(filterExtension != '') {
    //    itemGroupFilter = `$filter = ItemsGroupCode eq ${filterExtension}`
    // }else {
    //     console.log("FILTER EXTENSION: ", filterExtension)
    // }

    const params = {
      currency: currency,
      pageSize: pageSize,
      pageNumber: pageNumber,
      filterExtension: itemGroupFilter,
      queryExtension: queryExtension.toString()
    };

    // Check if cache is still valid and if parameters align for reuse
    const isCacheValid = currentDate.getTime() < this.productCache.expireDateTime;
    const isSameParams =
      this.productCache.params?.currency === currency &&
      this.productCache.params?.pageNumber === pageNumber &&
      this.productCache.params?.filterExtension === filterExtension;

    // If cache is valid, parameters align, and cached pageSize is sufficient, return cached data
    // let cacheCondition = isCacheValid && isSameParams && this.productCache.params.pageSize >= pageSize
    let cacheCondition = false;

    if (cacheCondition) {
      return of(this.productCache.products);
    } else {
      // Cache expired or parameters don't align; make new API request
      return this.http.get(`${this.apiUrl}StoreItems`, { params: params }).pipe(
        tap((response: any) => {
          // Update cache values
          this.productCache.expireDateTime = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);
          this.productCache.params = params;
          this.productCache.products = response;
        }),
        catchError((error: any) => {
          console.error("Error fetching store items:", error);
          return throwError(error);
        })
      );
    }
  }

  getUpSells(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}StoreItems/Upsells`, payload);
  }

  getCrossSells(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}StoreItems/CrossSells`, payload);
  }


  // Get Item Groups (Categories)
  getItemGroups(pageSize:any = 20, pageNumber:any=1, filterExtension:any ='', queryExtension:any=''){

    let params = {
      queryExtension: queryExtension,
      pageSize: pageSize,
      pageNumber: pageNumber,
      filterExtension: filterExtension
    }
    return   this.http.get(`${this.apiUrl}StoreItemGroups`,{params:params}).pipe(
      tap((response: any) => {
        this.storeCategories.next(response);
      })
    )
    //   .subscribe((response:any)=>{
    //
    // });

  }

  ///Gets Store items with params
  getStoreInvoices(pageSize:any = 20, pageNumber:any=1, filterExtension:any ='', queryExtension:any=''){
    let params = {
      queryExtension: queryExtension,
      pageSize: pageSize,
      pageNumber: pageNumber,
      filterExtension: filterExtension
    }
    return this.http.get(`${this.apiUrl}StoreInvoices`,{params:params});
  }


  //Get Store Statements
  getStoreStatements(currency:any = "Account", endDate:any="2024-10-25T03:10:52.946Z", startDate:any ='2000-10-25T03:10:52.946Z', cardCode:any){
    let body = {
      startDate: startDate,
      endDate: endDate,
      currency: currency
    }

    return this.http.post(`${this.apiUrl}StoreJournalEntries/BusinessPartners/${cardCode}/GetStatements`,body);
  }

  //Get Incoming Payments
  getStoreIncomingPayments(pageSize:any = 20, pageNumber:any=1, filterExtension:any ='', queryExtension:any=''){
    let params = {
      queryExtension: queryExtension,
      pageSize: pageSize,
      pageNumber: pageNumber,
      filterExtension: filterExtension
    }
    return this.http.get(`${this.apiUrl}StoreIncomingPayments`,{params:params});
  }

  //Get Single Incoming payment
  getSingleIncomingPayment(docEntry:any = 20, selectExtension:any=''){
    let params = {
      selectExtension: selectExtension
    }
    return this.http.get(`${this.apiUrl}StoreIncomingPayments/${docEntry}`,{params:params});
  }

  //Create store incoming payments
  createIncomingPayment(payload:any){
    return this.http.post(`${this.apiUrl}StoreIncomingPayments`,payload);
  }

  //Get Single Invoice Details
  getSingleInvoiceByDocEntry(docEntry:any ='', selectExtension:any=''){
    let params = {
      selectExtension: selectExtension,
    }
    return this.http.get(`${this.apiUrl}StoreInvoices/${docEntry}`,{params:params});
  }


  //Get Business Partner Details
  getBusinessPartnerDetails(cardCode:any ='', selectExtension:any=''){
    let params = {
      selectExtension: selectExtension,
    }
    return this.http.get(`${this.apiUrl}StoreBusinessPartners/${cardCode}`,{params:params});
  }

//Get Innbucks payment code for incoming payments
  createOrderApiInnBucks(payload: any) {
    return this.http.post(`${this.apiUrl}StoreIncomingPayments/InnBucks/GetPaymentCode`,payload);
  }



  tempProducts:any = {
    "recordCount": 5,
    "pageCount": 1,
    "pageNumber": 1,
    "values": [
      {
        "itemCode": "TOM000",
        "itemName": "Tomato UNG",
        "image": "",
        "pictures": [],
        "defaultSalesUoMEntry": 4,
        "defaultSalesUoMName": "KG",
        "price": 1,
        "currency": "BWP",
        "salesVATGroup": "O3",
        "salesVATRate": 0,
        "warehouseCode": "01",
        "unitsOnStock": 98578,
        "storeUnitPrice": 0,
        "itemsGroupCode": 119,
        "uoMs": [
          {
            "uomEntry": 2,
            "uomName": "Crate",
            "price": 15,
            "inStock": 1478670,
            "inventoryQuantityFactor": 15,
            "currency": "BWP",
            "isPricingUOM": false,
            "isInventoryOM": false,
            "uomQuantity": 15
          },
          {
            "uomEntry": 3,
            "uomName": "Pallet",
            "price": 150,
            "inStock": 14786700,
            "inventoryQuantityFactor": 150,
            "currency": "BWP",
            "isPricingUOM": false,
            "isInventoryOM": false,
            "uomQuantity": 150
          },
          {
            "uomEntry": 4,
            "uomName": "KG",
            "price": 1,
            "inStock": 98578,
            "inventoryQuantityFactor": 1,
            "currency": "BWP",
            "isPricingUOM": true,
            "isInventoryOM": false,
            "uomQuantity": 1
          }
        ]
      },
      {
        "itemCode": "TOM001",
        "itemName": "Tomato Gr A+",
        "image": "",
        "pictures": [],
        "defaultSalesUoMEntry": 4,
        "defaultSalesUoMName": "KG",
        "price": 20,
        "currency": "BWP",
        "salesVATGroup": "O3",
        "salesVATRate": 0,
        "warehouseCode": "01",
        "unitsOnStock": 22924,
        "storeUnitPrice": 0,
        "itemsGroupCode": 119,
        "uoMs": [
          {
            "uomEntry": 2,
            "uomName": "Crate",
            "price": 300,
            "inStock": 343860,
            "inventoryQuantityFactor": 15,
            "currency": "BWP",
            "isPricingUOM": false,
            "isInventoryOM": false,
            "uomQuantity": 15
          },
          {
            "uomEntry": 3,
            "uomName": "Pallet",
            "price": 3000,
            "inStock": 3438600,
            "inventoryQuantityFactor": 150,
            "currency": "BWP",
            "isPricingUOM": false,
            "isInventoryOM": false,
            "uomQuantity": 150
          },
          {
            "uomEntry": 4,
            "uomName": "KG",
            "price": 20,
            "inStock": 22924,
            "inventoryQuantityFactor": 1,
            "currency": "BWP",
            "isPricingUOM": true,
            "isInventoryOM": false,
            "uomQuantity": 1
          }
        ]
      },
      {
        "itemCode": "TOM002",
        "itemName": "Tomato Gr A",
        "image": "",
        "pictures": [],
        "defaultSalesUoMEntry": 4,
        "defaultSalesUoMName": "KG",
        "price": 18,
        "currency": "BWP",
        "salesVATGroup": "O3",
        "salesVATRate": 0,
        "warehouseCode": "01",
        "unitsOnStock": 450,
        "storeUnitPrice": 0,
        "itemsGroupCode": 119,
        "uoMs": [
          {
            "uomEntry": 2,
            "uomName": "Crate",
            "price": 270,
            "inStock": 6750,
            "inventoryQuantityFactor": 15,
            "currency": "BWP",
            "isPricingUOM": false,
            "isInventoryOM": false,
            "uomQuantity": 15
          },
          {
            "uomEntry": 3,
            "uomName": "Pallet",
            "price": 2700,
            "inStock": 67500,
            "inventoryQuantityFactor": 150,
            "currency": "BWP",
            "isPricingUOM": false,
            "isInventoryOM": false,
            "uomQuantity": 150
          },
          {
            "uomEntry": 4,
            "uomName": "KG",
            "price": 18,
            "inStock": 450,
            "inventoryQuantityFactor": 1,
            "currency": "BWP",
            "isPricingUOM": true,
            "isInventoryOM": false,
            "uomQuantity": 1
          }
        ]
      },
      {
        "itemCode": "TOM003",
        "itemName": "Tomato Gr B",
        "image": "",
        "pictures": [],
        "defaultSalesUoMEntry": 4,
        "defaultSalesUoMName": "KG",
        "price": 15,
        "currency": "BWP",
        "salesVATGroup": "O3",
        "salesVATRate": 0,
        "warehouseCode": "01",
        "unitsOnStock": 6,
        "storeUnitPrice": 0,
        "itemsGroupCode": 119,
        "uoMs": [
          {
            "uomEntry": 2,
            "uomName": "Crate",
            "price": 225,
            "inStock": 90,
            "inventoryQuantityFactor": 15,
            "currency": "BWP",
            "isPricingUOM": false,
            "isInventoryOM": false,
            "uomQuantity": 15
          },
          {
            "uomEntry": 3,
            "uomName": "Pallet",
            "price": 2250,
            "inStock": 900,
            "inventoryQuantityFactor": 150,
            "currency": "BWP",
            "isPricingUOM": false,
            "isInventoryOM": false,
            "uomQuantity": 150
          },
          {
            "uomEntry": 4,
            "uomName": "KG",
            "price": 15,
            "inStock": 6,
            "inventoryQuantityFactor": 1,
            "currency": "BWP",
            "isPricingUOM": true,
            "isInventoryOM": false,
            "uomQuantity": 1
          }
        ]
      },
      {
        "itemCode": "TOM004",
        "itemName": "Tomato Gr C",
        "image": "",
        "pictures": [],
        "defaultSalesUoMEntry": 4,
        "defaultSalesUoMName": "KG",
        "price": 12,
        "currency": "BWP",
        "salesVATGroup": "O3",
        "salesVATRate": 0,
        "warehouseCode": "01",
        "unitsOnStock": 200000,
        "storeUnitPrice": 0,
        "itemsGroupCode": 119,
        "uoMs": [
          {
            "uomEntry": 2,
            "uomName": "Crate",
            "price": 180,
            "inStock": 3000000,
            "inventoryQuantityFactor": 15,
            "currency": "BWP",
            "isPricingUOM": false,
            "isInventoryOM": false,
            "uomQuantity": 15
          },
          {
            "uomEntry": 3,
            "uomName": "Pallet",
            "price": 1800,
            "inStock": 30000000,
            "inventoryQuantityFactor": 150,
            "currency": "BWP",
            "isPricingUOM": false,
            "isInventoryOM": false,
            "uomQuantity": 150
          },
          {
            "uomEntry": 4,
            "uomName": "KG",
            "price": 12,
            "inStock": 200000,
            "inventoryQuantityFactor": 1,
            "currency": "BWP",
            "isPricingUOM": true,
            "isInventoryOM": false,
            "uomQuantity": 1
          }
        ]
      }
    ]
  }

  createOrderPayNow(payload:any ) {
    return this.http.post(`${this.apiUrl}StoreIncomingPayments/PayNow/InitiatePayment`,payload);
  }

  // // Get Single Product Item
  // getSingleProduct(itemCode: any) {
  //   // let params: any = {};
  //   // if (itemCodeArray) {
  //   //   params.itemCodes = itemCodeArray;
  //   // }
  //   return this.http.get(`${this.apiUrl}Items/${itemCode}`);
  // }

  //Get store items with Cache
  getSingleProduct(itemCode:any): Observable<any> {
    const currentDate = new Date();
    const queryExtension =  `$filter = ItemCode eq '${itemCode}'`
    const params = {
      filterExtension: queryExtension.toString()
    };

      // Cache expired or parameters don't align; make new API request
      return this.http.get(`${this.apiUrl}StoreItems`, { params: params }).pipe(
        tap((response: any) => {
          // Update cache values
          this.productCache.expireDateTime = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);
          this.productCache.params = params;
          this.productCache.products = response;
        }),
        catchError((error: any) => {
          console.error("Error fetching store items:", error);
          return throwError(error);
        })
      );

  }
}
