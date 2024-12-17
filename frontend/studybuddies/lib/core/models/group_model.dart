import 'package:studybuddies/core/models/user_model.dart';

class GroupModel {
  final int? id;
  final String name;
  final String description;
  final String? picture;
  final int? parentId;
  final int? verified;
  final GroupModel? school;
  List<UserModel> users;

  GroupModel({
    this.id,
    required this.name,
    required this.description,
    this.parentId,
    this.verified,
    this.picture,
    this.school,
    List<UserModel>? users,
  }) : users = users ?? [];

  factory GroupModel.fromJson(Map<String, dynamic> json) {
    List<dynamic> usersList = json['users'] ?? [];
    List<UserModel> parsedUsers =
        usersList.map((user) => UserModel.fromJson(user)).toList();

    String? picture = json['picture'];
    if (picture == null || picture.isEmpty) {
      picture = null;
    }

    return GroupModel(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      parentId: json['parentId'],
      verified: json['verified'],
      picture: picture,
      users: parsedUsers,
    );
  }

  Map<String, dynamic> toJson() {
    final data = {
      'name': name,
      'description': description,
      'picture': picture,
      'verified': verified,
    };

    data['address'] =
        "12 rue voltaire, Kremlin-Bicetre, 94270"; // FIXME: (backend): should have deleted address from group model

    if (parentId != null) {
      data['parentId'] = parentId!;
    }

    if (id != null) {
      data['id'] = "$id";
    }

    return data;
  }

  String getPicture() {
    if (picture == null || picture!.isEmpty) {
      return 'https://picsum.photos/200/300?random=$id';
    }
    return picture!;
  }

  bool isOwner(int userId) {
    for (UserModel user in users) {
      if (user.id == userId &&
          (user.groupRoleId != null && user.groupRoleId! <= 2)) {
        return true;
      }
    }

    return false;
  }
}
