import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { QuestionComponent } from '../question/question.component';

interface ScrollRange {
  element: ElementRef<HTMLElement>;
  start: number;
  end: number;
}

@Component({
  selector: 'app-intro',
  imports: [QuestionComponent],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.css'
})
export class IntroComponent implements OnInit, OnDestroy, AfterViewInit {
  
  @ViewChildren('zoomElement') zoomElements!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('stuckGrid') stuckGrid!: ElementRef<HTMLElement>;
  @ViewChild('specialElement') specialElement!: ElementRef<HTMLElement>;

  private scrollRanges: Array<{
    element: ElementRef<HTMLElement>;
    start: number;
    end: number;
  }> = [];
  
  private specialScrollRange = {
    start: 0,   // يبدأ من البداية (0%)
    end: 10     // ينتهي عند 10% من الـ scroll (نطاق قصير مثل العناصر العادية)
  };
  private animationFrameId: number = 0;
  private isAnimating: boolean = false;

  // نطاقات الـ scroll لكل عنصر (محولة من الـ CSS)
  private readonly animationRanges: number[] = [
    40, 20, 52, 50, 45, 10, 90, 30, 80, 70, -10, 52, 15, 7, 75, 3, 87, 42, 57, 37,
    12, 8, 84, 33, 48, 13, 78, 62, 31, 8, 4, 74, 61, 26, 63, 11, 89, 33, 88, 22,
    16, 26, 66, 3, 44, 11, 23, 39, 59, 6
  ];

  constructor() { }

  ngOnInit(): void {
    // يمكن إضافة أي initialization logic هنا
  }

  ngAfterViewInit(): void {
    // إعداد نطاقات الـ scroll بعد تحميل العناصر
    this.initializeScrollRanges();
    
    // تشغيل الرسوم المتحركة مبدئياً
    setTimeout(() => {
      this.updateAnimations();
    }, 100);
  }

  ngOnDestroy(): void {
    // تنظيف الموارد
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animationFrameId = requestAnimationFrame(() => {
        this.updateAnimations();
        this.isAnimating = false;
      });
    }
  }

  private initializeScrollRanges(): void {
    this.scrollRanges = [];
    
    this.zoomElements.forEach((element, index) => {
      if (index < this.animationRanges.length) {
        this.scrollRanges.push({
          element,
          start: this.animationRanges[index],
          end: this.animationRanges[index] + 10 // كل نطاق 10% من الطول
        });
      }
    });
  }

  private updateAnimations(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = (scrollTop / documentHeight) * 100;

    // تحريك العناصر العادية
    this.scrollRanges.forEach(({ element, start, end }) => {
      this.animateElement(element.nativeElement, scrollPercentage, start, end);
    });

    // تحريك العنصر المميز (Tripix) بشكل منفصل
    if (this.specialElement) {
      this.animateSpecialElement(this.specialElement.nativeElement, scrollPercentage);
    }
  }

  private animateElement(element: HTMLElement, scrollPercentage: number, start: number, end: number): void {
    let progress = 0;
    
    if (scrollPercentage >= start && scrollPercentage <= end) {
      progress = (scrollPercentage - start) / (end - start);
    } else if (scrollPercentage < start) {
      progress = 0;
    } else {
      progress = 1;
    }

    this.applyZoomEffect(element, progress);
  }

  private applyZoomEffect(element: HTMLElement, progress: number): void {
    let transform: string;
    let opacity: number;
    let blur: number;

    if (progress <= 0.5) {
      // من 0% إلى 50% - الدخول
      const normalizedProgress = progress * 2;
      transform = `translateZ(${-1000 + (1000 * normalizedProgress)}px)`;
      opacity = normalizedProgress;
      blur = 5 * (1 - normalizedProgress);
    } else {
      // من 50% إلى 100% - الخروج
      const normalizedProgress = (progress - 0.5) * 2;
      transform = `translateZ(${1000 * normalizedProgress}px)`;
      opacity = 1 - normalizedProgress;
      blur = 5 * normalizedProgress;
    }

    // تطبيق التأثيرات
    element.style.transform = transform;
    element.style.opacity = opacity.toString();
    element.style.filter = `blur(${blur}px)`;
  }

  private animateSpecialElement(element: HTMLElement, scrollPercentage: number): void {
    let progress = 0;
    
    if (scrollPercentage >= this.specialScrollRange.start && scrollPercentage <= this.specialScrollRange.end) {
      progress = (scrollPercentage - this.specialScrollRange.start) / 
                 (this.specialScrollRange.end - this.specialScrollRange.start);
    } else if (scrollPercentage < this.specialScrollRange.start) {
      progress = 0;
    } else {
      progress = 1;
    }

    // تأثير خاص للعنصر المميز
    this.applySpecialZoomEffect(element, progress, scrollPercentage);
  }

  private applySpecialZoomEffect(element: HTMLElement, progress: number, scrollPercentage: number): void {
    // العنصر يبدأ خافت مع blur ثم يقترب مع الـ scroll
    let transform: string;
    let opacity: number;
    let blur: number;

    if (progress === 0) {
      // حالة البداية - العنصر خافت مع blur
      transform = `translateZ(-1000px)`;
      opacity = 0.3; // خافت في البداية
      blur = 5; // مع blur في البداية
    } else if (progress <= 0.5) {
      // من 0% إلى 50% - الاقتراب (نفس العناصر العادية)
      const normalizedProgress = progress * 2;
      transform = `translateZ(${-1000 + (1000 * normalizedProgress)}px)`;
      opacity = 0.3 + (0.7 * normalizedProgress); // من 0.3 إلى 1
      blur = 5 * (1 - normalizedProgress);
    } else {
      // من 50% إلى 100% - الابتعاد (نفس العناصر العادية)
      const normalizedProgress = (progress - 0.5) * 2;
      transform = `translateZ(${1000 * normalizedProgress}px)`;
      opacity = 1 - normalizedProgress;
      blur = 5 * normalizedProgress;
    }

    // تطبيق التأثيرات
    element.style.transform = transform;
    element.style.opacity = opacity.toString();
    element.style.filter = `blur(${blur}px)`;
    
    // إزالة التأثيرات الخاصة
    element.style.textShadow = '';
  }

  // دوال إضافية للتحكم في الرسوم المتحركة
  public pauseAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  public resumeAnimation(): void {
    if (!this.animationFrameId) {
      this.updateAnimations();
    }
  }

  public resetAnimation(): void {
    this.zoomElements.forEach(elementRef => {
      const element = elementRef.nativeElement;
      element.style.transform = '';
      element.style.opacity = '';
      element.style.filter = '';
    });

    // إعادة تعيين العنصر المميز
    if (this.specialElement) {
      const element = this.specialElement.nativeElement;
      element.style.transform = '';
      element.style.opacity = '';
      element.style.filter = '';
      element.style.textShadow = '';
    }
  }

  // دالة للحصول على تقدم الـ scroll الحالي
  public getScrollProgress(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    return (scrollTop / documentHeight) * 100;
  }
}