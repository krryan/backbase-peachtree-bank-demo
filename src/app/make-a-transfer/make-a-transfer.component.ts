import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { UserAccount } from '../../shared/user-account';
import { formatDollars } from '../../shared/transactions';
import { Dollars } from '../../shared/brands';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TransactionsService } from '../transactions.service';

@Component({
  selector: 'ptb-make-a-transfer',
  templateUrl: './make-a-transfer.component.html',
  styleUrls: ['./make-a-transfer.component.css'],
})
export class MakeATransferComponent implements OnInit, OnChanges {

  @Input()
  readonly fromAccount: UserAccount;

  transactionForm: FormGroup;

  constructor (
    private formBuilder: FormBuilder,
    private transactionsService: TransactionsService,
  ) {
    this.transactionForm = formBuilder.group({
      from: { value: '', disabled: true }, to: null, amount: null,
    });
  }

  ngOnInit(): void {
    this.transactionForm = this.formBuilder.group({
      ...this.transactionForm.value,
      from: toFromAccountControl(this.fromAccount),
    });
  }

  ngOnChanges(): void {
    this.transactionForm.reset({
      ...this.transactionForm.value,
      from: toFromAccountControl(this.fromAccount),
    });
  }

  onSubmit = (transactionForm: TransactionControlsConfig) => {
    const { fromAccount, transactionsService } = this;
    const { to, amount } = transactionForm;

    transactionsService.addNewTransaction(fromAccount.accountId, to, amount)
      .subscribe(wentThroughWithIt => {
        if (wentThroughWithIt) {
          this.transactionForm.reset({
            from: toFromAccountControl(this.fromAccount),
            to: null, amount: null,
          });
        }
      });
  }
}

interface TransactionControlsConfig {
  readonly from: { value: string, disabled: true };
  readonly to: string | null;
  readonly amount: Dollars | null;
}

function toFromAccountControl(
  from: UserAccount,
): TransactionControlsConfig['from'] {
  return { value: toAccountLabel(from), disabled: true };
}

const toAccountLabel = (account: UserAccount): string => {
  const { accountName, accountId, availableFunds } = account;
  const amount = formatDollars(availableFunds);
  return `${accountName}(${accountId}) – ${amount}`;
};
