import { Injectable } from '@angular/core';
import { Message } from '../shared/message';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  message?: Message;

  userChoice?: Subject<boolean>;

  show(message: Message): Observable<boolean> {
    if (this.userChoice !== undefined) {
      this.userChoice.next(false);
      this.userChoice.unsubscribe();
    }
    this.message = message;
    this.userChoice = new Subject();
    return this.userChoice;
  }

  hide(userConfirmed: boolean): void {
    this.message = undefined;
    if (this.userChoice !== undefined) {
      this.userChoice.next(userConfirmed);
      this.userChoice.unsubscribe();
      this.userChoice = undefined;
    }
  }
}
