import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import gsap from 'gsap';
import { Router } from '@angular/router';


@Component({
  selector: 'app-face-id',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './face-id.component.html',
  styleUrl: './face-id.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FaceIDComponent implements OnInit, AfterViewInit {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('faceContainer') faceContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('instructionsText') instructionsText!: ElementRef<HTMLParagraphElement>;
  @ViewChild('checkMark') checkMark!: ElementRef<HTMLDivElement>;
  userimage: string = '';
  counter: number = 0;


  public instructions = 'Please turn your head to the right.';
  public faceDetected = false;
  public confirmButtonVisible = false;

  private directionThreshold = 50;
  private faceMesh!: FaceMesh;
  private camera!: Camera;

  private directionStatus = {
    right: false,
    left: false,
    up: false,
    down: false
  };

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.initFaceMesh();
    this.animateElements();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.videoElement?.nativeElement) {
        console.error("❌ لم يتم العثور على عنصر الفيديو!");
        return;
      }
      this.startVideo();
    }, 500);
  }

  async initFaceMesh() {
    this.faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.faceMesh.onResults(this.onResults.bind(this));
  }

  async startVideo() {
    this.camera = new Camera(this.videoElement.nativeElement, {
      onFrame: async () => {
        await this.faceMesh.send({ image: this.videoElement.nativeElement });
      },
      width: 640,
      height: 480
    });

    this.camera.start();
    console.log("✅ الكاميرا تعمل بنجاح!");
  }

  onResults(results: any) {
    if (!results.multiFaceLandmarks || !this.canvasElement?.nativeElement) return;

    const faceLandmarks = results.multiFaceLandmarks[0];
    if (!faceLandmarks) return;

    this.faceDetected = true;
    const leftEye = faceLandmarks[33];  // العين اليسرى
    const rightEye = faceLandmarks[263]; // العين اليمنى
    const nose = faceLandmarks[1];  // الأنف

    // ✅ حساب المسافات بين العينين والأنف لتحديد الوضعية
    const eyeDistance = Math.abs(rightEye.x - leftEye.x) * 640; // المسافة بين العينين
    const noseCenter = Math.abs(nose.x * 640 - 320); // مدى تمركز الأنف في المنتصف

    if (!this.directionStatus.right && nose.x * 640 > 320 + this.directionThreshold) {
      this.directionStatus.right = true;
      this.animateStripes('right');
    }

    if (!this.directionStatus.left && nose.x * 640 < 320 - this.directionThreshold) {
      this.directionStatus.left = true;
      this.animateStripes('left');
    }

    if (!this.directionStatus.up && nose.y * 480 < 240 - this.directionThreshold) {
      this.directionStatus.up = true;
      this.animateStripes('up');
    }

    if (!this.directionStatus.down && nose.y * 480 > 240 + this.directionThreshold) {
      this.directionStatus.down = true;
      this.animateStripes('down');
    }
    if (eyeDistance > 80 && eyeDistance < 150 && noseCenter < 30) {
      console.log('انت باصص للكاميرا يرجوله');
      this.captureImage();
    }

    this.updateInstructions();
  }

  updateInstructions() {
    if (!this.directionStatus.right) {
      this.instructions = "Please turn your head to the right.";
    } else if (!this.directionStatus.left) {
      this.instructions = "Please turn your head to the left.";
    } else if (!this.directionStatus.up) {
      this.instructions = "Please point your head up.";
    } else if (!this.directionStatus.down) {
      this.instructions = "Please point your head down.";
    } else {
      this.instructions = "✅ Your identity has been successfully verified!";
      this.confirmButtonVisible = true;
      this.stopVideo();
      this.animateCheckmark();
    }
  }

  animateCheckmark() {
    // إخفاء الفيديو تدريجيًا
    gsap.to(this.videoElement.nativeElement, {
      opacity: 0,
      scale: 0.8,
      duration: 0.5,
      onComplete: () => {
        this.videoElement.nativeElement.style.display = "none";
      }
    });

    // إظهار علامة الصح بتأثير الرسم
    const checkMarkEl = this.checkMark.nativeElement;
    gsap.to(checkMarkEl, { opacity: 1, scale: 1, duration: 0.5 });

    gsap.to(".checkmark-circle", { strokeDashoffset: 0, duration: 1 });
    gsap.to(".checkmark-check", { strokeDashoffset: 0, duration: 0.5, delay: 0.5 });
  }

  captureImage() {
    if (this.counter == 0) {

      const canvas = this.canvasElement.nativeElement;
      const video = this.videoElement.nativeElement; // تأكد أنك حددت عنصر الفيديو

      // 🟢 رسم الفيديو على الـ Canvas
      const context = canvas.getContext('2d');
      context!.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 🟢 تحويل الصورة إلى Base64 وتخزينها
      const imageData = canvas.toDataURL('image/png');
      const blob = this.dataURLtoBlob(imageData);

      const formData = new FormData();
      formData.append('FaceID' , blob, 'FaceId.png')
      


      console.log("✅ تم التقاط وحفظ صورة المستخدم!");
      this.counter++;
    }
  }

  dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }


  stopVideo() {
    this.camera.stop();
  }

  confirm() {
    this.router.navigateByUrl('/DriverPage')
  }

  animateStripes(direction: string) {
    let transformX = 0, transformY = 0;

    if (direction === 'right') transformX = 20;
    if (direction === 'left') transformX = -20;
    if (direction === 'up') transformY = -20;
    if (direction === 'down') transformY = 20;

    gsap.to('.stripe', {
      scaleY: 1.5,
      transformOrigin: "center",
      x: transformX,
      y: transformY,
      duration: 0.3,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1
    });
  }

  animateElements() {
    gsap.from('.face-id-header', { opacity: 0, y: -50, duration: 1, ease: 'power2.out' });
    gsap.from('.instructions', { opacity: 0, y: -20, duration: 1, delay: 0.5, ease: 'power2.out' });
    gsap.from('.video-container', { opacity: 0, scale: 0.8, duration: 1, delay: 1, ease: 'elastic.out(1, 0.5)' });
    gsap.from('.button-container', { opacity: 0, y: 30, duration: 1, delay: 1.5, ease: 'power2.out' });
  }
}
