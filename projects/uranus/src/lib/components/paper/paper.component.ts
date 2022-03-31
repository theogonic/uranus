import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Author, Paper } from './paper';

export type PaperMode = "simple" | "card";

@Component({
  selector: 'uranus-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaperComponent implements OnInit {

  @Input()
  paper!: Paper;

  @Input()
  mode: PaperMode = "card";

  abstractOpen = false

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openInNewTab(link: string){
    window.open(link);
  }

  clickAuthor(author: Author) {
    if(author.link)
    window.open(author.link);
  }
  showAbstract(){
    this.dialog.open(PaperAbstractDialog, { data: this.paper })
  }

  showBibtex(){
    this.dialog.open(PaperBibtexDialog, { data: this.paper })
  }
}


@Component({
  selector: 'paper-abstract-dialog',
  template: `
    <h2 mat-dialog-title>Abstract</h2>
    <mat-dialog-content>{{data.abstract}}</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
`,
})
export class PaperAbstractDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Paper) { }
}

@Component({
  selector: 'paper-bibtex-dialog',
  template: `
    <h2 mat-dialog-title>BibTex</h2>
    <mat-dialog-content>{{data.bibtex}}</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
`,
})
export class PaperBibtexDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Paper) { }
}