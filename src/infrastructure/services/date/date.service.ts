import { Injectable } from '@nestjs/common';
import { toDate, fromZonedTime } from 'date-fns-tz';

@Injectable()
export class DateService {
  dtoToDate(dateISO: string | Date): Date {
    return toDate(dateISO, { timeZone: process.env.TZ });
  }

  now() {
    return fromZonedTime(new Date(), process.env.TZ);
  }
}
