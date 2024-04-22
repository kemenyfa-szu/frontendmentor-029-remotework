import {
  Component,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { timer } from './timer';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent implements AfterViewInit {
  @Output() inertMain: EventEmitter<boolean> = new EventEmitter<boolean>();
  // topNavMenu = this.elementRef.nativeElement.querySelector('.topnav__menu');
  isMobile = false;
  topNavMenu?: HTMLElement;
  btnOpen?: HTMLElement;
  btnClose?: HTMLElement;
  mediaWidth: MediaQueryList;
  mediaWidthQueryListener: () => void;
  timers: timer[] = [];
  canHover: MediaQueryList;
  isTouch: boolean;
  canHoverQueryListener: () => void;

  constructor(
    private elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.mediaWidth = media.matchMedia('(width < 40em)');
    this.isMobile = this.mediaWidth.matches;
    this.mediaWidthQueryListener = () => {
      changeDetectorRef.detectChanges();
      this.isMobile = this.mediaWidth.matches;
      this.setupTopNav();
    };
    this.mediaWidth.addEventListener(
      'change',
      this.mediaWidthQueryListener.bind(this)
    );

    this.canHover = media.matchMedia('(hover: none)');
    this.isTouch = this.canHover.matches;
    this.canHoverQueryListener = () => {
      changeDetectorRef.detectChanges();
      this.isTouch = this.canHover.matches;
    };
    this.canHover.addEventListener(
      'change',
      this.canHoverQueryListener.bind(this)
    );
  }

  ngAfterViewInit(): void {
    this.setupTopNav();
    this.topNavMenu =
      this.elementRef?.nativeElement.querySelector('.topnav__menu');
    this.btnOpen =
      this.elementRef?.nativeElement.querySelector('.topnav__open');
    this.btnClose =
      this.elementRef?.nativeElement.querySelector('.topnav__close');

    this.setupEventListeners();
  }

  setupEventListeners(): void {
    this.btnOpen?.addEventListener('click', this.openMobileMenu.bind(this));
    this.btnClose?.addEventListener('click', this.closeMobileMenu.bind(this));
    const blankArea =
      this.elementRef?.nativeElement.querySelector('.topnav__container');

    blankArea.addEventListener('click', this.handleblankAreaClick.bind(this));

    const elements = this.elementRef?.nativeElement.querySelectorAll(
      '.topnav__link--dropdown'
    );
    elements.forEach((element: HTMLElement) => {
      const siblingUL = element.nextElementSibling as HTMLElement;
      this.timers.push({ id: element.id, timer: 0 });
      element.addEventListener('click', this.handleClick.bind(this));
      element.addEventListener('mouseover', this.handleMouseOver.bind(this));
      element.addEventListener('mouseout', this.handleMouseOut.bind(this));
      siblingUL.addEventListener(
        'mouseover',
        this.handleMouseOverSibling.bind(this, element)
      );
      siblingUL.addEventListener(
        'mouseout',
        this.handleMouseOutSibling.bind(this, element)
      );
    });
  }

  handleblankAreaClick(event: MouseEvent) {
    if ((event.target as HTMLElement).className === 'topnav__container') {
      this.closeMobileMenu();
    }
  }

  handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    target.setAttribute(
      'aria-expanded',
      target.getAttribute('aria-expanded') === 'true' &&
        (this.isTouch || this.isMobile)
        ? 'false'
        : 'true'
    );
  }

  handleMouseOver(event: MouseEvent): void {
    // ulElement.style.display = 'block';
    if (!this.isTouch) {
      const target = event.target as HTMLElement;
      const timeoutIndex = this.getTimerIndex(target.id);
      clearTimeout(this.timers[timeoutIndex].timer);

      target.setAttribute('aria-expanded', 'true');
    }
  }

  handleMouseOut(event: Event): void {
    const eventTarget = event.target as HTMLElement;
    const timeoutIndex = this.getTimerIndex(eventTarget.id);
    if (this.isTouch || !this.isMobile) {
      this.timers[timeoutIndex].timer = window.setTimeout(() => {
        const target = event.target as HTMLElement;
        target.setAttribute('aria-expanded', 'false');
      }, 500);
    }
  }

  handleMouseOverSibling(element: HTMLElement): void {
    if (!this.isTouch) {
      const timeoutIndex = this.getTimerIndex(element.id);
      clearTimeout(this.timers[timeoutIndex].timer);
    }
  }

  handleMouseOutSibling(element: HTMLElement): void {
    if (this.isTouch || !this.isMobile) {
      const timeoutIndex = this.getTimerIndex(element.id);
      this.timers[timeoutIndex].timer = window.setTimeout(() => {
        element.setAttribute('aria-expanded', 'false');
      }, 500);
    }
  }
  getTimerIndex(id: string) {
    const me = (element: timer) => element.id == id;
    return this.timers.findIndex(me);
  }

  setupTopNav() {
    if (this.isTouch) {
      this.topNavMenu?.setAttribute('inert', '');
    } else {
      this.closeMobileMenu();
      this.topNavMenu?.removeAttribute('inert');
    }
  }

  openMobileMenu() {
    this.btnOpen?.setAttribute('aria-expanded', 'true');
    this.topNavMenu?.removeAttribute('inert');
    this.inertMain?.emit(true);
    this.btnClose?.focus();
  }

  closeMobileMenu() {
    const elements = this.elementRef?.nativeElement.querySelectorAll(
      '.topnav__link--dropdown'
    );
    elements.forEach((element: HTMLElement) => {
      element.setAttribute('aria-expanded', 'false');
    });
    this.btnOpen?.setAttribute('aria-expanded', 'false');
    this.topNavMenu?.setAttribute('inert', '');
    this.inertMain?.emit(false);
    this.btnOpen?.focus();
  }
}
