export const sortingColumns = ['date', 'beneficiary', 'amount'] as const;
export type SortableColumn = typeof sortingColumns[number];

export type SortingDirection = 'ascending' | 'descending';

export interface Sorting {
    column: SortableColumn;
    direction: SortingDirection;
}
