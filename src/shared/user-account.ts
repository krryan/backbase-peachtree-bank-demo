import { AccountId, Dollars } from './brands';

export const userAccountApiUrlExt = 'user';

export interface UserAccount {
  accountName: string;
  accountId: AccountId;
  availableFunds: Dollars;
}
