import { Component, OnInit, Input } from '@angular/core';
import { UserAccount } from '../../shared/user-account';
import { formatDollars } from '../../shared/transactions';
import { Dollars } from '../../shared/brands';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'ptb-make-a-transfer',
  templateUrl: './make-a-transfer.component.html',
  styleUrls: ['./make-a-transfer.component.css'],
})
export class MakeATransferComponent implements OnInit {

  @Input()
  readonly fromAccount: UserAccount;

  initialState: TransactionControlsConfig;
  transactionForm: TransactionFormGroup;

  constructor (
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.initialState = {
      from: toAccountLabel(this.fromAccount),
      to: null,
      amount: null,
    };
    this.transactionForm = groupTransactionForm(this.formBuilder, this.initialState);
  }

  onSubmit = (transactionForm: TransactionControlsConfig) => {
    const { fromAccount } = this;
    const { to, amount } = transactionForm;

    if (to === null || amount === null || amount <= 0) {
      console.log('Invalid transaction.');
      return;
    }

    console.log(`${formatDollars(amount)} from ${fromAccount.accountName} to ${to}.`);

    this.transactionForm.reset(this.initialState);
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
