import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, combineLatest, empty, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { authorExistInPaper, getAuthorsInStringArr, Paper } from '../paper/paper';

@Component({
  selector: 'app-paper-list',
  templateUrl: './paper-list.component.html',
  styleUrls: ['./paper-list.component.scss']
})
export class PaperListComponent implements OnInit, OnChanges {

  @Input()
  papers!: Paper[];

  filtersForm!: FormGroup;
  allPapers!: BehaviorSubject<Paper[]>;
  filteredPapers!: Observable<Paper[]>;
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
    this.filteredPapers = combineLatest([this.allPapers,this.filtersForm.valueChanges.pipe(startWith({})) ])
    .pipe(
      map(([papers, filters])=>{
        return this.filterPapers(papers, filters)
      })
    );
  

  }

  filterPapers(papers: Paper[], filters:any): Paper[] {
    const { authors, years } = filters;
    return papers.filter(paper=>{
      if(authors && !authorExistInPaper(paper, authors)){
        return false;
      }

      if(years && paper.year != years){
        return false;
      }

      return true;
    });
  }


  initFiltersForm(fb: FormBuilder):FormGroup{
    return fb.group({
      authors: [],
      years: []
    });
  }

  restoreFilters(){
    this.filtersForm.setValue({authors:"", years:""})
  }

  

}
