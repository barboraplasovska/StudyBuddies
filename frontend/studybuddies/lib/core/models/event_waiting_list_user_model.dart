class EventWaitingListUserModel {
  final int id;
  final int userId;
  final int eventId;

  EventWaitingListUserModel({
    required this.id,
    required this.userId,
    required this.eventId,
  });

  factory EventWaitingListUserModel.fromJson(Map<String, dynamic> json) {
    return EventWaitingListUserModel(
      id: json['id'] ?? '',
      userId: json['userid'] ?? '',
      eventId: json['eventid'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userid': userId,
      'eventid': eventId,
    };
  }
}
