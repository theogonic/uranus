import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeSuffix'
})
export class RemoveSuffixPipe implements PipeTransform {

  transform(value: string, ...args: string[]): string {
    if(!value){
      return value;
    }
    let lastIdx = value.length;

    for (const arg of args) {
      if(value[lastIdx-1] == arg){
        lastIdx -= 1;
      }
      if(lastIdx == 0){
        break;
      }
    }
    return value.substring(0, lastIdx)
  }

}
