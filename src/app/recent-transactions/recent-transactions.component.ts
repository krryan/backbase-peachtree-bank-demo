import { Component, OnInit } from '@angular/core';
import { TransactionsService } from '../transactions.service';
import { TransactionFormatted } from '../../shared/transactions';
import { Sorting, SortableColumn } from '../../shared/sorting';
import { Dollars, Milliseconds } from '../../shared/brands';

@Component({
  selector: 'ptb-recent-transactions',
  templateUrl: './recent-transactions.component.html',
  styleUrls: ['./recent-transactions.component.css'],
})
export class RecentTransactionsComponent implements OnInit {

  transactions: TransactionFormatted[] = [];
  sorting: Sorting = { column: 'date', direction: 'descending' };
  toSortingClasses = (col: SortableColumn) =>
    this.sorting.column === col ? [this.sorting.direction] : [];

  constructor (
    private transactionsService: TransactionsService,
  ) { }

  ngOnInit(): void {
    this.transactionsService.getTransactions()
      .subscribe(transactions => {
        this.transactions = transactions.map(
          ({ amount, transactionDate, ...rest }) => ({
            ...rest,
            amount: formatDollars(amount),
            transactionDate: formatMilliseconds(transactionDate),
          }),
        );
      });
  }

}

function formatDollars(amount: Dollars): string {
  return (amount > 0 ? '-' : '') + '$' + Math.abs(amount).toFixed(2);
}

const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});
function formatMilliseconds(ms: Milliseconds): string {
  const date = new Date(ms);
  return dateFormat.format(date);
}
