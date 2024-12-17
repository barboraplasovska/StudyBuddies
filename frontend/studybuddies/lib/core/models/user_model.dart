import 'package:studybuddies/core/models/group_model.dart';

class UserModel {
  final int id;
  final String name;
  final String description;
  final int roleId;
  int? groupRoleId;
  String? picture;
  final String joinDate;
  final String banDate;
  List<GroupModel> groups;

  UserModel(
      {required this.id,
      required this.name,
      required this.description,
      required this.roleId,
      required this.joinDate,
      required this.banDate,
      this.groupRoleId,
      this.picture,
      List<GroupModel>? groups})
      : groups = groups ?? [];

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final userJson = json.containsKey('user') ? json['user'] : json;

    UserModel user = UserModel(
      id: userJson['id'] ?? 0,
      name: userJson['name'] ?? "",
      description: userJson['description'] ?? "",
      roleId: userJson['roleId'] ?? 0,
      joinDate: userJson['joinDate'] ?? "",
      banDate: userJson['banDate'] ?? "",
      picture: userJson['picture'] ?? "",
      groups: userJson.containsKey('groups')
          ? (userJson['groups'] as List<dynamic>)
              .map((group) => GroupModel.fromJson(group))
              .toList()
          : [],
    );

    if (userJson.containsKey('grouproleid')) {
      user.groupRoleId = userJson['grouproleid'] as int?;
    }

    return user;
  }

  Map<String, dynamic> toJson() {
    Map<String, dynamic> res = {
      'id': id,
      'name': name,
      'description': description,
      'roleId': roleId,
      'joinDate': joinDate,
      'banDate': banDate,
      'groups': groups.map((group) => group.toJson()).toList(),
    };

    if (groupRoleId != null) {
      res['grouproleid'] = groupRoleId;
    }

    if (picture != null && picture!.isNotEmpty) {
      res['picture'] = picture;
    }

    return res;
  }

  static void printUser(UserModel user) {
    print('User ID: ${user.id}');
    print('Name: ${user.name}');
    print('Description: ${user.description}');
    print('Role ID: ${user.roleId}');
    print('Join Date: ${user.joinDate}');
    print('Ban Date: ${user.banDate}');
    print('Group Role ID: ${user.groupRoleId}');
    print('Picture: ${user.picture}');
    print('Groups:');
    for (var group in user.groups) {
      print('  Group ID: ${group.id}');
      print('  Name: ${group.name}');
      print('  Description: ${group.description}');
      print('  Parent ID: ${group.parentId}');
      print('  Users:');
      for (var user in group.users) {
        print('    User ID: ${user.id}');
        print('    Name: ${user.name}');
        print('    Description: ${user.description}');
        print('    Role ID: ${user.roleId}');
        print('    Join Date: ${user.joinDate}');
        print('    Ban Date: ${user.banDate}');
        print('    Group Role ID: ${user.groupRoleId}');
      }
    }
  }

  String getPicture() {
    if (picture == null || picture!.isEmpty) {
      return 'https://picsum.photos/200/300?random=$id';
    }
    return picture!;
  }

  String getGroupRole() {
    if (groupRoleId == 1) {
      return 'Owner';
    } else if (groupRoleId == 2) {
      return 'Admin';
    } else {
      return 'Member';
    }
  }
}
