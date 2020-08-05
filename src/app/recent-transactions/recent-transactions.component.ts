import { Component, OnInit } from '@angular/core';
import { TransactionsService } from '../transactions.service';
import { Transaction, TransactionFormatted, formatTransactions } from '../../shared/transactions';
import { Sorting, SortableColumn, sortingColumns } from '../../shared/sorting';

@Component({
  selector: 'ptb-recent-transactions',
  templateUrl: './recent-transactions.component.html',
  styleUrls: ['./recent-transactions.component.css'],
})
export class RecentTransactionsComponent implements OnInit {

  columns = sortingColumns;

  transactions: TransactionFormatted[] = [];
  filtering?: string;
  sorting: Sorting = { column: 'date', direction: 'descending' };

  toSortingClasses = (col: SortableColumn) =>
    this.sorting.column === col ? [this.sorting.direction] : []

  constructor (
    private transactionsService: TransactionsService,
  ) { }

  updateTransactions = (): void => {
    const { transactionsService, sorting, filtering, takeTransactions } = this;

    transactionsService.getTransactions(sorting, filtering)
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
