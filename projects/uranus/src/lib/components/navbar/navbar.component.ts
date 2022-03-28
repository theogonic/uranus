import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { NavbarItem } from './navbar-item';

@Component({
  selector: 'uranus-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {

  @Input()
  items!: NavbarItem[];

  @Input()
  title!: string;

  isDesktop!: Observable<boolean>;

  constructor(private bo: BreakpointObserver) { }

  ngOnInit(): void {
    this.isDesktop = this.bo.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(
      map(result=>!result.matches)
    )

  }

}
