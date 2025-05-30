import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer2, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { gsap } from 'gsap';
import { AuthService } from '../../Services/Auth/auth.service';
import { routes } from '../../app.routes';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-driver-login',
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './driver-login.component.html',
  styleUrl: './driver-login.component.css'
})
export class DriverLoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container') containerEl!: ElementRef;
  @ViewChild('passwordInput') nameEl!: ElementRef;
  @ViewChild('emailInput') emailEl!: ElementRef;
  @ViewChild('checkbox') checkboxEl!: ElementRef;
  @ViewChild('submitBtn') submitBtn!: ElementRef;
  @ViewChild('svg') svgEl!: ElementRef;
  ErrorResponse : string = ''

  formGroup!: FormGroup;
  
  // SVG Elements
  sprayer: any;
  sprayHandContainer: any;
  sprayLines!: any[];
  sprayBubbles!: any[];
  pushingHand: any;
  sprayerHead: any;
  gearsContainer: any;
  gearConnector: any;
  pullSystemContainer: any;
  checkboxPullLine: any;
  checkboxPullCircle: any;
  btnPullLine: any;
  btnHandlerCircle: any;
  spiralContainer: any;
  weightBigContainer: any;
  scalesContainer: any;
  scalesLine: any;
  weightBig: any;
  spiralPath: any;
  carContainer: any;
  car: any;
  carInclineWrapper: any;
  timingChains!: any[];
  reelsConnector: any;
  carWeightConnector: any;
  grabbingHand: any;
  grabbingHandOpenFingers!: any[];
  grabbingHandClosedFingers!: any[];

  // State variables
  sprayRepeatCounter = 0;
  state = {
    handClosed: false,
    sumbitBtnOnPlace: false,
    sumbitBtnTextOpacity: 0,
    pullProgress: 0
  };
  
  passwordValid = false;
  emailValid = false;
  emailTl!: gsap.core.Timeline;
  gearsTls: gsap.core.Timeline[] = [];
  resizeListener!: () => void;

  constructor(private fb: FormBuilder,private renderer: Renderer2 , private authservice : AuthService , private router : Router) { 
    
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      subscribe: [false]
    });

    // Subscribe to form changes
    this.formGroup.get('password')!.valueChanges.subscribe(value => {
      this.passwordValid = this.formGroup.get('password')!.valid;
      this.handleNameChange();
    });

    this.formGroup.get('email')!.valueChanges.subscribe(value => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      this.emailValid = emailRegex.test(value);
      this.handleEmailChange();
    });

    this.formGroup.get('subscribe')!.valueChanges.subscribe(() => {
      this.createPullingTimeline(this.state.handClosed, this.formGroup.get('subscribe')!.value);
    });
  }

  ngAfterViewInit(): void {
    // Initialize all SVG elements
    this.initSvgElements();
    
    // Setup initial layout
    this.layoutPreparation();
    
    // Scale to fit
    this.scaleToFit();
    
    // Add resize listener
    this.resizeListener = this.renderer.listen('window', 'resize', () => {
      this.scaleToFit();
    });
    
    // Initialize animations
    this.emailTl = this.createEmailTl();
    this.gearsTls = this.createGearsTimelines();
    this.createPullingTimeline(this.state.handClosed, this.formGroup.get('subscribe')!.value);
  }

  ngOnDestroy(): void {
    // Remove resize listener
    if (this.resizeListener) {
      this.resizeListener();
    }
    
    // Clean up GSAP animations
    if (this.emailTl) {
      this.emailTl.kill();
    }
    
    this.gearsTls.forEach(tl => {
      if (tl) {
        tl.kill();
      }
    });
  }

  initSvgElements(): void {
    const svg = this.svgEl.nativeElement;
    
    this.sprayer = svg.querySelector('.sprayer');
    this.sprayHandContainer = svg.querySelector('.spray-hand-container');
    this.sprayLines = Array.from(svg.querySelectorAll('.spray-line'));
    this.sprayBubbles = Array.from(svg.querySelectorAll('.spray-bubble'));
    this.pushingHand = svg.querySelector('.pushing-hand');
    this.sprayerHead = svg.querySelector('.sprayer-head');
    this.gearsContainer = svg.querySelector('svg .gears');
    this.gearConnector = svg.querySelector('.gear-connector');
    this.pullSystemContainer = svg.querySelector('.pull-system');
    this.checkboxPullLine = svg.querySelector('.checkbox-pull-line');
    this.checkboxPullCircle = svg.querySelector('.checkbox-pull-circle');
    this.btnPullLine = svg.querySelector('.submit-btn-connector');
    this.btnHandlerCircle = svg.querySelector('.submit-btn-circle');
    this.spiralContainer = svg.querySelector('.spiral-container');
    this.weightBigContainer = svg.querySelector('.weight-big-container');
    this.scalesContainer = svg.querySelector('.scales-container');
    this.scalesLine = svg.querySelector('.scales-moving-line');
    this.weightBig = svg.querySelector('.weight-big');
    this.spiralPath = svg.querySelector('.spiral-path');
    this.carContainer = svg.querySelector('.car-container');
    this.car = svg.querySelector('.car');
    this.carInclineWrapper = svg.querySelector('.car-container g');
    this.timingChains = Array.from(svg.querySelectorAll('.timing-chain'));
    this.reelsConnector = svg.querySelector('.reels-connector');
    this.carWeightConnector = svg.querySelector('.car-weight-connector');
    this.grabbingHand = svg.querySelectorAll('.grabbing-hand');
    this.grabbingHandOpenFingers = Array.from(svg.querySelectorAll('.grabbing-hand-finger-open'));
    this.grabbingHandClosedFingers = Array.from(svg.querySelectorAll('.grabbing-hand-finger-closed'));
  }

  scaleToFit(): void {
    const h = 800;

    if (window.innerHeight < h) {
      gsap.set(this.containerEl.nativeElement, {
        scale: window.innerHeight / h,
        transformOrigin: "50% 75%"
      });
    }
  }

  handleNameChange(): void {
    if (this.passwordValid) {
      this.renderer.addClass(this.nameEl.nativeElement, 'valid');
      this.gearsTls.forEach(tl => {
        if (tl.paused()) {
          tl.play();
          gsap.fromTo(tl, {
            timeScale: 0
          }, {
            timeScale: 1
          });
        }
      });
    } else {
      this.renderer.removeClass(this.nameEl.nativeElement, 'valid');
      this.gearsTls.forEach(tl => {
        if (!tl.paused()) {
          gsap.to(tl, {
            timeScale: 0,
            onComplete: () => {
              tl.pause();
            }
          });
        }
      });
      this.sprayRepeatCounter = 0;
      gsap.to(this.submitBtn.nativeElement, {
        duration: 0.3,
        color: "rgba(0, 0, 0, 0)"
      });
    }
  }

  handleEmailChange(): void {
    if (this.emailValid) {
      this.emailTl.play();
      this.renderer.addClass(this.emailEl.nativeElement, 'valid');
    } else {
      this.emailTl.reverse();
      this.renderer.removeClass(this.emailEl.nativeElement, 'valid');
    }
  }

  credentials = {
    email : '',
    password : ''
  }

  onSubmit(): void {

    if (this.emailValid && this.formGroup.get('subscribe')!.value && this.passwordValid && this.sprayRepeatCounter > 1
    ) {
      const credentials = {
        Email: this.formGroup.get('email')?.value,
        Password: this.formGroup.get('password')?.value,
      };
    
      this.authservice.Login(credentials).subscribe({
        next: (authresponse) => {
          console.log(authresponse);
          localStorage.setItem('token', authresponse.token);
          
    
          // التوجيه حسب الدور
          if (authresponse.roles.includes('Driver')) {
            this.router.navigateByUrl('/StartEngine');
            localStorage.setItem('role','Driver');
          } else if (authresponse.roles.includes('Admin')) {
            this.router.navigateByUrl('/Dashboard');
            localStorage.setItem('role','Admin');
          } else if (authresponse.roles.includes('SuperAdmin')) {
            this.router.navigateByUrl('/Dashboard');
            localStorage.setItem('role','SuperAdmin');
          }else if (authresponse.roles.includes('User')) {
            this.router.navigateByUrl('/Home');
            localStorage.setItem('role','User');
          }
    
          // شغل gsap هنا بعد التأكد إن كل حاجة تمام
          gsap.to('svg > *', {
            duration: 0.1,
            opacity: 0,
            stagger: {
              each: 0.03,
              from: 'random',
              ease: 'none',
            },
          });
    
          gsap.to('.form-row', {
            delay: 0.4,
            duration: 0.1,
            opacity: 0,
            stagger: 0.1,
          });
        },
        error: (err) => {
          this.ErrorResponse = err.error.errors[1];
          return;
        },
      });
    }
    

  }

  layoutPreparation(): void {
    gsap.set(this.pullSystemContainer, {
      x: 375,
      y: 646
    });
    gsap.set(this.sprayHandContainer, {
      x: 700,
      y: 621
    });
    gsap.set(this.sprayer, {
      x: -59.5,
      y: 53
    });
    gsap.set(this.carContainer, {
      x: 190,
      y: 802,
    });
    gsap.set(this.scalesContainer, {
      x: 170,
      y: 710,
    });
    gsap.set(this.grabbingHand, {
      x: 297,
      y: 830
    });
    gsap.set(this.grabbingHandClosedFingers, {
      opacity: 0
    });
    gsap.set(this.spiralContainer, {
      x: 305,
      y: 435,
      svgOrigin: "14 14",
      scaleX: -1,
    });
    gsap.set(this.weightBigContainer, {
      x: 305,
      y: 435,
    });
    gsap.set(this.submitBtn.nativeElement, {
      color: "rgba(0, 0, 0, 0)"
    });
    gsap.set([this.sprayLines, this.sprayBubbles], {
      opacity: 0
    });
    gsap.set(this.timingChains[0], {
      attr: {
        "stroke-width": "5",
        "stroke-dasharray": "0 12",
      }
    });
    gsap.set(this.timingChains[1], {
      attr: {
        "stroke-width": "5",
        "stroke-dasharray": "0 12",
      }
    });
    gsap.set(this.checkboxPullLine, {
      attr: {
        y1: -105,
        y2: 44
      }
    });
    gsap.set(this.submitBtn.nativeElement, {
      transformOrigin: "100% 0%",
      rotation: -90
    });
    gsap.set(this.checkboxPullCircle, {
      y: 44
    });
  }

  updateSpiralPath(centerX: number, centerY: number, radius: number, coils: number, points: number, offset: number): void {
    let path = "";
    let thetaMax = coils * 2 * Math.PI;
    const awayStep = radius / thetaMax;
    const chord = 2 * Math.PI / points;
    thetaMax -= offset * points * chord;

    for (let theta = 0; theta <= thetaMax; theta += chord) {
      const away = awayStep * theta;
      const x = centerX + Math.cos(theta) * away;
      const y = centerY + Math.sin(theta) * away;

      if (theta === 0) {
        path += `M${x},${y}`;
      } else {
        const prevAway = awayStep * (theta - chord);
        const arcRadius = (away + prevAway) / 2;
        path += ` A${arcRadius},${arcRadius} 0 0,1 ${x},${y}`;
      }
    }

    const outerAngle = thetaMax + .5 * Math.PI;
    const outerLength = 50 + 25 * offset;
    const endPoint = [
      Math.cos(outerAngle) * outerLength,
      Math.sin(outerAngle) * outerLength,
    ];
    path += (' l' + endPoint[0] + ',' + endPoint[1]);

    gsap.set(this.spiralPath, {
      attr: {
        d: path
      },
    });
    
    gsap.set(this.weightBig, {
      x: -47 + 3 * offset,
      y: 12 + outerLength
    });
  }

  createEmailTl(): gsap.core.Timeline {
    const spiralTurnsNumber = 8;
    const spiralProgress = { v: 0 };
    const hammerTimeStart = 1.85;
    const fingersDelay = .5;
    const fingersTimeDelta = .03;
    
    const tl = gsap.timeline({
      paused: true,
      defaults: {
        ease: "none",
        duration: 2
      },
      onUpdate: () => {
        this.updateSpiralPath(14, 14, 45, 17, 200, spiralTurnsNumber * spiralProgress.v);
      },
    })
      .to(spiralProgress, {
        v: 1
      }, 0)
      .to(this.spiralContainer, {
        rotation: -spiralTurnsNumber * 360,
      }, 0)
      .fromTo(this.scalesLine, {
        rotation: -20,
        svgOrigin: "92 20"
      }, {
        duration: .15,
        rotation: -1,
        svgOrigin: "92 20"
      }, hammerTimeStart)
      .fromTo(this.timingChains[0], {
        attr: {
          "stroke-dashoffset": 2
        }
      }, {
        duration: .15,
        attr: {
          "stroke-dashoffset": 20
        }
      }, hammerTimeStart)
      .fromTo(this.timingChains[1], {
        attr: {
          "stroke-dashoffset": 24
        }
      }, {
        duration: .15,
        attr: {
          "stroke-dashoffset": 6
        }
      }, hammerTimeStart)
      .to(this.reelsConnector, {
        duration: .15,
        y: 18
      }, hammerTimeStart)
      .to(this.carWeightConnector, {
        duration: .15,
        y: -18
      }, hammerTimeStart)
      .to(this.carInclineWrapper, {
        duration: .15,
        rotation: 6,
        svgOrigin: "120 93"
      }, hammerTimeStart)
      .fromTo(this.car, {
        x: -50,
      }, {
        duration: .6,
        x: 95,
        ease: "power2.in",
      }, hammerTimeStart);

    for (let i = 0; i < 5; i++) {
      tl
        .set(this.grabbingHandOpenFingers[i], {
          opacity: 0
        }, hammerTimeStart + fingersDelay + fingersTimeDelta * (i + 1))
        .set(this.grabbingHandClosedFingers[i], {
          opacity: 1
        }, hammerTimeStart + fingersDelay + fingersTimeDelta * (i + 1));
    }
    
    tl
      .fromTo(this.state, {
        handClosed: false
      }, {
        duration: .01,
        handClosed: true
      }, ">")
      .to(this.grabbingHand, {
        duration: fingersTimeDelta * 5,
        x: "+=20"
      }, hammerTimeStart + fingersDelay);

    tl.progress(0.001);

    return tl;
  }

  createGearsTimelines(): gsap.core.Timeline[] {
    const tls: gsap.core.Timeline[] = [];

    const params = {
      baseSize: 15,
      pitch: 11,
      teethCurve: .6,
      startPos: { x: 634, y: 389 },
      speed: .2
    };
    
    const data = [{
      angle: 0, teethNumber: 10, hasHole: true
    }, {
      angle: -.5, teethNumber: 32, hasHole: true
    }, {
      angle: 1.65, teethNumber: 12, hasHole: false
    }];

    const handleRadius = 14;
    const gears: any[] = [];
    
    data.forEach((d, dIdx) => {
      const radius = (d.teethNumber * params.baseSize) / (2 * Math.PI);
      let x, y, startAngle;

      if (dIdx === 0) {
        startAngle = 0;
        x = params.startPos.x;
        y = params.startPos.y;
      } else {
        const parent = gears[dIdx - 1];
        const size = parent.teethNumber / d.teethNumber;
        x = parent.center.x + Math.cos(d.angle) * (parent.radius + radius);
        y = parent.center.y + Math.sin(d.angle) * (parent.radius + radius);
        startAngle = (1 + size) * d.angle - size * parent.angle;
      }

      const svgNS = "http://www.w3.org/2000/svg";
      const group = document.createElementNS(svgNS, "g");
      const path = document.createElementNS(svgNS, "path");
      this.gearsContainer.appendChild(group);
      group.appendChild(path);

      const gear = {
        idx: dIdx,
        center: { x, y },
        radius,
        angle: startAngle,
        teethNumber: d.teethNumber,
        hasHole: d.hasHole,
        toothAngle: 2 * Math.PI / d.teethNumber,
        toothCurveAngle: params.teethCurve / d.teethNumber,
        group
      };

      const rOut = gear.radius + .25 * params.pitch;
      const rIn = rOut - .75 * params.pitch;
      let pathD = "M" + (gear.center.x + Math.cos(gear.angle - gear.toothAngle + gear.toothCurveAngle) * rOut) + ", " + (gear.center.y + Math.sin(gear.angle - gear.toothAngle + gear.toothCurveAngle) * rOut) + " ";
      
      for (let a = gear.angle; a < (gear.angle + 2 * Math.PI - .5 * gear.toothAngle); a += gear.toothAngle) {
        const pa = (a - .5 * gear.toothAngle);
        pathD += ("L" + (gear.center.x + Math.cos(pa - gear.toothCurveAngle) * rOut) + ", " + (gear.center.y + Math.sin(pa - gear.toothCurveAngle) * rOut) + " ");
        pathD += ("L" + (gear.center.x + Math.cos(pa) * rIn) + ", " + (gear.center.y + Math.sin(pa) * rIn) + " ");
        pathD += ("L" + (gear.center.x + Math.cos(a) * rIn) + ", " + (gear.center.y + Math.sin(a) * rIn) + " ");
        pathD += ("L" + (gear.center.x + Math.cos(a + gear.toothCurveAngle) * rOut) + ", " + (gear.center.y + Math.sin(a + gear.toothCurveAngle) * rOut) + " ");
      }

      if (gear.hasHole) {
        const holeRadius = .5 * rIn;
        pathD += ("M" + (gear.center.x - holeRadius) + ", " + (gear.center.y) + " ");
        pathD += `A ${holeRadius} ${holeRadius} 1 1 0 ${gear.center.x + holeRadius} ${gear.center.y}`;
        pathD += `A ${holeRadius} ${holeRadius} 1 1 0 ${gear.center.x - holeRadius} ${gear.center.y}`;
      }

      if (dIdx === 0) {
        const circle = document.createElementNS(svgNS, "circle");
        gsap.set(circle, {
          attr: {
            cx: gear.center.x,
            cy: gear.center.y,
            r: 5,
            fill: "#000000"
          }
        });
        this.gearsContainer.appendChild(circle);
        gsap.set(path, {
          attr: {
            fill: "#000000",
            "fill-opacity": .25
          }
        });
      } else if (dIdx === (data.length - 1)) {
        gsap.set(path, {
          attr: {
            fill: "#000000",
            "fill-opacity": .25
          }
        });
        const circle = document.createElementNS(svgNS, "circle");
        gsap.set(circle, {
          attr: {
            cx: gear.center.x + handleRadius,
            cy: gear.center.y,
            r: 5,
            fill: "#000000"
          }
        });
        gear.group.appendChild(circle);
      }

      path.setAttribute("d", pathD);

      const tl = gsap.timeline({
        repeat: -1,
        paused: true,
      })
        .to(group, {
          duration: params.speed * gear.teethNumber,
          rotation: 360 * (gear.idx % 2 ? -1 : 1),
          svgOrigin: gear.center.x + " " + gear.center.y,
          ease: "none",
        });

      if (dIdx === (data.length - 1)) {
        tl.eventCallback("onUpdate", () => {
          const angle = tl.progress() * 2 * Math.PI;
          const deltaY = Math.sin(angle) * handleRadius;
          gsap.set(this.pushingHand, {
            y: deltaY,
          });
          
          if (deltaY > 8) {
            const d = Math.max(0, deltaY - 8);
            gsap.set(this.sprayerHead, {
              y: d
            });

            let sprayProgress = Math.max(0, tl.progress() - .1);
            sprayProgress *= (1 / .2);

            let bubblesOpacity = (sprayProgress > 1) ? 0 : sprayProgress;
            bubblesOpacity *= (1 - Math.pow(bubblesOpacity, 8));

            const textProgress = Math.pow(sprayProgress / 1.5, 6);

            if (!this.state.sumbitBtnOnPlace) {
              this.state.sumbitBtnTextOpacity = (this.sprayRepeatCounter - 1) * .3 + .3 * textProgress;
              this.state.sumbitBtnTextOpacity = Math.pow(this.state.sumbitBtnTextOpacity, 2);
            }

            gsap.set(this.submitBtn.nativeElement, {
              color: "rgba(0, 0, 0, " + this.state.sumbitBtnTextOpacity + ")"
            });
            
            gsap.set(this.sprayLines, {
              attr: {
                "stroke-dashoffset": 70 * sprayProgress
              },
              opacity: Math.pow(bubblesOpacity, 2)
            });
            
            this.sprayBubbles.forEach((b, bIdx) => {
              gsap.set(b, {
                x: 25 * (1 - sprayProgress) * (1 + .1 * bIdx),
                scale: .5 + 1.4 * Math.pow(sprayProgress, 2),
                transformOrigin: "center center",
                opacity: bubblesOpacity
              });
            });
          }

          gsap.set(this.gearConnector, {
            attr: {
              x1: gear.center.x + handleRadius * Math.cos(angle),
              y1: gear.center.y + handleRadius * Math.sin(angle),
              x2: 700 + 18,
              y2: 646 - 100 + deltaY
            }
          });
        });

        tl.eventCallback("onRepeat", () => {
          if (!this.state.sumbitBtnOnPlace) {
            this.sprayRepeatCounter++;
          }
        });
      }

      tl.progress(0.6);
      tls.push(tl);
      gears.push(gear);
    });

    return tls;
  }

  createPullingTimeline(isFixed: boolean, btnPulled: boolean): gsap.core.Timeline {
    const tl = gsap.timeline({
      defaults: {
        ease: "power1.inOut",
        duration: 1
      },
      onUpdate: () => this.animatePullingLine(isFixed)
    });

    if (isFixed && btnPulled) {
      tl
        .to(this.state, {
          pullProgress: 1
        }, 0)
        .to(this.submitBtn.nativeElement, {
          rotation: 0
        }, 0)
        .to(this.state, {
          duration: .1,
          sumbitBtnOnPlace: 1
        }, .9)
        .to(this.checkboxPullLine, {
          attr: { y2: 44 - 130 }
        }, 0)
        .to(this.checkboxPullCircle, {
          y: 44 - 130
        }, 0);
    } else if (!isFixed && btnPulled) {
      tl
        .to(this.state, {
          pullProgress: 1
        }, 0)
        .to(this.checkboxPullLine, {
          attr: { y2: 44 - 130 }
        }, 0)
        .to(this.checkboxPullCircle, {
          y: 44 - 130
        }, 0);
    } else if (isFixed && !btnPulled) {
      tl
        .to(this.state, {
          pullProgress: 0
        }, 0)
        .to(this.submitBtn.nativeElement, {
          rotation: -90
        }, 0)
        .to(this.state, {
          duration: .1,
          sumbitBtnOnPlace: 0
        }, 0)
        .to(this.checkboxPullLine, {
          attr: { y2: 44 }
        }, 0)
        .to(this.checkboxPullCircle, {
          y: 44
        }, 0);
    } else if (!isFixed && !btnPulled) {
      tl
        .to(this.state, {
          pullProgress: 0
        }, 0)
        .to(this.checkboxPullLine, {
          attr: { y2: 44 }
        }, 0)
        .to(this.checkboxPullCircle, {
          y: 44
        }, 0);
    }

    return tl;
  }

  animatePullingLine(isFixed: boolean): void {
    const buttonOriginPoint = [260, -76];
    const btnWidth = 270;

    const rotation = Number(gsap.getProperty(this.submitBtn.nativeElement, "rotation"));
    const deg = (rotation - 4) * Math.PI / 180;

    const btnEnd = [
      buttonOriginPoint[0] - (btnWidth - 20) * Math.cos(deg),
      buttonOriginPoint[1] - (btnWidth - 20) * Math.sin(deg),
    ];
    
    gsap.set(this.btnHandlerCircle, {
      attr: {
        cx: btnEnd[0],
        cy: btnEnd[1]
      }
    });

    const handle = 7;
    const r = 10;

    let btnPullLinePath = "M" + (-r - handle) + "," + (250 - (isFixed ? 0 : this.state.pullProgress * 300));
    btnPullLinePath += "h" + (2 * handle);
    btnPullLinePath += "h" + (-handle);
    btnPullLinePath += " V" + (44 - this.state.pullProgress * 130);
    const slideAngle = .3 * Math.PI * (1 - (isFixed ? 1 : .5) * this.state.pullProgress);
    const dx = r * Math.cos(slideAngle);
    const dy = -r * Math.sin(slideAngle);
    btnPullLinePath += "a" + r + ', ' + r + " 0 0 1 " + (r + dx) + " " + dy;
    btnPullLinePath += " L" + btnEnd[0] + "," + btnEnd[1];

    gsap.set(this.btnPullLine, {
      attr: {
        d: btnPullLinePath
      },
      strokeWidth: 3
    });
  }
}