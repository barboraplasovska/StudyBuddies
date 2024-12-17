import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:studybuddies/ui/components/dropdowns/sb_dropdown_menu.dart';
import 'package:studybuddies/ui/components/dropdowns/sb_help_dropdown.dart';
import 'package:studybuddies/ui/pages/events/new_event_page.dart';
import 'package:studybuddies/ui/pages/exams/new_exam_page.dart';

class CalendarAppBar extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback onDateTap;
  final bool isDayView;
  final Function() updateCalendar;

  const CalendarAppBar({
    super.key,
    required this.onDateTap,
    required this.isDayView,
    required this.updateCalendar,
  });

  @override
  Widget build(BuildContext context) {
    final String todayDate = DateFormat('EEEE d MMM').format(DateTime.now());

    return AppBar(
      backgroundColor: Theme.of(context).colorScheme.primary,
      automaticallyImplyLeading: false,
      title: GestureDetector(
        onTap: onDateTap,
        child: Row(
          children: [
            isDayView
                ? const Icon(
                    Icons.arrow_back_ios,
                    color: Colors.white,
                    size: 20,
                  )
                : Container(),
            Text(todayDate)
          ],
        ),
      ),
      titleTextStyle: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: Colors.white,
      ),
      centerTitle: false,
      actions: [
        SBHelpDropdown(),
        SBDropdownMenu(
          icon: const Icon(
            Icons.add_circle_outline,
            color: Colors.white,
          ),
          width: 120,
          items: {
            'Add exam': () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const NewExamPage(),
                ),
              ).then((value) => updateCalendar());
            },
            'Create event': () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const NewEventPage(),
                ),
              ).then((value) => updateCalendar());
            },
          },
        ),
      ],
      elevation: 0,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
