import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:calendar_view/calendar_view.dart';

class MonthWidget extends StatelessWidget {
  final Function(DateTime) onCellTap;
  final Function(List<CalendarEventData<Object?>> event, DateTime date,
      BuildContext context) onEventTap;

  const MonthWidget({
    super.key,
    required this.onCellTap,
    required this.onEventTap,
  });

  @override
  Widget build(BuildContext context) {
    return MonthView(
      headerStringBuilder: (date, {secondaryDate}) =>
          DateFormat.yMMMM().format(date),
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
      cellBuilder: (date, event, isToday, isInMonth, hideDaysNotInMonth) {
        if (hideDaysNotInMonth) {
          return FilledCell(
            highlightColor: Theme.of(context).colorScheme.primary,
            date: date,
            shouldHighlight: isToday,
            backgroundColor: isInMonth ? Colors.white : const Color(0xfff0f0f0),
            events: event,
            isInMonth: isInMonth,
            onTileTap: (event, date) => onEventTap([event], date, context),
            hideDaysNotInMonth: hideDaysNotInMonth,
          );
        }
        return FilledCell(
          highlightColor: Theme.of(context).colorScheme.primary,
          date: date,
          shouldHighlight: isToday,
          backgroundColor: isInMonth ? Colors.white : const Color(0xfff0f0f0),
          events: event,
          onTileTap: (event, date) => onEventTap([event], date, context),
          hideDaysNotInMonth: hideDaysNotInMonth,
        );
      },
      hideDaysNotInMonth: false,
      cellAspectRatio: getCellAspectRatio(
        MediaQuery.of(context).size.width,
        MediaQuery.of(context).size.height,
      ),
      onCellTap: (events, date) {
        onCellTap(date);
      },
    );
  }

  double getCellAspectRatio(double screenWidth, double screenHeight) {
    const double appBarHeight = kToolbarHeight;
    const double headerHeight = 190;
    const double bottomNavHeight = 80;

    final double availableHeight =
        screenHeight - appBarHeight - headerHeight - bottomNavHeight;

    final double cellWidth = screenWidth / 7;
    final double cellHeight = availableHeight / 6;

    return cellWidth / cellHeight;
  }
}
