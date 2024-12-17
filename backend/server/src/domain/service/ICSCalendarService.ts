import {EventModel} from "database/model/EventModel";
import ical, {ICalCalendar, ICalCalendarMethod} from "ical-generator";

class ICSCalendarService {

    private convertToUTCMinus1 = (date: Date): Date => {
        const utcDate = new Date(date.toISOString());
        utcDate.setHours(utcDate.getUTCHours() - 1);
        return utcDate;
    };

    generateCalendar = (event: EventModel) : ICalCalendar => {
        const calendar = ical({name: "StudyBuddies Event"});
        calendar.method(ICalCalendarMethod.REQUEST);

        const startTime = this.convertToUTCMinus1(new Date(event.date!));
        const endTime = this.convertToUTCMinus1(new Date(event.endtime!));

        calendar.createEvent({
            start: startTime,
            end: endTime,
            summary: event.name,
            description: event.description,
            location: event.location,
            url: event.link
        });

        return calendar;
    };
}

const icsCalendarService = new ICSCalendarService();

export {
    ICSCalendarService,
    icsCalendarService
};