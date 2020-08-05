import { Component, OnInit } from '@angular/core';
import { UserAccountService } from './user-account.service';
import { UserAccount } from '../shared/user-account';
import { ModalService } from './modal.service';

@Component({
  selector: 'ptb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'backbase-peachtree-bank-demo';

  account?: UserAccount;

  constructor (
    private userAccountService: UserAccountService,
    public modalService: ModalService,
  ) { }

  ngOnInit(): void {
    this.userAccountService.getUserAccount()
      .subscribe(userAccount => {
        this.account = userAccount;
      });
  }
}
