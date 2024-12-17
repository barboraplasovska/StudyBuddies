import 'package:studybuddies/core/models/event_model.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';

/// Launches the URL in the browser
Future<void> launchURL(String stringUrl) async {
  if (!stringUrl.startsWith('http://') && !stringUrl.startsWith('https://')) {
    stringUrl = 'https://$stringUrl';
  }
  final url = Uri.parse(stringUrl);
  if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
    throw Exception("Could not launch $stringUrl");
  }
}

/// Returns string value of the enum
String getEnumValue(EventType type) {
  switch (type) {
    case EventType.physical:
      return "Physical";
    case EventType.online:
      return "Online";
    case EventType.hybrid:
      return "Hybrid";
  }
}

/// Formats the event date and time to a readable string
/// ex. Today 12:00
String formatDateTimeText(String dateString) {
  DateTime dateTime = DateTime.parse(dateString);
  String eventDateTimeString = formatDateText(dateString, showYear: false);

  String timeString =
      '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';

  return '$eventDateTimeString $timeString';
}

String formatLocationText(EventModel event) {
  switch (event.getType()) {
    case EventType.online:
      return event.link ?? "no link";
    case EventType.hybrid:
    case EventType.physical:
      return event.address ?? "no address";
  }
}

String formatDateText(String dateString, {bool showYear = true}) {
  DateTime dateTime = DateTime.parse(dateString);
  DateTime now = DateTime.now();
  DateTime tomorrow = DateTime(now.year, now.month, now.day + 1);

  if (dateTime.year == now.year &&
      dateTime.month == now.month &&
      dateTime.day == now.day) {
    return 'Today';
  } else if (dateTime.year == tomorrow.year &&
      dateTime.month == tomorrow.month &&
      dateTime.day == tomorrow.day) {
    return 'Tomorrow';
  } else {
    if (showYear) {
      return DateFormat('EEEE d MMMM y').format(dateTime);
    }
    return DateFormat('EEEE d MMM').format(dateTime);
  }
}

String formatExamDateText(String dateString) {
  String temp = formatDateTimeText(dateString);

  if (temp.contains('Today') || temp.contains('Tomorrow')) {
    return temp;
  } else {
    List<String> parts = temp.split(" ");
    String day = parts[1];
    String month = parts[2];
    String year = parts[3];
    String time = parts[4];

    Map<String, int> monthMapping = {
      "January": 1,
      "February": 2,
      "March": 3,
      "April": 4,
      "May": 5,
      "June": 6,
      "July": 7,
      "August": 8,
      "September": 9,
      "October": 10,
      "November": 11,
      "December": 12,
    };

    if (!monthMapping.containsKey(month)) {
      throw FormatException("Le mois est invalide");
    }
    int monthNumber = monthMapping[month]!;

    return "$day/$monthNumber/$year $time";
  }
}

String convertDateFormat(String inputDate, String startTime) {
  List<String> dateParts = inputDate.split('/');
  if (dateParts.length != 3) {
    throw FormatException('Invalid date format');
  }

  // Convert date parts to the desired format
  String formattedDate = '${dateParts[2]}-${dateParts[1]}-${dateParts[0]}';

  // Convert startTime to 24-hour format
  String formattedTime = _convertTo24HourFormat(startTime);

  // Append the start time to the date
  formattedDate += 'T$formattedTime:00';
  return formattedDate;
}

String truncateText(String text, {int maxLength = 45}) {
  if (text.length > maxLength) {
    return '${text.substring(0, maxLength)}...';
  }
  return text;
}

String _convertTo24HourFormat(String timeString) {
  try {
    // Try parsing the string as a 24-hour time format
    DateFormat format24 = DateFormat.Hm(); // HH:mm
    DateTime dateTime = format24.parse(timeString);
    return format24.format(dateTime);
  } catch (e) {
    try {
      // If it fails, try parsing it as a 12-hour time format
      DateFormat format12 = DateFormat.jm(); // h:mm a
      DateTime dateTime = format12.parse(timeString);
      DateFormat format24 = DateFormat.Hm(); // HH:mm
      return format24.format(dateTime);
    } catch (e) {
      // If parsing fails, return an error message or handle it as needed
      throw FormatException('Invalid time format');
    }
  }
}

String formatErrorBody(String errorBody) {
  if (errorBody.contains('"error":')) {
    int startIndex = errorBody.indexOf('"error":"') + 9;
    int endIndex = errorBody.indexOf('"}', startIndex);
    return errorBody.substring(startIndex, endIndex);
  } else {
    return errorBody;
  }
}
