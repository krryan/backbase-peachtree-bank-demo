import { Component, OnInit, Input } from '@angular/core';
import { UserAccount } from '../../shared/user-account';
import { formatDollars } from '../../shared/transactions';

@Component({
  selector: 'ptb-make-a-transfer',
  templateUrl: './make-a-transfer.component.html',
  styleUrls: ['./make-a-transfer.component.css'],
})
export class MakeATransferComponent implements OnInit {

  @Input()
  fromAccount: UserAccount;

  toFromAccountLabel = () => {
    const {
      fromAccount: { accountName, accountId, availableFunds },
    } = this;
    const amount = formatDollars(availableFunds);
    return `${accountName}(${accountId}) – ${amount}`;
  }

  constructor () { }

  ngOnInit(): void {
  }

}
