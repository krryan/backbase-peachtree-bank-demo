import { Component, OnInit, Input } from '@angular/core';
import { TransactionsService } from '../transactions.service';
import { TransactionFormatted, formatTransactions } from '../../shared/transactions';
import { Sorting, SortableColumn, sortingColumns } from '../../shared/sorting';
import { AccountId, Milliseconds } from '../../shared/brands';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'ptb-recent-transactions',
  templateUrl: './recent-transactions.component.html',
  styleUrls: ['./recent-transactions.component.css'],
})
export class RecentTransactionsComponent implements OnInit {

  @Input()
  accountId: AccountId;

  columns = sortingColumns;

  transactions$ = new Observable<TransactionFormatted[]>();
  filtering?: string;
  private filterPattern$ = new BehaviorSubject<string | undefined>(this.filtering);
  sorting: Sorting = { column: 'date', direction: 'descending' };

  toSortingClasses = (col: SortableColumn) =>
    this.sorting.column === col ? [this.sorting.direction] : []

  constructor (
    private transactionsService: TransactionsService,
  ) { }

  updateTransactions = (): void => {
    const { filtering } = this;
    this.filterPattern$.next(filtering);
  }

  ngOnInit(): void {
    this.transactions$ = this.filterPattern$
      .pipe(
        debounceTime(200 as Milliseconds),
        distinctUntilChanged(),
        switchMap(filtering =>
          this.transactionsService.getTransactions(
            this.accountId, this.sorting, filtering,
          ),
        ),
        map(formatTransactions),
      );
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

  onClearFiltering = () => {
    this.filtering = undefined;
    this.updateTransactions();
  }
}
