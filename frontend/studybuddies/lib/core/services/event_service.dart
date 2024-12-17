import 'dart:convert';
import 'package:calendar_view/calendar_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:studybuddies/core/models/event_filter_model.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/models/event_waiting_list_user_model.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/core/services/user_service.dart';
import 'package:http/http.dart' as http;
import 'package:studybuddies/core/utils/sorter.dart';
import 'package:studybuddies/core/utils/utils.dart';

class EventService {
  final UserService _userService = UserService();
  final String baseUrl = dotenv.env['API_BASE_URL'] ?? "";
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  Future<int?> getUserId() async {
    String? userId = await storage.read(key: "userId");
    return userId != null && userId != "null" ? int.parse(userId) : null;
  }

  Future<Map<String, String>> _getHeaders() async {
    final sessionId = await storage.read(key: 'sessionId');
    final jwt = await storage.read(key: 'jwt');

    if (sessionId == null) {
      throw Exception('Session ID not found. User might not be logged in.');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $jwt',
      'sessionId': sessionId,
    };
  }

  Future<EventModel> createEvent(EventModel event) async {
    final url = Uri.parse('$baseUrl/group/event');

    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    final body = jsonEncode(event.toJson());

    final response = await http.post(
      url,
      headers: headers,
      body: body,
    );

    if (response.statusCode == 201) {
      return EventModel.fromJson(jsonDecode(response.body));
    } else {
      throw Exception(
          'Failed to create event: ${response.statusCode} - ${formatErrorBody(response.body)}');
    }
  }

  Future<void> updateEvent(int id, Map<String, dynamic> updateData) async {
    final url = Uri.parse('$baseUrl/group/event/$id');
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    final response = await http.put(
      url,
      headers: headers,
      body: jsonEncode(updateData),
    );

    if (response.statusCode == 200) {
      // Successfully updated the event
      return;
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      throw Exception('Bad Request: ${error['error']}');
    } else if (response.statusCode == 401) {
      final error = jsonDecode(response.body);
      throw Exception('Unauthorized: ${error['error']}');
    } else if (response.statusCode == 403) {
      final error = jsonDecode(response.body);
      throw Exception('Forbidden: ${error['error']}');
    } else if (response.statusCode == 404) {
      final error = jsonDecode(response.body);
      throw Exception('Not Found: ${error['error']}');
    } else {
      throw Exception('Failed to update event: ${response.body}');
    }
  }

  Future<bool> isGoingToEvent(int eventId) async {
    List<EventModel> events = await getUserEvents();

    for (EventModel event in events) {
      if (event.id == eventId) {
        return true;
      }
    }

    return false;
  }

  Future<bool> isOnWaitingList(int eventId) async {
    List<UserModel> users = await getEventWaitingList(eventId);
    int? userId = await getUserId();

    return users.any((element) => element.id == userId);
  }

  Future<List<bool>> isOnWaitingLists(List<int> eventsIds) async {
    List<bool> isOnWaitingLists = [];
    for (int eventId in eventsIds) {
      isOnWaitingLists.add(await isOnWaitingList(eventId));
    }
    return isOnWaitingLists;
  }

  Future<List<EventModel>> getUserEvents() async {
    final url = Uri.parse('$baseUrl/group/event/my');

    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    final response = await http.get(
      url,
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> eventsJson = jsonDecode(response.body);

      final List<EventModel> events =
          eventsJson.map((e) => EventModel.fromJson(e)).toList();

      events.sort((a, b) => a.date.compareTo(b.date));

      return events;
    } else {
      throw Exception('Failed to get events: ${response.statusCode}');
    }
  }

  Future<EventModel?> getUsersNextEvent() async {
    List<EventModel> events = await getUserEvents();

    if (events.isEmpty) {
      return null;
    }

    return events.first;
  }

  Future<EventModel> getEventById(int id) async {
    final url = Uri.parse('$baseUrl/group/event/$id');

    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    final response = await http.get(
      url,
      headers: headers,
    );

    if (response.statusCode == 200) {
      final dynamic eventsJson = jsonDecode(response.body);
      return EventModel.fromJson(eventsJson);
    } else {
      throw Exception('Failed to get events: ${response.statusCode}');
    }
  }

  Future<List<EventModel>> getEvents() async {
    final url = Uri.parse('$baseUrl/group/event/all');

    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    final response = await http.get(
      url,
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> eventsJson = jsonDecode(response.body);

      final List<EventModel> events =
          eventsJson.map((e) => EventModel.fromJson(e)).toList();

      final List<EventModel> fixEvents = [];

      for (EventModel event in events) {
        fixEvents.add(await getEventById(event.id!));
      }
      fixEvents.sort((a, b) => a.date.compareTo(b.date));

      return fixEvents;
    } else {
      throw Exception('Failed to get events: ${response.statusCode}');
    }
  }

  Future<List<EventModel>> getFilteredEvents(
      EventFilterModel eventFilter) async {
    final url = eventFilter.buildUrl('$baseUrl/group/event/filter');

    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    final response = await http.get(
      url,
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> eventsJson = jsonDecode(response.body);

      final List<EventModel> events =
          eventsJson.map((e) => EventModel.fromJson(e)).toList();

      sortEvents(events, eventFilter.sortBy);

      return events;
    } else {
      throw Exception('Failed to get events: ${response.statusCode}');
    }
  }

  Future<List<EventModel>> getEventsOfGroup(int groupId) async {
    List<EventModel> events = await getEvents();
    List<EventModel> groupEvents = [];
    for (EventModel event in events) {
      if (event.groupId == groupId) {
        groupEvents.add(event);
      }
    }
    return groupEvents;
  }

  Future<List<UserModel>> getEventWaitingList(int eventId) async {
    final url = Uri.parse('$baseUrl/group/event/waitinglist/$eventId');
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    final response = await http.get(
      url,
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> body = jsonDecode(response.body);
      final List<EventWaitingListUserModel> waitingListUsers = body
          .map((dynamic item) => EventWaitingListUserModel.fromJson(item))
          .toList();

      List<UserModel> users = [];
      for (var waitingListUser in waitingListUsers) {
        UserModel? user = await _userService.getUser(waitingListUser.userId);
        if (user != null) {
          users.add(user);
        }
      }
      return users;
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      throw Exception('Bad Request: ${error['error']}');
    } else if (response.statusCode == 403) {
      final error = jsonDecode(response.body);
      throw Exception('Forbidden: ${error['error']}');
    } else if (response.statusCode == 404) {
      return [];
    } else {
      throw Exception('Failed to load waiting list');
    }
  }

  Future<bool> joinEventWaitingList(int eventId) async {
    final url = Uri.parse('$baseUrl/group/event/waitinglist/join/$eventId');
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    final response = await http.post(
      url,
      headers: headers,
    );

    if (response.statusCode == 201) {
      // Successfully joined the waiting list
      return true;
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      throw Exception('Bad Request: ${error['error']}');
    } else if (response.statusCode == 403) {
      final error = jsonDecode(response.body);
      throw Exception('Forbidden: ${error['error']}');
    } else {
      throw Exception('Failed to join the waiting list: ${response.body}');
    }
  }

  Future<bool> leaveEventWaitingList(int eventId) async {
    final url = Uri.parse('$baseUrl/group/event/waitinglist/leave/$eventId');
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    final response = await http.delete(
      url,
      headers: headers,
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      throw Exception('Failed to leave the waiting list: ${response.body}');
    }
  }

  Future<bool> acceptUserIntoEvent(int eventId, int userId) async {
    final url =
        Uri.parse('$baseUrl/group/event/waitinglist/accept/$eventId/$userId');
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    final response = await http.post(
      url,
      headers: headers,
    );

    if (response.statusCode == 201) {
      // User has been accepted into the event
      return true;
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      throw Exception('Bad Request: ${error['error']}');
    } else if (response.statusCode == 401) {
      final error = jsonDecode(response.body);
      throw Exception('Unauthorized: ${error['error']}');
    } else if (response.statusCode == 403) {
      final error = jsonDecode(response.body);
      throw Exception('Forbidden: ${error['error']}');
    } else {
      throw Exception('Failed to accept user into the group: ${response.body}');
    }
  }

  Future<bool> declineUserFromEvent(int eventId, int userId) async {
    final url =
        Uri.parse('$baseUrl/group/event/waitinglist/decline/$eventId/$userId');
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    final response = await http.delete(
      url,
      headers: headers,
    );

    if (response.statusCode == 200) {
      // User has been declined from the event
      return true;
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      throw Exception('Bad Request: ${error['error']}');
    } else if (response.statusCode == 401) {
      final error = jsonDecode(response.body);
      throw Exception('Unauthorized: ${error['error']}');
    } else if (response.statusCode == 403) {
      final error = jsonDecode(response.body);
      throw Exception('Forbidden: ${error['error']}');
    } else {
      throw Exception(
          'Failed to decline user from the group: ${response.body}');
    }
  }

  void addEventsToCalendar(EventController controller, Color color) async {
    List<EventModel> events = await getEvents();
    for (EventModel event in events) {
      if (controller.allEvents.any((element) =>
          element.event is EventModel &&
          (element.event as EventModel?)?.id == event.id)) {
        continue;
      }

      final convertedEvent = CalendarEventData(
        title: event.name,
        description: event.description,
        date: DateTime.parse(event.date),
        startTime: DateTime.parse(event.date),
        endTime: DateTime.parse(event.endtime),
        event: event,
        color: color,
      );

      controller.add(convertedEvent);
    }
  }

  Future<bool> exportEvent(int eventId) async {
    final url = Uri.parse('$baseUrl/group/event/calendar/export/$eventId');

    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    final response = await http.post(
      url,
      headers: headers,
    );

    if (response.statusCode == 201) {
      return true;
    } else {
      throw Exception('Failed to export event: ${response.reasonPhrase}');
    }
  }

  Future<bool> shareEvent(int eventId, String email) async {
    final url =
        Uri.parse('$baseUrl/group/event/calendar/share/$eventId/$email');

    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    final response = await http.post(
      url,
      headers: headers,
    );

    if (response.statusCode == 201) {
      return true;
    } else {
      throw Exception('Failed to share event: ${response.reasonPhrase}');
    }
  }

  Future<bool> removeUserFromEvent(int eventId, int userId) async {
    final url = Uri.parse("$baseUrl/group/event/user/$eventId/$userId");

    Map<String, String> headers;

    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    final response = await http.delete(
      url,
      headers: headers,
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      throw Exception('Failed to remove user from event: ${response.body}');
    }
  }

  Future<List<UserModel>> getGoingUsers(int eventId) async {
    EventModel event = await getEventById(eventId);

    return event.users ?? [];
  }
}
