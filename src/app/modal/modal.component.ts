import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Message } from '../../shared/message';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalService } from '../modal.service';

@Component({
  selector: 'ptb-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit, AfterViewInit {

  @Input()
  message: Message;

  @ViewChild('modalSubmit')
  submit: ElementRef;

  messageForm: FormGroup;

  constructor (
    private formBuilder: FormBuilder,
    private modalService: ModalService,
  ) {
    this.messageForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const submit = this.submit.nativeElement as HTMLButtonElement;
    submit.focus();
  }

  hide(userConfirmed: boolean): void {
    this.modalService.hide(userConfirmed);
  }

}
