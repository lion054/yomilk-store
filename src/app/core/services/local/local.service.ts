import {AfterViewInit, Injectable, OnInit, signal} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {isExpired} from "../../functions/helpers";

@Injectable({
  providedIn: 'root'
})
export class LocalService implements AfterViewInit {

  constructor() {
    const activeResto = this.getObject('activeResto');
    console.log(activeResto);
    if(activeResto){
      this.setActiveResto(activeResto);
    }else {

    }
  }

  ngAfterViewInit(): void {
    // const activeResto = this.getObject('activeResto');
    // console.log(activeResto);
    // if(activeResto){
    //   this.setActiveResto(activeResto);
    // }else {
    //
    // }
  }

  private isLogged = new BehaviorSubject<boolean>(false);

  private activeResto = signal({});

  public setActiveResto(newResto: any){
    this.activeResto.set(newResto);
  }

  public getActiveResto(){
    return this.activeResto;
  }

  public saveData(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  /// Save Object to local storage
  public saveObject(key: string, object: any){
    const objectString = JSON.stringify(object)
    localStorage.setItem(key, objectString);
  }

  ///get Object from local storage
  public getObject(key:string){
   const retrievedObject:any = localStorage.getItem(key);

   if(retrievedObject != 'undefined'){
     // console.log("JSON OBJECT: ",retrievedObject)
     return JSON.parse(retrievedObject);
   }else {
     return null;
   }

  }


  public saveToken(token: string){
    localStorage.setItem('token',token);
    this.isLoggedIn();
  }

  public saveUser( value: string){
    localStorage.setItem('user',value);
  }

  public getData(key: string) {
    return localStorage.getItem(key)
  }

  public isLoggedIn(){
    let token = this.getToken()
    //Check if token is valid
    // if(!isExpired(token)){
    //   this.isLogged.next(true);
    // }else {
    //   this.isLogged.next(false);
    // }
    if(token && !isExpired(token)){
      this.isLogged.next(true);
    }else {
      this.isLogged.next(false);
    }
    return this.isLogged.asObservable();
  }

  public getToken(){
    return localStorage.getItem("token");
  }

  public getUser(){
    return localStorage.getItem('user');
  }

  public removeUser(key: string) {
    localStorage.removeItem('user');
  }

  public removeToken(key: string) {
    localStorage.removeItem('token');
  }


  public clearData() {
    localStorage.clear();
    this.isLoggedIn();
  }

}
