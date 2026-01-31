import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {StoreService} from "../../core/services/store/store.service";

import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    RouterLink
],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent implements OnInit{

  categories: any[] = [];

  // Category icon and color mapping
  categoryIcons: { [key: string]: { icon: string; bgColor: string } } = {
    'DAIRY': { icon: '🥛', bgColor: '#e0f2fe' },
    'BREAD': { icon: '🍞', bgColor: '#fef3c7' },
    'MEAT': { icon: '🥩', bgColor: '#fee2e2' },
    'GROCERIES': { icon: '🛒', bgColor: '#d1fae5' },
    'CHEMICALS': { icon: '🏠', bgColor: '#ede9fe' },
    'BEVERAGES': { icon: '🥤', bgColor: '#ffedd5' },
    'FROZEN': { icon: '🧊', bgColor: '#cffafe' },
    'BEAUTY': { icon: '💄', bgColor: '#fce7f3' },
    'DEFAULT': { icon: '📦', bgColor: '#f3f4f6' }
  };

  constructor(private storeService:StoreService) {

  }

  ngOnInit() {
    this.storeService.getItemGroups().subscribe((response:any)=>{
      console.log("STORE ITEM GROUPS",response);
      // Enhance categories with icons and colors
      this.categories = response.map((cat: any) => {
        const key = cat.groupName?.toUpperCase() || 'DEFAULT';
        const iconData = this.categoryIcons[key] || this.categoryIcons['DEFAULT'];
        return {
          ...cat,
          icon: iconData.icon,
          bgColor: iconData.bgColor
        };
      });
    })
  }

  getCategoryIcon(groupName: string): string {
    const key = groupName?.toUpperCase() || 'DEFAULT';
    return this.categoryIcons[key]?.icon || this.categoryIcons['DEFAULT'].icon;
  }

  getCategoryBgColor(groupName: string): string {
    const key = groupName?.toUpperCase() || 'DEFAULT';
    return this.categoryIcons[key]?.bgColor || this.categoryIcons['DEFAULT'].bgColor;
  }
}
