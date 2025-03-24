import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('sidebar') sidebar!: ElementRef;
  @ViewChild('menuBar') menuBar!: ElementRef;
  @ViewChild('searchButton') searchButton!: ElementRef;
  @ViewChild('switchMode') switchMode!: ElementRef;
  @ViewChild('notificationIcon') notificationIcon!: ElementRef;
  @ViewChild('profileIcon') profileIcon!: ElementRef;
  @ViewChildren('sideMenuItems') sideMenuItems!: QueryList<ElementRef>;
  SelectedPage : string = 'Our Cars';

  CarsOrders : number = 0;
  CarsVisitors : number = 0;
  CarsTotal_Sales : number = 0;

  MotorbikesOrders : number = 0;
  MotorbikesVisitors : number = 0;
  MotorbikesTotal_Sales : number = 0;

  TrucksOrders : number = 0;
  TrucksVisitors : number = 0;
  TrucksTotal_Sales : number = 0;

  CarsOrdersData : any[] = [];
  MotorbikesOrdersData : any[] = [];
  TrucksOrdersData : any[] = []

  CarTypes : any[] = [];
  MotorbikesTypes : any[] = [];
  TrucksTypes : any[] = [];
  
  Applications : any[] = [
    {Drivername:'elsayed' , Enrolldate:'1/1/2003' , PhoneNumber:46457646,ApplicationStatus:'Accepted'}
  ];
  Applicationfiles : any[] = [
    {Drivername:'elsayed' , FaceID:'../../../assets/images/Avatar.jpg',DriverLicense:'../../../assets/images/Driver_License_Egypt_V1 (1).png',FrontCarLicense:'../../../assets/images/Driver_License_Egypt_V1 (1).png',BackCarLicense:'../../../assets/images/Driver_License_Egypt_V1 (1).png',Criminalrecord:'../../../assets/images/CRECO.png'}
  ]

  Complaints : any[] = [];
  ComplaintsSection = [] = [];

  Comments : any[] = [];

  Permissions : any[] = [
    {permission : 'Create' , section : 'Cars'} ,
    {permission : 'Update' , section : 'Cars'} ,
    {permission : 'Delete' , section : 'Cars'} ,
    {permission : 'Create' , section : 'Trucks' } ,
    {permission : 'Update' , section : 'Trucks'} ,
    {permission : 'Delete' , section : 'Trucks' } ,
    {permission : 'Create' , section : 'Motorbikes' } ,
    {permission : 'Update' , section : 'Motorbikes' } ,
    {permission : 'Delete' , section : 'Motorbikes' } ,
    {permission : 'Create' , section : 'Spare Parts' } ,
    {permission : 'Update' , section : 'Spare Parts'} ,
    {permission : 'Delete' , section : 'Spare Parts'} ,
  ];
  avilablepermissions : any[] = 
  [
    {type:'Create Product' , class : 'create'} ,
    {type:'Delete Product' , class : 'delete'} ,
    {type:'Update Product' , class : 'update'} ,
  ];

  AdminOperation : any[] = [];
  Users : any[] = [];

  Governorates : any[] = [];

  Drivers : any[] = [];
  
  NewDriversData : any[] = [];

  isCreateModalOpen = false;
  isUpdateModalOpen = false;
  isDeleteModalOpen = false;
  selectedProduct: any = null;
  isDragging = false;
  selectedsection : string = '';
  uploadedImage: any = null;
  products = [
    {ID : 1 , name: "Product 1", description: "Description 1", price: 100,section:'', image: "../../../assets/images/v1016-b-09.jpg" },
    {ID : 2 , name: "Product 2", description: "Description 2", price: 200, section:'', image: "../../../assets/images/v1016-b-09.jpg" }
  ];

  triggerFileInput()
  {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedImage = reader.result; // ✅ عرض الصورة
      };
      reader.readAsDataURL(file);
    }
  }

  openCreateModal(section : string) { 
    this.isCreateModalOpen = true; 
    this.selectedsection = section;
  }

  openUpdateModal(section : string) { 
    this.isUpdateModalOpen = true; 
    this.selectedsection = section;
  }

  openDeleteModal(section : string) { 
    this.selectedsection = section;
    this.isDeleteModalOpen = true; 
  }

  closeModal1() { 
    console.log('yes');
    this.isCreateModalOpen = false; 
    this.isUpdateModalOpen = false; 
    this.isDeleteModalOpen = false;
    this.selectedProduct = null; 
  }

  selectProduct(product: any) { 
    this.selectedProduct = { ...product }; 
  }

  deleteProduct(product : any)
  {

  }

  // *** Drag & Drop Functions ***
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.uploadedImage = e.target?.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }



  ngAfterViewInit(): void {
    this.setupSidebarToggle();
    this.adjustSidebar();
    this.setupSearchToggle();
    this.setupDarkModeToggle();
    this.setupMenuToggles();
    this.setupSideMenuActiveState();
  }

  // تفعيل وإلغاء تفعيل القائمة الجانبية
  private setupSidebarToggle(): void {
    this.menuBar.nativeElement.addEventListener('click', () => {
      this.sidebar.nativeElement.classList.toggle('hide');
    });
  }

  // ضبط القائمة الجانبية عند تغيير حجم الشاشة
  @HostListener('window:resize')
  adjustSidebar(): void {
    if (window.innerWidth <= 576) {
      this.sidebar.nativeElement.classList.add('hide');
    } else {
      this.sidebar.nativeElement.classList.remove('hide');
    }
  }

  private setupSideMenuActiveState(): void {
    if (!this.sideMenuItems || this.sideMenuItems.length === 0) return;

    this.sideMenuItems.forEach(item => {
      const li = item.nativeElement.parentElement;

      item.nativeElement.addEventListener('click', () => {
        // إزالة الـ "active" من جميع العناصر
        this.sideMenuItems.forEach(i => i.nativeElement.parentElement.classList.remove('active'));

        // إضافة "active" فقط للعنصر الحالي
        li.classList.add('active');
      });
    });
  }

  // تفعيل وإلغاء تفعيل البحث
  private setupSearchToggle(): void {
    const searchForm = document.querySelector('#content nav form') as HTMLElement;
    const searchButtonIcon = this.searchButton.nativeElement.querySelector('.bx') as HTMLElement;

    this.searchButton.nativeElement.addEventListener('click', (event: Event) => {
      if (window.innerWidth < 768) {
        event.preventDefault();
        searchForm.classList.toggle('show');
        searchButtonIcon.classList.toggle('bx-search');
        searchButtonIcon.classList.toggle('bx-x');
      }
    });
  }

  // تفعيل وإلغاء وضع الـ Dark Mode
  private setupDarkModeToggle(): void {
    this.switchMode.nativeElement.addEventListener('change', (event: Event) => {
      if ((event.target as HTMLInputElement).checked) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    });
  }

  // إعداد القوائم المنسدلة للإشعارات والبروفايل
  private setupMenuToggles(): void {
    const notificationMenu = document.getElementById('notificationMenu') as HTMLElement;
    const profileMenu = document.getElementById('profileMenu') as HTMLElement;

    this.notificationIcon.nativeElement.addEventListener('click', () => {
      notificationMenu.classList.toggle('show');
      profileMenu.classList.remove('show');
    });

    this.profileIcon.nativeElement.addEventListener('click', () => {
      profileMenu.classList.toggle('show');
      notificationMenu.classList.remove('show');
    });

    // إغلاق القوائم عند الضغط خارجها
    window.addEventListener('click', (event: Event) => {
      if (!(event.target as HTMLElement).closest('.notification') &&
          !(event.target as HTMLElement).closest('.profile')) {
        notificationMenu.classList.remove('show');
        profileMenu.classList.remove('show');
      }
    });
  }

  UpdateSelectedPage(page : string)
  {
    this.SelectedPage = page;
  }

  isModalOpen = false;
  imageSrc = ''; // صورة أكبر عند فتح المودال


  openModal(src:string) {
    this.imageSrc = src;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  searchQuery: string = '';
  suggestions: string[] = [];
  data: string[] = ['Apple', 'Banana', 'Cherry', 'Date', 'Grape', 'Mango', 'Orange', 'Peach', 'Pear', 'Pineapple'];

  onSearchChange() {
    if (this.searchQuery.length > 0) {
      this.suggestions = this.data.filter(item => item.toLowerCase().includes(this.searchQuery.toLowerCase()));
    } else {
      this.suggestions = [];
    }
  }

  selectSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.suggestions = [];
  }
}