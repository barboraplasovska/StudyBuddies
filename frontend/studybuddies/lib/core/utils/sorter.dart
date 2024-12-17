import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/models/group_model.dart';

void sortEvents(List<EventModel> events, String sortBy) {
  if (sortBy == 'Alphabetically') {
    events.sort((a, b) => a.name.compareTo(b.name));
  } else if (sortBy == 'Event date') {
    events.sort((a, b) => a.date.compareTo(b.date));
  } else if (sortBy == 'Popularity') {
    events
        .sort((a, b) => (a.users?.length ?? 0).compareTo(b.users?.length ?? 0));
  }
}

void sortGroups(List<GroupModel> groups, String sortBy) {
  if (sortBy == 'Alphabetically') {
    groups.sort((a, b) => a.name.compareTo(b.name));
  } else if (sortBy == 'Popularity') {
    groups.sort((a, b) => (a.users.length).compareTo(b.users.length));
  }
}
