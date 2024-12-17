import 'package:calendar_view/calendar_view.dart';
import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/models/exam_model.dart';
import 'package:studybuddies/ui/components/calendar/day_widget.dart';
import 'package:studybuddies/ui/components/calendar/month_widget.dart';
import 'package:studybuddies/ui/pages/events/event_detail_page.dart';
import 'package:studybuddies/ui/pages/exams/exam_detail_page.dart';

class CalendarView extends StatefulWidget {
  final int myUserId;
  final bool isDayView;
  final DateTime selectedDate;
  final Function(DateTime) onDateSelected;
  final VoidCallback onBackToMonthView;
  final Function() updateCalendar;

  const CalendarView({
    super.key,
    required this.myUserId,
    required this.isDayView,
    required this.selectedDate,
    required this.onDateSelected,
    required this.onBackToMonthView,
    required this.updateCalendar,
  });

  @override
  State<CalendarView> createState() => _CalendarViewState();
}

class _CalendarViewState extends State<CalendarView> {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    widget.updateCalendar();
  }

  void onEventTap(List<CalendarEventData<Object?>> events, DateTime date,
      BuildContext context) {
    var event = events.first;
    if (event.event is ExamModel) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ExamDetailPage(
            exam: event.event as ExamModel,
          ),
        ),
      );
    }
    if (event.event is EventModel) {
      EventModel eventModel = event.event as EventModel;
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => EventDetailPage(
            event: eventModel,
            myUserId: widget.myUserId,
          ),
        ),
      ).then(
        (value) => widget.updateCalendar(),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return widget.isDayView
        ? DayWidget(
            selectedDate: widget.selectedDate,
            onBack: widget.onBackToMonthView,
            onEventTap: onEventTap,
          )
        : MonthWidget(
            onCellTap: widget.onDateSelected,
            onEventTap: onEventTap,
          );
  }
}
