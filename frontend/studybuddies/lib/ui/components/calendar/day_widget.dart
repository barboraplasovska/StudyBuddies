import 'package:flutter/material.dart';
import 'package:calendar_view/calendar_view.dart';
import 'package:intl/intl.dart';

class DayWidget extends StatelessWidget {
  final DateTime selectedDate;
  final VoidCallback onBack;
  final Function(List<CalendarEventData<Object?>> event, DateTime date,
      BuildContext context) onEventTap;

  const DayWidget({
    super.key,
    required this.selectedDate,
    required this.onBack,
    required this.onEventTap,
  });

  @override
  Widget build(BuildContext context) {
    DateTime now = DateTime.now();

    int hour = now.hour - 1 > 0 ? now.hour - 1 : 0;

    return DayView(
      initialDay: selectedDate,
      startDuration: Duration(hours: hour),
      showHalfHours: true,
      heightPerMinute: 2,
      timeLineBuilder: _timeLineBuilder,
      hourIndicatorSettings: HourIndicatorSettings(
        color: Theme.of(context).dividerColor,
      ),
      onEventTap: (events, date) => onEventTap(events, date, context),
      halfHourIndicatorSettings: HourIndicatorSettings(
        color: Theme.of(context).dividerColor,
        lineStyle: LineStyle.dashed,
      ),
      verticalLineOffset: 0,
      timeLineWidth: 65,
      showLiveTimeLineInAllDays: true,
      liveTimeIndicatorSettings: LiveTimeIndicatorSettings(
        color: Theme.of(context).colorScheme.primary,
        showBullet: true,
        showTime: true,
        showTimeBackgroundView: true,
        timeBackgroundViewWidth: 58,
        timeStringBuilder: (date, {secondaryDate}) {
          return DateFormat('  HH:mm').format(date);
        },
      ),
      dateStringBuilder: (date, {secondaryDate}) {
        return DateFormat('d MMMM y').format(date);
      },
      headerStyle: HeaderStyle(
        decoration: BoxDecoration(
          border: const Border(
            top: BorderSide(
              color: Colors.white,
            ),
          ),
          color: Theme.of(context).colorScheme.primary,
        ),
        headerTextStyle: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
        leftIcon: const Icon(
          Icons.arrow_back_ios,
          size: 20,
          color: Colors.white,
        ),
        rightIcon: const Icon(
          Icons.arrow_forward_ios,
          size: 20,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _timeLineBuilder(DateTime date) {
    String timeString =
        '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';

    if (date.minute != 0) {
      return Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned.fill(
            top: -8,
            right: 8,
            child: Text(
              timeString,
              textAlign: TextAlign.right,
              style: const TextStyle(
                color: Colors.black,
                fontSize: 12,
              ),
            ),
          ),
        ],
      );
    }

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Positioned.fill(
          top: -8,
          right: 8,
          child: Text(
            timeString,
            textAlign: TextAlign.right,
            style: const TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ),
      ],
    );
  }
}
