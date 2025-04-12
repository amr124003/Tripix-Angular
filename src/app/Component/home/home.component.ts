import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { VariabletransferService } from '../../Services/VariableTransfer/variabletransfer.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PrombetComponent } from '../Prombet/prombet.component';
import L from 'leaflet';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-home',
    imports: [CommonModule, RouterLink, PrombetComponent, FormsModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements AfterViewInit, OnInit {
    nextElementSibling: any;
    classList: any;
    username: string = ''
    isMapOpen: boolean = false;
    destination: [number, number] = [30.128360, 31.135258]; // إحداثيات الوجهة (القاهرة كمثال)
    map: any;
    routeLayer: any;
    ProductsLoading = true;
    

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

    constructor(private variabletransfer: VariabletransferService, private router: Router) { }

    ngOnInit(): void {
        console.log('hi');
        this.initMap();
        this.variabletransfer.currentName.subscribe({
            next: (name) => {
                this.username = name;
            }
        })

        setTimeout(() => {
            this.ProductsLoading = false;
        }, 5000);

    }

    OnReadMore() {
        this.router.navigateByUrl('/Events');
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

    SellCar()
    {
        this.router.navigateByUrl('/SellCar');
    }

}