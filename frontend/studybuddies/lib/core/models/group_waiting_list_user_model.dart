class GroupWaitingListUserModel {
  final int id;
  final int userId;
  final int groupId;

  GroupWaitingListUserModel({
    required this.id,
    required this.userId,
    required this.groupId,
  });

  factory GroupWaitingListUserModel.fromJson(Map<String, dynamic> json) {
    return GroupWaitingListUserModel(
      id: json['id'] ?? '',
      userId: json['userid'] ?? '',
      groupId: json['groupid'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userid': userId,
      'groupid': groupId,
    };
  }
}
