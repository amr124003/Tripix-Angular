import { Component, ElementRef, QueryList, ViewChild, ViewChildren , CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { time } from 'console';

@Component({
  selector: 'app-driver-profile',
  imports: [RouterLink],
  templateUrl: './driver-profile.component.html',
  styleUrl: './driver-profile.component.css',
  schemas : [CUSTOM_ELEMENTS_SCHEMA]
})
export class DriverProfileComponent implements AfterViewInit {
  @ViewChild('menuToggler') menuToggler!: ElementRef;
  @ViewChild('sideBar') sideBar!: ElementRef;
  @ViewChild('navLinks') navLinks!: ElementRef;
  @ViewChild('pages') pages!: ElementRef;
  @ViewChild('filterButtons') filterButtons!: ElementRef;
  @ViewChild('itemCategories') itemCategories!: ElementRef;
  Trips : number = 0;
  CS : number = 0;
  RV : number = 0;
  CR : number = 0;
  FAR : number = 0;
  CWT : number = 0 ;
  TVR : number = 0;
  ACR : number = 0;
  FER : number = 0;
  COR : number = 0;
  city : string = "UN KNOWN";
  Phone : string = "UN KNOWN";
  Email : string = "UN KNOWN";
  Facebook_Account : string = "UN KNOWN";
  instgram_Account : string = "UN KNOWN";
  Tiktok_Account : string = "UN KNOWN";
  Enrollyear = new Date();
  year = new Date().getFullYear();
  hour = new Date().getHours();
  AvilableNow : boolean = false;

  constructor()
  {
    if(this.hour >= 11 && this.hour <= 23)
    {
      this.AvilableNow = true;
    }
  }

  ngAfterViewInit() {
    // التحكم في القائمة الجانبية
    this.menuToggler.nativeElement.addEventListener('click', () => {
      this.sideBar.nativeElement.classList.toggle('active');
    });

    // التنقل بين الصفحات
    const navItems: HTMLElement[] = Array.from(this.navLinks.nativeElement.querySelectorAll('li a'));
    const pageSections: HTMLElement[] = Array.from(this.pages.nativeElement.children);

    navItems.forEach((link, index) => {
      link.addEventListener('click', (event: Event) => {
        event.preventDefault();

        // إزالة الـ active من الجميع
        navItems.forEach((el) => el.classList.remove('active'));
        pageSections.forEach((el) => el.classList.remove('active'));

        // تفعيل العنصر المطلوب
        link.classList.add('active');
        pageSections[index].classList.add('active');
      });
    });

    // التحكم في الفلاتر
    const filterBtns: HTMLElement[] = Array.from(this.filterButtons.nativeElement.querySelectorAll('.filter-item'));
    const itemCats: HTMLElement[] = Array.from(this.itemCategories.nativeElement.querySelectorAll('.item-category'));

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', (event: Event) => {
        // إزالة الـ active من كل الأزرار
        filterBtns.forEach((el) => el.classList.remove('active'));
        (event.currentTarget as HTMLElement).classList.add('active');

        // فلترة العناصر بناءً على الزر المضغوط
        itemCats.forEach((category) => {
          const categoryText = category.textContent?.trim();
          const filterText = (event.currentTarget as HTMLElement).textContent?.trim();

          if (filterText === categoryText || filterText === 'All') {
            category.parentElement?.classList.add('active');
          } else {
            category.parentElement?.classList.remove('active');
          }
        });
      });
    });
  }
}