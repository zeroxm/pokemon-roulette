import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService, AuthUser } from '../../services/auth-service/auth.service';

/**
 * Who is signed in, and the way to the account screen.
 *
 * One line, shown wherever a player might wonder where their collection is
 * going — above the team, and on the settings screen the account used to
 * live on. It is the same component in both places so the answer cannot
 * differ between them.
 *
 * **It says nothing until the question has been answered.** Rendering "not
 * signed in" during the first request would flicker for anyone who is.
 */
@Component({
  selector: 'app-account-status',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './account-status.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './account-status.component.css',
})
export class AccountStatusComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthService) {}

  user: AuthUser | null = null;
  checked = false;

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(this.authService.user$.subscribe(user => (this.user = user)));
    this.subscriptions.add(this.authService.checked$.subscribe(checked => (this.checked = checked)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
