import {
  Directive,
  Output,
  EventEmitter,
  ElementRef,
  Inject,
  AfterViewInit,
  OnDestroy,
  Input,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription, filter, fromEvent } from 'rxjs';

@Directive({
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideDirective implements AfterViewInit, OnDestroy {
  @Input() isMobile?: boolean;
  @Output() closeMe = new EventEmitter<ElementRef>();

  documentClickSubscription: Subscription | undefined;

  constructor(
    private element: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterViewInit(): void {
    this.documentClickSubscription = fromEvent(this.document, 'click')
      .pipe(
        filter((event) => {
          return !this.isInside(event.target as HTMLElement);
        })
      )
      .subscribe(() => {
        this.closeMe.emit(this.element);
      });
  }

  ngOnDestroy(): void {
    this.documentClickSubscription?.unsubscribe();
  }

  isInside(elementToCheck: HTMLElement): boolean {
    return (
      this.isMobile ||
      elementToCheck === this.element.nativeElement ||
      this.element.nativeElement.contains(elementToCheck)
    );
  }
}
