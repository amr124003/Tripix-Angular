import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { VariabletransferService } from '../../Services/VariableTransfer/variabletransfer.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PrombetComponent } from '../Prombet/prombet.component';
import L from 'leaflet';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GetCarsService } from '../../Services/Cars/get-cars.service';




@Component({
    selector: 'app-home',
    imports: [CommonModule, RouterLink, PrombetComponent, FormsModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-10px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
            ])
        ])
    ]
})
export class HomeComponent implements AfterViewInit, OnInit, OnDestroy {
    nextElementSibling: any;
    classList: any;
    username: string = ''
    isMapOpen: boolean = false;
    destination: [number, number] = [30.128360, 31.135258]; // إحداثيات الوجهة (القاهرة كمثال)
    OurCars: any[] = [];
    map: any;
    routeLayer: any;
    ProductsLoading = true;
    showMessage = false;
    isLoggedIn = false;
    currentIndex = 0;
    totalSlides: number = 5; // عدّل حسب عدد الـ slides
    autoSlideInterval: any;
    isLiked: boolean = false;


    // دالة لتبديل حالة الإعجاب
    toggleLike() {
        this.isLiked = !this.isLiked;

        if (this.isLiked) {
            this.onLike();  // وظيفة لما يكون مفعل
        } else {
            this.onDislike();  // وظيفة لما يكون غير مفعل
        }
    }

    // دالة لما الزر مفعل (مثلًا إضافة الإعجاب)
    onLike() {
        console.log("Liked");
        // هنا ممكن تضيف أي وظائف إضافية مثل إرسال بيانات أو تحديث شيء في التطبيق
    }

    // دالة لما الزر غير مفعل (مثلًا إزالة الإعجاب)
    onDislike() {
        console.log("Disliked");
        // هنا ممكن تضيف وظائف إضافية أيضًا
    }





    showLogoutMessage() {
        this.showMessage = !this.showMessage; // عكس الحالة الحالية
    }

    confirmLogout() {
        this.showMessage = false;
        localStorage.removeItem('token');
        localStorage.removeItem('googletoken');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('googletoken');
        this.isLoggedIn = false;
    }

    cancelLogout() {
        this.showMessage = false;
    }


    CloseModal(modal: HTMLElement) {
        modal.classList.add('modal-hide');

        console.log(modal.classList);
    }


    openMapModal() {
        this.isMapOpen = true;
        this.initMap()
    }

    closeMapModal() {
        this.isMapOpen = false;
        if (this.map) {
            this.map.remove(); // إزالة الخريطة عند الإغلاق
        }
    }

    showAlert() {
        this.snackBar.open('تم الحفظ بنجاح ✅', 'إغلاق', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
        });
    }

    initMap() {
        if (!navigator.geolocation) {
            alert("الموقع غير مدعوم في المتصفح!");
            return;
        }

        navigator.geolocation.getCurrentPosition(position => {
            const userLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
            const destination: [number, number] = [30.045, 31.236]; // استبدلها بموقع الوجهة الفعلي

            // إنشاء الخريطة
            this.map = L.map('map').setView(userLocation as [number, number], 13);

            // إضافة طبقة OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.map);

            // تعريف أيقونة مخصصة للموقع الحالي
            const userIcon = L.icon({
                iconUrl: '../../../assets/images/marker.png', // ضع المسار الصحيح للصورة
                iconSize: [40, 40], // الحجم
                iconAnchor: [20, 40], // مركز الأيقونة
                popupAnchor: [0, -40] // الموقع الذي يظهر فيه البوب أب
            });

            // إضافة ماركر للموقع الحالي باستخدام الأيقونة المخصصة
            L.marker(userLocation as [number, number], { icon: userIcon }).addTo(this.map)
                .bindPopup("موقعك الحالي")
                .openPopup();

            // تعريف أيقونة مخصصة للوجهة
            const destinationIcon = L.icon({
                iconUrl: '../../../assets/images/mark.png', // ضع المسار الصحيح للصورة
                iconSize: [40, 40], // الحجم
                iconAnchor: [20, 40], // مركز الأيقونة
                popupAnchor: [0, -40] // الموقع الذي يظهر فيه البوب أب
            });

            // إضافة ماركر للوجهة باستخدام الأيقونة المخصصة
            L.marker(destination as [number, number], { icon: destinationIcon }).addTo(this.map)
                .bindPopup("الوجهة")
                .openPopup();

            // رسم الاتجاهات بين الموقع الحالي والوجهة
            this.getRoute(userLocation, destination);
        });
    }

    getRoute(start: [number, number], end: [number, number]) {
        const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (this.routeLayer) {
                    this.map.removeLayer(this.routeLayer);
                }

                const route = L.geoJSON(data.routes[0].geometry, {
                    style: { color: 'blue', weight: 4 }
                });

                this.routeLayer = route;
                route.addTo(this.map);
            })
            .catch(error => console.error('Error fetching route:', error));
    }

    constructor(private variabletransfer: VariabletransferService, private router: Router, private snackBar: MatSnackBar, private CarRepo: GetCarsService) { }
    ngOnDestroy(): void {
        this.stopAutoSlide();
    }

    ngOnInit(): void {
        this.startAutoSlide();
        if (localStorage.getItem('token') != null || localStorage.getItem('googletoken') != null) {
            this.isLoggedIn = true;
        }
        if (sessionStorage.getItem('token') != null || sessionStorage.getItem('googletoken') != null) {
            this.isLoggedIn = true;
        }
        this.initMap()
        this.variabletransfer.currentName.subscribe({
            next: (name) => {
                this.username = name;
            }
        })

    
       

        
        setTimeout(() => {
            this.ProductsLoading = false;
        }, 5000);

    }

    categories = [
        { key: 'all', label: 'Cars' },
        { key: 'electric', label: 'Electric Cars' },
        { key: 'motorbike', label: 'Motorbikes' },
        { key: 'used', label: 'Used Cars' },
        { key: 'spareparts', label: 'Spate Parts' }
    ];

    selectedCategory = 'all'; // default

    selectCategory(category: string) {
        this.selectedCategory = category;
    }

    startAutoSlide(): void {
        this.autoSlideInterval = setInterval(() => {
            this.moveSlide('right');
        }, 5000); // كل 5 ثواني
    }

    stopAutoSlide(): void {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
        }
    }
    onMouseEnter(): void {
        this.stopAutoSlide();
    }

    onMouseLeave(): void {
        this.startAutoSlide();
    }

    OnReadMore() {
        this.router.navigateByUrl('/Events');
    }

    moveSlide(direction: string): void {
        const slides = document.querySelectorAll('.slider .slide');
        const totalSlides = slides.length;

        if (direction === 'left') {
            this.currentIndex = (this.currentIndex === 0) ? totalSlides - 1 : this.currentIndex - 1;
            this.showAlert();

        } else if (direction === 'right') {
            this.currentIndex = (this.currentIndex === totalSlides - 1) ? 0 : this.currentIndex + 1;
            this.showAlert();
        }

        const newTransformValue = -100 * this.currentIndex + '%';
        const slider = document.querySelector('.slider') as HTMLElement;
        slider.style.transform = `translateX(${newTransformValue})`;
    }


    ngAfterViewInit(): void {

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

    SellCar() {
        this.router.navigateByUrl('/SellCar');
    }

}