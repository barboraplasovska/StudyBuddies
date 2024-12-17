import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/ui/pages/events/edit_event_page.dart';

class EventDetailAppBar extends StatelessWidget implements PreferredSizeWidget {
  final EventModel event;
  final Function() onEditEvent;
  final Function() onExportEvent;

  const EventDetailAppBar({
    super.key,
    required this.event,
    required this.onEditEvent,
    required this.onExportEvent,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Theme.of(context).colorScheme.primary,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => Navigator.pop(context),
      ),
      actions: <Widget>[
        IconButton(
            onPressed: onExportEvent,
            icon: const Icon(
              Icons.download,
              color: Colors.white,
            )),
        IconButton(
          icon: const Icon(Icons.edit, color: Colors.white),
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => EditEventPage(event: event),
            ),
          ).then((value) => onEditEvent()),
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
