import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import gsap from 'gsap';

@Component({
  selector: 'app-our-motorbikes',
  imports: [FormsModule,CommonModule],
  templateUrl: './our-motorbikes.component.html',
  styleUrl: './our-motorbikes.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OurMotorbikesComponent implements AfterViewInit, OnInit {
  @ViewChild('categoryContainer') categoryContainer!: ElementRef;

  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  scrollInterval: any;
  animationFrame: any;
  nextElementSibling: any;
  classList: any;
  toastpoen = true;
  

  constructor(private router: ActivatedRoute) { }

  //////////////////////////////////////////////////////////////////////////////
  filterType = 'all';
  minLimit: number = 50000; // الحد الأدنى للسعر
  maxLimit: number = 10000000; // الحد الأقصى للسعر
  minPrice: number = this.minLimit;
  maxPrice: number = 10000000;
  selectedBrand: any = null;
  animatedMinPrice: number = this.minLimit;
  animatedMaxPrice: number = 10000000;
  priceChanging = false;
  searchQuery: string = '';
  filteredBrands: any[] = [];
  step: number = 1000; // مقدار الزيادة عند الضغط على + و -
  ProductsLoading = true;
  currentPage: number = 1;
  totalPages: number = 5; // غير الرقم حسب عدد الصفحات الحقيقي
  fuelTypes: string[] = ['Benzine', 'Diesel', 'Electric', 'Hybrid'];  // Types of fuel
  bodyTypes: string[] = ['Sedan', 'Coupe', 'Hatchback', 'SUV'];  // Types of fuel
  selectedFuelTypes: { [key: string]: boolean } = {
    'Benzine': false,
    'Diesel': false,
    'Electric': false,
    'Hybrid': false
  };
  selectedBodyTypes: { [key: string]: boolean } = {
    'Sedan': false,
    'Coupe': false,
    'Hatchback': false,
    'SUV': false
  };
  
  

  brands = [
    { name: 'كل الماركات', logo: '', options: [], expanded: false },
    { name: 'آفاتر', logo: 'assets/avatar.png', options: ['موديل 1', 'موديل 2'], expanded: false },
    { name: 'ألبينا', logo: 'assets/alpina.png', options: ['موديل 1', 'موديل 2'], expanded: false },
    { name: 'ألفاروميو', logo: 'assets/alfa.png', options: ['موديل 1', 'موديل 2'], expanded: false },
    { name: 'أودي', logo: 'assets/audi.png', options: ['موديل 1', 'موديل 2'], expanded: false },
    { name: 'إكس بينج', logo: 'assets/xpeng.png', options: ['موديل 1', 'موديل 2'], expanded: false }
  ];

  ngOnInit(): void {
    this.filteredBrands = [...this.brands]; // تخزين كل البيانات الأصلية

    setTimeout(() => {
      this.ProductsLoading = false;
    }, 5000);

    this.router.queryParams.subscribe((params) => {
      console.log(params['type']);
    });

  }

  get totalPagesArray(): number[] {
    return Array(this.totalPages).fill(0);
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
    // نادِ دالة تجيب الداتا على حسب الصفحة المختارة
  }

  filterCarsByFuel() {
    // هنا يمكن إضافة الكود اللازم لتصفية السيارات حسب الوقود
    console.log('Selected Fuel Types:', this.selectedFuelTypes);
  }

  filterCarsByBodyType() {
    // هنا يمكن إضافة الكود اللازم لتصفية السيارات حسب الوقود
    console.log('Selected Fuel Types:', this.selectedBodyTypes);
  }

  toggleFuelSelection(fuel: string): void {
    this.selectedFuelTypes[fuel] = !this.selectedFuelTypes[fuel];
    this.filterCarsByFuel(); // لو عندك فلترة بناء على نوع الوقود
  }

  toggleBodytypeSelection(type: string): void {
    this.selectedBodyTypes[type] = !this.selectedBodyTypes[type];
    this.filterCarsByBodyType(); // لو عندك فلترة بناء على نوع الوقود
  }

  getSelectedBodyTypes(): string[] {
    return Object.entries(this.selectedBodyTypes)
      .filter(([key, value]) => value)
      .map(([key]) => key);
  }

  filterBrands() {
    const query = this.searchQuery.toLowerCase();

    const newFilteredBrands = this.brands
      .map(brand => {
        const matchingOptions = brand.options.filter(option => option.toLowerCase().includes(query));
        const matchesBrandName = brand.name.toLowerCase().includes(query);

        if (matchesBrandName) {
          return { ...brand, expanded: false, options: brand.options }; // عرض الماركة بدون تغيير
        } else if (matchingOptions.length > 0) {
          return { ...brand, expanded: true, options: matchingOptions }; // فتح الماركة وعرض الخيارات المطابقة فقط
        }
        return null; // إخفاء الماركات غير المطابقة
      })
      .filter(brand => brand !== null);

    // إضافة كلاس الاختفاء قبل التحديث
    this.filteredBrands.forEach(brand => {
      if (!newFilteredBrands.some(b => b.name === brand.name)) {
        brand.animationClass = 'disappear';
      }
    });

    // تطبيق التأخير قبل التحديث النهائي
    setTimeout(() => {
      this.filteredBrands = newFilteredBrands.map(brand => ({
        ...brand,
        animationClass: 'appear'
      }));
    }, 200);
  }

  resetFilters() {
    this.filterType = 'all';
    this.minPrice = this.minLimit;
    this.maxPrice = 100000;
    this.selectedBrand = null;
    this.searchQuery = '';
    this.filteredBrands = [...this.brands];
  }

  toggleBrandOptions(selectedBrand: any) {
    this.brands.forEach(brand => {
      if (brand !== selectedBrand && brand.expanded) {
        brand.expanded = false;
      }
    });

    selectedBrand.expanded = !selectedBrand.expanded;
  }

  updateTrack() {
    this.updatePrice('min', this.minPrice);
    this.updatePrice('max', this.maxPrice);

    const minVal = this.minPrice;
    const maxVal = this.maxPrice;
    const range = this.maxLimit;
    const track = document.querySelector('.slider-track') as HTMLElement;

    const minPercent = (minVal / range) * 100;
    const maxPercent = (maxVal / range) * 100;

    if (track) {
      track.style.left = minPercent + "%";
      track.style.width = (maxPercent - minPercent) + "%";
    }
  }

  closetoast() {
    this.toastpoen = false;
  }

  updatePrice(target: 'min' | 'max', value: number) {
    this.priceChanging = true;
    const startValue = target === 'min' ? this.animatedMinPrice : this.animatedMaxPrice;
    const endValue = value;
    const duration = 500; // مدة الأنيميشن
    const steps = 20; // عدد الخطوات لجعل الأنيميشن سلسة
    let stepTime = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const newValue = Math.round(startValue + (endValue - startValue) * (currentStep / steps));

      if (target === 'min') {
        this.animatedMinPrice = newValue;
      } else {
        this.animatedMaxPrice = newValue;
      }

      if (currentStep >= steps) {
        clearInterval(interval);
        this.priceChanging = false;
      }
    }, stepTime);
  }

  increasePrice(type: 'min' | 'max') {
    if (type === 'min' && this.minPrice + this.step <= this.maxPrice) {
      this.minPrice += this.step;
    }
    if (type === 'max' && this.maxPrice + this.step <= this.maxLimit) {
      this.maxPrice += this.step;
    }
    this.updateTrack();
  }

  decreasePrice(type: 'min' | 'max') {
    if (type === 'min' && this.minPrice - this.step >= this.minLimit) {
      this.minPrice -= this.step;
    }
    if (type === 'max' && this.maxPrice - this.step >= this.minPrice) {
      this.maxPrice -= this.step;
    }
    this.updateTrack();
  }

  selectBrand(brand: any) {
    this.selectedBrand = brand;
  }
  ///////////////////////////////////////////////////////////////////////////////


  ngAfterViewInit(): void {
    const container = this.categoryContainer.nativeElement;
    const itemWidth = container.children[0].offsetWidth + 10; // عرض العنصر + المسافة بينهما

    // ✅ تشغيل التمرير التلقائي
    this.startAutoScroll(itemWidth);

    // ✅ عند الضغط، ابدأ السحب فورًا
    container.addEventListener('mousedown', (e: MouseEvent) => this.startDragging(e, container));
    container.addEventListener('mousemove', (e: MouseEvent) => this.dragging(e, container));
    container.addEventListener('mouseup', () => this.stopDragging(container, itemWidth));
    container.addEventListener('mouseleave', () => this.stopDragging(container, itemWidth));

    //////////////////////////////////////////////////////////////////////

    const modal = document.querySelector('[data-modal');
    const modalCloseBtn = document.querySelector('[data-modal-close');
    const modalCloseOverlay = document.querySelector('[data-modal-overlay');

    const modalCloseFunc = function () { modal?.classList.add('closed') }

    modalCloseOverlay?.addEventListener('click', modalCloseFunc);
    modalCloseBtn?.addEventListener('click', modalCloseFunc);

    //Close Notification 

    const notificationToast = document.querySelector('[data-toast]');
    const toastCloseBtn = document.querySelector('[data-toast-close]');

    toastCloseBtn?.addEventListener('click', function () {
      notificationToast?.classList.add('closed');
    })

    //Closing or Opening Mobile Menu 
    const mobileMenuOpenBtn = document.querySelectorAll('[data-mobile-menu-open-btn]');
    const mobileMenu = document.querySelectorAll('[data-mobile-menu]');
    const mobileMenuCloseBtn = document.querySelectorAll('[data-mobile-menu-close-btn]');
    const overlay = document.querySelector('[data-overlay]');

    for (let i = 0; i < mobileMenuOpenBtn.length; i++) {

      const mobileMenuCloseFunc = function () {
        mobileMenu[i].classList.remove('active');
        overlay?.classList.remove('active');
      }

      mobileMenuOpenBtn[i].addEventListener('click', function () {
        mobileMenu[i].classList.add('active');
        overlay?.classList.add('active');
      })

      mobileMenuCloseBtn[i].addEventListener('click', mobileMenuCloseFunc);
      overlay?.addEventListener('click', mobileMenuCloseFunc);
    }

    //Accordion Options
    const accordionBtn = document.querySelectorAll('[data-accordion-btn]');
    const accordion = document.querySelectorAll('[data-accordion]');

    for (let i = 0; i < accordion.length; i++) {
      accordionBtn[i].addEventListener('click', () => {
        const clickedBtn = this.nextElementSibling.classList.contains('active');

        for (let i = 0; i < accordion.length; i++) {
          if (clickedBtn) break;
          if (accordion[i].classList.contains('active')) {
            accordion[i].classList.remove('active');
            accordionBtn[i].classList.remove('active');
          }
        }

        this.nextElementSibling.classList.toggle('active');
        this.classList.toggle('active');
      })
    }

  }

  startDragging(event: MouseEvent, container: HTMLElement) {
    this.isDragging = true;
    this.startX = event.pageX - container.offsetLeft;
    this.scrollLeft = container.scrollLeft;
    clearInterval(this.scrollInterval); // ⛔ إيقاف التمرير التلقائي عند السحب
    cancelAnimationFrame(this.animationFrame); // ⛔ إيقاف أي أنيميشن جارية
  }

  dragging(event: MouseEvent, container: HTMLElement) {
    if (!this.isDragging) return;
    event.preventDefault();

    const x = event.pageX - container.offsetLeft;
    const walk = (x - this.startX) * 2; // التحكم في سرعة السحب
    container.scrollLeft = this.scrollLeft - walk;
  }

  stopDragging(container: HTMLElement, itemWidth: number) {
    this.isDragging = false;
    this.startAutoScroll(itemWidth); // 🔄 استئناف التمرير التلقائي بعد السحب
  }

  startAutoScroll(itemWidth: number) {
    this.scrollInterval = setInterval(() => {
      const container = this.categoryContainer.nativeElement;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScrollLeft) {
        // العودة بسلاسة إلى البداية
        gsap.to(container, { scrollLeft: 0, duration: 1, ease: 'power2.inOut' });
      } else {
        // تمرير سلس إلى العنصر التالي
        gsap.to(container, { scrollLeft: container.scrollLeft + itemWidth, duration: 1, ease: 'power2.inOut' });
      }
    }, 3000); // تغيير العنصر كل 3 ثوانٍ
  }
}
