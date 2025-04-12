import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swiper from 'swiper';

@Component({
  selector: 'app-sparepart',
  imports: [FormsModule,CommonModule],
  templateUrl: './sparepart.component.html',
  styleUrl: './sparepart.component.css'
})
export class SparepartComponent implements OnInit {
  @ViewChild('productSlider') productSlider!: ElementRef;
  
  currentSlideIndex = 0;
  products: any = [
    {
      id: 'img4',
      title: 'STORMTROPER<br>HELMET',
      price: '1.299,<sup>99</sup>',
      coverImage: '../../../assets/images/domino-studio-M_fDsj4lIpk-unsplash.jpg',
      productImage: 'https://res.cloudinary.com/muhammederdem/image/upload/q_60/v1536405215/starwars/item-4.webp',
      options: [
        {
          title: 'HELMET SIZE',
          type: 'type5',
          items: [
            { value: 'S', checked: false },
            { value: 'M', checked: true },
            { value: 'L', checked: false },
            { value: 'XL', checked: false }
          ]
        }
      ],
      durability: 80
    },
    {
      id: 'img1',
      title: 'IMPERIAL ARMY\'S<br>TIE FIGHTER',
      price: '9.999,<sup>99</sup>',
      coverImage: 'https://res.cloudinary.com/muhammederdem/image/upload/q_60/v1536405222/starwars/item-1-bg.webp',
      productImage: 'https://res.cloudinary.com/muhammederdem/image/upload/q_60/v1536405217/starwars/item-1.webp',
      options: [
        {
          title: 'ENGINE UNIT',
          type: 'type1',
          items: [
            { value: 'P-S4 TWIN', checked: true },
            { value: 'P-W401', checked: false }
          ]
        }
      ],
      durability: 75
    },
    {
      id: 'img2',
      title: 'KYLO REN\'S<br>LIGHTSABER',
      price: '1.699,<sup>99</sup>',
      coverImage: 'https://res.cloudinary.com/muhammederdem/image/upload/q_60/v1536405222/starwars/item-2-bg.webp',
      productImage: 'https://res.cloudinary.com/muhammederdem/image/upload/q_60/v1536405217/starwars/item-2.webp',
      options: [
        {
          title: 'VOLTAGE RANGE',
          type: 'type3',
          items: [
            { value: '2000 <sup>WATT</sup>', checked: true },
            { value: '2800 <sup>WATT</sup>', checked: false }
          ]
        },
        {
          title: 'LASER SIZE',
          type: 'type2',
          items: [
            { value: 'S', checked: false },
            { value: 'M', checked: true },
            { value: 'L', checked: false },
            { value: 'XL', checked: false }
          ]
        }
      ],
      durability: 80
    },
    {
      id: 'img3',
      title: 'IMPERIAL ARMY\'S<br>DEATH STAR',
      price: '9.999,<sup>99</sup>',
      coverImage: 'https://res.cloudinary.com/muhammederdem/image/upload/q_60/v1536405215/starwars/item-3-bg.webp',
      productImage: 'https://res.cloudinary.com/muhammederdem/image/upload/q_60/v1536405218/starwars/item-3.webp',
      options: [
        {
          title: 'HYPERDRIVE RATING',
          type: 'type6',
          items: [
            { value: 'CLASS 4', checked: true },
            { value: 'CLASS 20', checked: false }
          ]
        },
        {
          title: 'ARMANENT',
          type: 'type7',
          items: [
            { value: 'SUPERLASER', checked: true },
            { value: 'TURBOLASER', checked: false }
          ]
        }
      ],
      durability: 80
    }
  ];

  ngOnInit(): void {
    this.initSlider();
  }

  initSlider(): void {
    // يمكنك إضافة كود Swiper هنا إذا كنت تستخدمه
  }

  slidePrev(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.updateSlider();
    }
  }

  slideNext(): void {
    if (this.currentSlideIndex < this.products.length - 1) {
      this.currentSlideIndex++;
      this.updateSlider();
    }
  }

  updateSlider(): void {
    // تحديث العرض بناءً على الشريحة الحالية
    const activeProduct = this.products[this.currentSlideIndex];
    // يمكنك إضافة تأثيرات الانتقال هنا
  }

  toggleFavorite(event : Event): void {
    const heart = (event.currentTarget as HTMLElement).querySelector('.heart');
    heart?.classList.toggle('is-active');
  }

  addToCart(): void {
    // إضافة إلى سلة التسوق
  }
}