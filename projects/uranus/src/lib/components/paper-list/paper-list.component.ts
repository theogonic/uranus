import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, combineLatest, empty, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { authorExistInPaper, getAuthorsInStringArr, Paper } from '../paper/paper';


type PapersByYear = {
  year: string,
  papers: Paper[]
}

const month2Num: {
  [key: string]: number
} = {
    "January" : 1,
    "February" : 2,
    "March" : 3,
    "April" : 4,
    "May" : 5,
    "June" : 6,
    "July" : 7,
    "August" : 8,
    "September" : 9,
    "October" : 10,
    "November" : 11,
    "December" : 12,
    "":13
}

@Component({
  selector: 'uranus-paper-list',
  templateUrl: './paper-list.component.html',
  styleUrls: ['./paper-list.component.scss']
})
export class PaperListComponent implements OnInit, OnChanges {

  @Input()
  papers!: Paper[];

  filtersForm!: FormGroup;
  allPapers!: BehaviorSubject<Paper[]>;
  filteredPapers!: Observable<PapersByYear[]>;
  filterAuthorSub?: Subscription ;
  filterYearSub?: Subscription;
  allAuthors!: string[];
  allYears!: string[];


  constructor(private fb: FormBuilder) { 
    this.allPapers = new BehaviorSubject<Paper[]>([]);

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.papers) {
      this.allPapers.next(this.papers);
      
      let authors = new Set<string>();
      let years = new Set<string>();
      for(let paper of this.papers){

        const pauthors = getAuthorsInStringArr(paper);
        if(pauthors){
          pauthors.forEach(a => authors.add(a))
        }
        if(paper.year){
          years.add(paper.year)
        }

      } 
      this.allAuthors = Array.from(authors.values());
      this.allYears = Array.from(years.values());
    }
  }

  ngOnInit(): void {
    this.filtersForm = this.initFiltersForm(this.fb);
    this.filteredPapers = combineLatest([this.allPapers, this.filtersForm.valueChanges.pipe(startWith({}), debounceTime(400)) ])
    .pipe(
      map(([papers, filters])=>{
        return this.filterPapers(papers, filters)
      }),
      map(papers=>{
        return this.papersByYear(papers)
      })
    );
  

  }

  papersByYear(papers: Paper[]): PapersByYear[] {
    const yearIdx: Record<string, Paper[]> = {};
    const unknownYearPapers: Paper[] = [];
    const result: PapersByYear[] = [];
    for(let p of papers) {
      if(!p.year){
        unknownYearPapers.push(p);
        continue;
      }
      const year = p.year;
      if(!(year in yearIdx)){
        yearIdx[year] = []
      }
      yearIdx[year].push(p);
    }

    Object.keys(yearIdx)
    .sort((a, b)=> parseInt(b) -  parseInt(a))
    .forEach(year=>{
      result.push({
        year,
        papers: this.sortPapersByMonth(yearIdx[year])
      })
    })
    if(unknownYearPapers.length > 0) {
      result.push({
        year: "unknown",
        papers: unknownYearPapers
      })
    }
    return result;
  }

  sortPapersByMonth(papers: Paper[]): Paper[] {
    return papers.sort((a, b)=> {
      return this.getMonthNum(b.month) - this.getMonthNum(a.month)
    })
  }

  getMonthNum(mon?: string): number {
    if(!mon){
      return -1;
    }
    const splitIdx = mon.indexOf("-");
    if(splitIdx == -1) {
      return month2Num[mon];
    }
    else {
      return month2Num[mon.substring(0, splitIdx)];
    }
  }

  filterPapers(papers: Paper[], filters:any): Paper[] {
    const { authors, years, searchStr } = filters;
    const searchRex = new RegExp(searchStr, "i")
    return papers.filter(paper=>{
      if(authors && !authorExistInPaper(paper, authors)){
        return false;
      }

      if(years && paper.year != years){
        return false;
      }

      if(searchStr) {
        if(!paper.name.match(searchRex) && !paper.publicAt?.match(searchRex)){
          return false
        }
      }
      
      

      return true;
    });
  }


  initFiltersForm(fb: FormBuilder):FormGroup{
    return fb.group({
      authors: [],
      years: [],
      searchStr: []
    });
  }

  restoreFilters(){
    this.filtersForm.setValue({authors:"", years:""})
  }

  

}
