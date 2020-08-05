import { Component, OnInit } from '@angular/core';
import { TransactionsService } from '../transactions.service';
import { Transaction, TransactionFormatted } from '../../shared/transactions';
import { Sorting, SortableColumn, sortingColumns } from '../../shared/sorting';
import { Dollars, Milliseconds } from '../../shared/brands';

@Component({
  selector: 'ptb-recent-transactions',
  templateUrl: './recent-transactions.component.html',
  styleUrls: ['./recent-transactions.component.css'],
})
export class RecentTransactionsComponent implements OnInit {

  columns = sortingColumns;

  transactions: TransactionFormatted[] = [];
  sorting: Sorting = { column: 'date', direction: 'descending' };

  toSortingClasses = (col: SortableColumn) =>
    this.sorting.column === col ? [this.sorting.direction] : []

  constructor (
    private transactionsService: TransactionsService,
  ) { }

  private updateTransactions = (): void => {
    const { transactionsService, sorting, takeTransactions } = this;

    transactionsService.getTransactions(sorting)
      .subscribe(takeTransactions);
  }

  private takeTransactions = (transactions: Transaction[]): void => {
    this.transactions = formatTransactions(transactions);
  }

  ngOnInit(): void {
    this.updateTransactions();
  }

  onSortBy = (column: SortableColumn) => {
    const { sorting: { direction } } = this;
    if (this.sorting.column === column) {
      this.sorting = {
        column,
        direction: direction === 'ascending' ? 'descending' : 'ascending',
      };
    }
    else {
      this.sorting = { column, direction };
    }
    this.updateTransactions();
  }
}

function formatTransactions(transactions: Transaction[]): TransactionFormatted[] {
  return transactions.map(
    ({ amount, transactionDate, ...rest }) => ({
      ...rest,
      amount: formatDollars(amount),
      transactionDate: formatMilliseconds(transactionDate),
    }),
  );
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
