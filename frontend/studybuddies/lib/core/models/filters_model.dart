import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/event_filter_model.dart';
import 'package:studybuddies/core/models/group_filter_model.dart';

class FiltersModel extends ChangeNotifier {
  EventFilterModel eventFilter = EventFilterModel();
  GroupFilterModel groupFilter = GroupFilterModel();

  void updateEventFilter({
    required String newSortBy,
    required DateTime? newDate,
    required String? newTime,
    required bool newYourGroupsOnly,
  }) {
    eventFilter.updateFilter(
      newSortBy: newSortBy,
      newDate: newDate,
      newTime: newTime,
      newYourGroupsOnly: newYourGroupsOnly,
    );
    notifyListeners();
  }

  void updateGroupFilter({
    required String newSortBy,
    int? newSchoolId,
  }) {
    groupFilter.updateFilter(
      newSortBy: newSortBy,
      newSchoolId: newSchoolId,
    );
    notifyListeners();
  }
}
