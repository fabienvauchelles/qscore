import {Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';



@Directive({
    selector: '[processing]'
})
export class ProcessingDirective implements OnChanges, OnInit {

    @Input() processing: boolean;

    private _iconEl: Object;
    private _iconElClassName: string;


    constructor(public el: ElementRef) {
    }


    ngOnInit(): void {
        this._iconEl = this.el.nativeElement.querySelector('.fa');
        this._iconElClassName = this._iconEl['className'];
    }


    ngOnChanges(changes: SimpleChanges): void {
        if (!this._iconEl) {
            return;
        }

        if (this.processing) {
            this.el.nativeElement.disabled = true;
            this._iconEl['className'] = 'fa fa-spin fa-refresh';
        }
        else {
            this.el.nativeElement.disabled = false;
            this._iconEl['className'] = this._iconElClassName;
        }
    }
}
