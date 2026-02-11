import { Directive, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
    standalone: true,
    selector: '[goto], .hyperlink'
})
export class GotoDirective {
    constructor(private el: ElementRef, private router: Router) { }

    @HostListener('click', ['$event'])
    onClick(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        const target = this.el.nativeElement;
        const goto = target.getAttribute('goto');
        if (!goto || !target.classList.contains('hyperlink')) return;

        const url = goto.toString().trim();
        if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) {
            window.location.href = url;
            return;
        }

        const nav = url.startsWith('/') ? url : `/${url}`;
        this.router.navigateByUrl(nav).catch(() => window.location.href = url);
    }
}