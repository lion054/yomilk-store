import {Component, Input} from '@angular/core';


@Component({
  selector: 'app-weekend-notice',
  standalone: true,
  imports: [],
  templateUrl: './weekend-notice.component.html',
  styleUrl: './weekend-notice.component.css'
})
export class WeekendNoticeComponent {

  @Input() isHeader: boolean = false;

  shouldShowWeekendNotice(): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentHour = now.getHours();

    // Show from Friday 5 PM (17:00) through Sunday (all day)
    if (dayOfWeek === 5 && currentHour >= 17) {
      // Friday after 5 PM
      return true;
    } else if (dayOfWeek === 6 || dayOfWeek === 0) {
      // Saturday (6) or Sunday (0) - all day
      return true;
    }

    return false;
  }
}
