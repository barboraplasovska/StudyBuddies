import 'package:studybuddies/core/models/user_model.dart';

enum EventType {
  physical,
  online,
  hybrid,
}

String getEventTypeStringForBackend(EventType type) {
  switch (type) {
    case EventType.physical:
      return 'offline';
    case EventType.online:
      return 'online';
    case EventType.hybrid:
      return 'hybrid';
  }
}

class EventModel {
  final int? id;
  final String name;
  final String? description;
  final int groupId;
  final String date;
  final String endtime;
  final String location;
  final String? link;
  final String? address;
  final int maxPeople;
  final List<UserModel>? users;

  EventModel(
      {this.id,
      required this.name,
      required this.description,
      required this.groupId,
      required this.date,
      required this.endtime,
      required this.location,
      this.link,
      this.address,
      required this.maxPeople,
      List<UserModel>? users})
      : users = users ?? [];

  factory EventModel.fromJson(Map<String, dynamic> json) {
    List<dynamic> usersList = json['users'] ?? [];

    return EventModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      groupId: json['groupId'] ?? 0,
      date: json['date'] ?? '',
      endtime: json['endtime'] ?? '',
      location: json['location'] ?? '',
      link: json['link'] ?? '',
      address: json['address'] ?? '',
      maxPeople: json['maxPeople'] ?? 0,
      users: usersList.map((e) => UserModel.fromJson(e)).toList(),
    );
  }

  Map<String, dynamic> toJson() {
    Map<String, dynamic> res = {
      'name': name,
      'groupId': groupId,
      'date': DateTime.parse(date).toIso8601String(),
      'endtime': DateTime.parse(endtime).toIso8601String(),
      'location': location,
      'maxPeople': maxPeople,
    };
    if (id != null) {
      res['id'] = id;
    }
    if (description != null && description!.isNotEmpty) {
      res['description'] = description;
    }
    if (link != null && link!.isNotEmpty) {
      res['link'] = link;
    }
    if (address != null && address!.isNotEmpty) {
      res['address'] = address;
    }
    if (users != null && users!.isNotEmpty) {
      res['users'] = users!.map((user) => user.toJson()).toList();
    }
    return res;
  }

  EventType getType() {
    if (link != null &&
        link!.isNotEmpty &&
        address != null &&
        address!.isNotEmpty) {
      return EventType.hybrid;
    } else if (link != null && link!.isNotEmpty) {
      return EventType.online;
    }
    return EventType.physical;
  }

  String getDate() {
    DateTime dateTime = DateTime.parse(date);
    String formattedDate =
        "${dateTime.year}-${dateTime.month.toString().padLeft(2, '0')}-${dateTime.day.toString().padLeft(2, '0')}";
    return formattedDate;
  }

  String getStartTime() {
    DateTime dateTime = DateTime.parse(date);
    String formattedTime =
        "${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}";
    return formattedTime;
  }

  String getEndTime() {
    DateTime dateTime = DateTime.parse(endtime);
    String formattedTime =
        "${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}";
    return formattedTime;
  }

  bool isGoing(int userId) {
    for (UserModel user in users!) {
      if (user.id == userId) {
        return true;
      }
    }
    return false;
  }

  bool isCreator(int userId) {
    for (UserModel user in users!) {
      if (user.id == userId && user.groupRoleId == 1) {
        return true;
      }
    }
    return false;
  }
}
