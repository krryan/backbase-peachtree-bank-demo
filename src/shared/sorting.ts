export type SortableColumn = 'date' | 'beneficiary' | 'amount';

export type SortingDirection = 'ascending' | 'descending';

export interface Sorting {
    column: SortableColumn;
    direction: SortingDirection;
}
