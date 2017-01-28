import { Component } from '@angular/core';

import { AppService } from '../../app/app.service';

@Component({
  selector: 'list-notes',
  templateUrl: 'index.html'
})
export class Note {
  list: Array<any> = [];
  isAdd: boolean = false;
  note: any = {
    updated_date: new Date().toISOString()
  };

  constructor(private appService: AppService) {
    this.appService.getLocalStorage('note').then((resp) => {
      this.list = resp || [];
    })
  }

  add(){
    this.isAdd = !this.isAdd;
  }

  undo(item, sliding: any){
    item.isDone = false;
    this.sort('confirm__update_done');
    this.storeDb('confirm__update_done');
    sliding.close();
  }

  delete(idx, sliding){
    this.list.splice(idx, 1);
    this.storeDb('confirm__delete_done');
  }

  change(item, sliding){
    item.isDone = true;
    this.sort('confirm__update_done');
    this.storeDb('confirm__update_done');
  }

  private sort(msg:string){
    this.list = this.list.sort((a, b) => {
      if(a.isDone && b.isDone) return 0;
      return a.isDone ? 1 : 0;
    });    
  }

  save(){
    this.list.splice(0, 0, {
      title: this.note.title,
      updated_date: this.appService.date.utcToLocal(this.note.updated_date)
    });
    this.sort('confirm__add_done');    
    this.storeDb('confirm__add_done');
    this.note.title = '';
  }

  private storeDb(key){
    this.appService.setLocalStorage('note', this.list).then(() => {
      this.appService.getI18(key).subscribe((msg) => {
        this.appService.toast(msg);
      });      
    });
  }
  
}
