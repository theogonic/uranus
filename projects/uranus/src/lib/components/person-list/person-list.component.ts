import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Person } from '../person/person';

interface GroupPeople {
  group: string;
  people: Person[]
}

const group2Num: {
  [key: string]: number
} = {
    "Leaders" : 0,
    "Graduate Students" : 1,
    "Alumni" : 3,
}
@Component({
  selector: 'uranus-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.css']
})
export class PersonListComponent implements OnInit, OnChanges {

  @Input()
  people!: Person[];
  
  @Input()
  groupsConfig: Record<string, string> = {};

  @Input()
  mode: "simple" | "card" = "card";
  
  allPeople!: BehaviorSubject<Person[]>;
  groupPeople!: Observable<GroupPeople[]>;

  constructor() { 
    this.allPeople = new BehaviorSubject<Person[]>([]);
  }

  ngOnInit(): void {
    this.groupPeople = combineLatest([this.allPeople])
    .pipe(
      map(([people])=>{
        return this.peopleByGroup(people)
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.people) {
      this.allPeople.next(this.people);
    }
  }

  peopleByGroup(people: Person[]): GroupPeople[] {
    const groupIdx: Record<string, Person[]> = {};
    const result: GroupPeople[] = [];
    for(let p of people) {
      const group = p.group;
      if(!(group in groupIdx)){
        groupIdx[group] = []
      }
      groupIdx[group].push(p);
    }

    Object.keys(groupIdx)
    .sort((a, b)=> group2Num[a] -  group2Num[b])
    .forEach(group=>{
      result.push({
        group,
        people: groupIdx[group]
      })
    })

    return result;
  }


}
