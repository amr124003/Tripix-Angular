import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { Router, RouterLink } from '@angular/router';
import { FaceIDComponent } from "../face-id/face-id.component";

@Component({
  selector: 'app-driver-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './driver-page.component.html',
  styleUrl: './driver-page.component.css'
})
export class DriverPageComponent implements OnInit, AfterViewInit {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('header') header! : ElementRef<HTMLHeadingElement>;

  public instructions = 'يرجى توجيه رأسك إلى اليمين';
  public faceDetected = false;
  public confirmButtonVisible = false;
  
  private directionThreshold = 50;
  private isVerifying = false;
  private faceMesh!: FaceMesh;
  private camera!: Camera;

  private directionStatus = {
    right: false,
    left: false,
    up: false,
    down: false
  };

  public steps = [
    { name: 'Personal Information', completed: false },
    { name: 'FaceID', completed: false },
    { name: 'Car Images', completed: false },
    { name: 'Driving license', completed: false },
    { name: 'Criminal record', completed: false },
    { name: 'Car license (Front and Back)', completed: false },
  ];
  
  selectedStep: any = null;
  showSteps = true;
  isLoading = false;

  constructor(private router : Router) {}

  ngOnInit(): void {
    this.initFaceMesh();
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
    
    const canvasCtx = this.canvasElement.nativeElement.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.clearRect(0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);
    canvasCtx.drawImage(this.videoElement.nativeElement, 0, 0, 640, 480);

    const faceLandmarks = results.multiFaceLandmarks[0];
    if (!faceLandmarks) return;

    this.faceDetected = true;
    const nose = faceLandmarks[1];

    if (!this.directionStatus.right && nose.x * 640 > 320 + this.directionThreshold) {
      this.directionStatus.right = true;
      console.log("✅ تم التحقق من اليمين!");
    }

    if (!this.directionStatus.left && nose.x * 640 < 320 - this.directionThreshold) {
      this.directionStatus.left = true;
      console.log("✅ تم التحقق من اليسار!");
    }

    if (!this.directionStatus.up && nose.y * 480 < 240 - this.directionThreshold) {
      this.directionStatus.up = true;
      console.log("✅ تم التحقق من الأعلى!");
    }

    if (!this.directionStatus.down && nose.y * 480 > 240 + this.directionThreshold) {
      this.directionStatus.down = true;
      console.log("✅ تم التحقق من الأسفل!");
    }

    this.updateInstructions();
  }

  updateInstructions() {
    if (!this.directionStatus.right) {
      this.instructions = "يرجى توجيه رأسك إلى اليمين";
    } else if (!this.directionStatus.left) {
      this.instructions = "يرجى توجيه رأسك إلى اليسار";
    } else if (!this.directionStatus.up) {
      this.instructions = "يرجى توجيه رأسك إلى الأعلى";
    } else if (!this.directionStatus.down) {
      this.instructions = "يرجى توجيه رأسك إلى الأسفل";
    } else {
      this.instructions = "✅ تم التحقق من هويتك بنجاح!";
      this.confirmButtonVisible = true;
      this.captureImage();
      this.stopVideo();
    }
  }

  captureImage() {
    const canvas = this.canvasElement.nativeElement;
    const imageData = canvas.toDataURL('image/png');
    localStorage.setItem('userFaceImage', imageData);
    console.log("✅ تم حفظ صورة المستخدم!");
  }

  stopVideo() {
    this.camera.stop();
  }

  confirm() {
    console.log("✅ تم التأكيد بنجاح!");
  }

  selectStep(step: any) {
    this.showSteps = false;
    this.isLoading = true;
    
      if(step.name == "Personal Information")
      {
        this.router.navigateByUrl('/DriverInfo');
      }
      else if (step.name == "Car Images")
      {
        this.router.navigateByUrl("/CarImages")
      }
     else if(step.name == 'FaceID')
      {
        
        this.router.navigateByUrl('/FaceID');
      }
      else if(step.name == 'Driving license')
      {
        
        this.router.navigateByUrl('/DriverLicense');
      }
      else if(step.name == 'Criminal record')
      {
        
        this.router.navigateByUrl('/CriminalRecord')
      }
      else if(step.name == 'Car license (Front and Back)')
      {
        
        this.router.navigateByUrl('/CarLicence')
      }
      this.isLoading = false;
      gsap.from('.step-details', { opacity: 0, y: 50, duration: 0.5 });
  }

  closeDetails() {
    this.selectedStep = null;
    this.showSteps = true;
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
}
