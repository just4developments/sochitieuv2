import { Component, ElementRef } from '@angular/core';
import { Option, Select } from 'ionic-angular';

export class CuzOption extends Option {
    constructor(_elementRef: ElementRef){
        super(_elementRef);
        console.log('ok');
    }
}