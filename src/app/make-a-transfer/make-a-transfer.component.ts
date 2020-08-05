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

  transactionForm: TransactionFormGroup;

  constructor (
    private formBuilder: FormBuilder,
    private transactionsService: TransactionsService,
  ) {
    this.transactionForm = groupTransactionForm(formBuilder, {
      from: '', to: null, amount: null,
    });
  }

  private toDefaultState(): TransactionControlsConfig {
    return {
      from: toAccountLabel(this.fromAccount),
      to: null,
      amount: null,
    };
  }

  ngOnInit(): void {
    this.transactionForm = groupTransactionForm(this.formBuilder, this.toDefaultState());
  }

  ngOnChanges(): void {
    this.transactionForm.reset(this.toDefaultState());
  }

  onSubmit = (transactionForm: TransactionControlsConfig) => {
    const { fromAccount, transactionsService } = this;
    const { to, amount } = transactionForm;

    if (to === null || to.length <= 0 || amount === null || amount <= 0) {
      console.log('Invalid transaction.');
      return;
    }

    console.log(`${formatDollars(amount)} from ${fromAccount.accountName} to ${to}.`);

    transactionsService.addNewTransaction(fromAccount.accountId, to, amount)
      .subscribe(justToForceIt => {
        console.log(justToForceIt);
      });
  }
}

interface TransactionControlsConfig {
  readonly from: string;
  readonly to: string | null;
  readonly amount: Dollars | null;
}
type TransactionFormGroup =
  & Omit<FormGroup, 'value'>
  & { value: TransactionControlsConfig };
function groupTransactionForm(
  formBuilder: FormBuilder,
  { from, ...rest }: TransactionControlsConfig,
): TransactionFormGroup {
  return formBuilder.group({
    ...rest,
    from: { value: from, disabled: true },
  });
}

const toAccountLabel = (account: UserAccount): string => {
  const { accountName, accountId, availableFunds } = account;
  const amount = formatDollars(availableFunds);
  return `${accountName}(${accountId}) – ${amount}`;
};
