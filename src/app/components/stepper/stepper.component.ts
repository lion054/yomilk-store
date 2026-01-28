import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css'
})
export class StepperComponent {
  @Input() step = 1

  @Output() stepChange: EventEmitter<any> = new EventEmitter()


  goToStep(step: number) {
    this.stepChange.emit(step)
  }
}
