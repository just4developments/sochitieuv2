import { Directive, ElementRef, Input, Renderer } from '@angular/core';
import * as Uuid from 'node-uuid';

@Directive({ selector: '[suggestionData]' })
export class SuggestionDataDirective {
    @Input() suggestionData;
    id: any;
    input: any;
    dataList: any;

    constructor(public el: ElementRef, public renderer:Renderer) {
        
    }

    ngOnChanges(changes: any) {
        if(!this.id) {
            this.id = Uuid.v4();
            this.input = this.el.nativeElement.querySelector('input');
            this.renderer.setElementAttribute(this.input, 'list', this.id); 
            this.dataList = this.renderer.createElement(this.el.nativeElement, 'datalist');
            this.renderer.setElementAttribute(this.dataList, 'id', this.id);
        }else {
            this.dataList.innerHTML = '';
        }
        for(var i in this.suggestionData) {
            let option = this.renderer.createElement(this.dataList, 'option');
            this.renderer.setElementAttribute(option, 'value', this.suggestionData[i]);
        }
    }
}

@Directive({ selector: '[cssBackground]' })
export class CssBackgroundDirective {
    @Input() cssBackground;
    elem: any;

    constructor(public el: ElementRef, public renderer:Renderer) {
        
    }

    ngOnChanges(changes: any){
        let tagName = this.el.nativeElement.tagName.toLowerCase();
        if(!this.elem) {            
            if(tagName === 'ion-icon') {
                this.elem = this.el.nativeElement;
            }else if(tagName === 'ion-option') {
                console.log(this.el.nativeElement);
            }
        }
        if(tagName === 'ion-icon') {
            this.renderer.setElementStyle(this.elem, 'background-position', this.cssBackground);      
        }else if(tagName === 'ion-option') {
            console.log(this.el.nativeElement);
        }
    }
}