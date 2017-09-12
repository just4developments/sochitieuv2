import { Component } from '@angular/core';

import { AppService } from '../../app/app.service';

@Component({
  selector: 'list-log',
  templateUrl: 'index.html'
})
export class Log {
  list: Array<any> = [];

  constructor(private appService: AppService) {
    this.appService.getLog().then(data => {
      this.list = data
    })
  }

}
