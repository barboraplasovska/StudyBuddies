import 'package:intl/intl.dart';

class EventFilterModel {
  String sortBy;
  bool yourGroupsOnly;
  DateTime? date;
  String? time;

  EventFilterModel({
    this.sortBy = 'Alphabetically',
    this.yourGroupsOnly = false,
    this.date,
    this.time = 'Any time',
  });

  void updateFilter(
      {String? newSortBy,
      DateTime? newDate,
      String? newTime,
      bool? newYourGroupsOnly}) {
    if (newSortBy != null) sortBy = newSortBy;
    date = newDate;
    if (newTime != null) time = newTime;
    if (newYourGroupsOnly != null) yourGroupsOnly = newYourGroupsOnly;
  }

  Uri buildUrl(String baseUrl) {
    final queryParameters = <String, String>{};

    if (date != null) {
      queryParameters['day'] = DateFormat('yyyy-MM-dd').format(date!);
    }

    if (time != null && time!.isNotEmpty && time != "Any time") {
      queryParameters['time'] = time!.toLowerCase();
    }

    if (yourGroupsOnly) {
      queryParameters['my'] = 'true';
    }

    var url = Uri.parse(baseUrl);
    if (queryParameters.isNotEmpty) {
      url = url.replace(queryParameters: queryParameters);
    }

    return url;
  }
}
