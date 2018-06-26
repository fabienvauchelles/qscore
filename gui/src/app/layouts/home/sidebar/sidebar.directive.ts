import {Directive, HostListener} from '@angular/core';



/**
 * Allows the sidebar to be toggled via click.
 */
@Directive({
    selector: '[sidebarToggler]'
})
export class SidebarToggleDirective {
    constructor() {
    }

    @HostListener('click', ['$event'])
    toggleOpen($event: any) {
        $event.preventDefault();
        document.querySelector('body').classList.toggle('sidebar-hidden');
    }
}



@Directive({
    selector: '[sidebarMinimizer]'
})
export class SidebarMinimizeDirective {
    constructor() {
    }

    @HostListener('click', ['$event'])
    toggleOpen($event: any) {
        $event.preventDefault();
        document.querySelector('body').classList.toggle('sidebar-minimized');
    }
}



@Directive({
    selector: '[brandMinimizer]'
})
export class BrandMinimizeDirective {
    constructor() {
    }

    @HostListener('click', ['$event'])
    toggleOpen($event: any) {
        $event.preventDefault();
        document.querySelector('body').classList.toggle('brand-minimized');
    }
}



@Directive({
    selector: '[sidebarTogglerMobile]'
})
export class SidebarToggleMobileDirective {
    constructor() {
    }

    // Check if element has class
    private hasClass(target: any, elementClassName: string) {
        return new RegExp('(\\s|^)' + elementClassName + '(\\s|$)').test(target.className);
    }

    @HostListener('click', ['$event'])
    toggleOpen($event: any) {
        $event.preventDefault();
        document.querySelector('body').classList.toggle('sidebar-mobile-show');
    }
}



export const SIDEBAR_TOGGLE_DIRECTIVES = [
    SidebarToggleDirective,
    SidebarMinimizeDirective,
    BrandMinimizeDirective,
    SidebarToggleMobileDirective
];
