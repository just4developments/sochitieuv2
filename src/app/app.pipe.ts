import { Pipe, PipeTransform } from '@angular/core';
import _ from 'lodash';

@Pipe({
  name: 'textfilter',
  pure: false
})
export class TextFilterPipe implements PipeTransform {
  transform(values: any[], field: any[], text): any {
    if(values.length === 0 || !text || text.length === 0) return values;
    let items = _.cloneDeep(values);
    return items.filter((item) => {
        item.items = item.items.filter((item0) => {
            for(let f of field){
                if(item0[f].includes(text)) return true;
            }
            return false;
        });
        return items.length > 0;
    });
  }
}