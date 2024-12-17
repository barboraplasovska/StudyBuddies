import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:studybuddies/core/models/group_filter_model.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/core/models/group_waiting_list_user_model.dart';
import 'package:studybuddies/core/services/auth_service.dart';
import 'package:studybuddies/core/services/user_service.dart'; // Import UserService
import 'package:http/http.dart' as http;
import 'package:studybuddies/core/utils/sorter.dart';

class GroupService {
  final String baseUrl = dotenv.env['API_BASE_URL'] ?? "";
  final FlutterSecureStorage storage = const FlutterSecureStorage();
  final UserService _userService = UserService();
  final AuthService _authService = AuthService();

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

  Future<void> createGroup(GroupModel group) async {
    final url = Uri.parse('$baseUrl/group');
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    final response = await http.post(
      url,
      headers: headers,
      body: jsonEncode(group.toJson()),
    );

    if (response.statusCode != 201) {
      final error = jsonDecode(response.body);
      throw Exception('Failed to create group: ${error['message']}');
    }
  }

  Future<void> updateGroup(int id, Map<String, dynamic> updateData) async {
    final url = Uri.parse('$baseUrl/group/$id');
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
      // Successfully updated the group
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
      throw Exception('Failed to update group: ${response.body}');
    }
  }

  Future<List<GroupModel>> getAllGroups() async {
    final url = Uri.parse('$baseUrl/group/all');
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
      return body.map((dynamic item) => GroupModel.fromJson(item)).toList();
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      throw Exception('Bad Request: ${error['error']}');
    } else if (response.statusCode == 403) {
      await _authService.logoutUser();
      throw Exception('Forbidden: ${response.body}');
    } else {
      throw Exception('Failed to load groups');
    }
  }

  Future<List<GroupModel>> getUserGroups() async {
    final url = Uri.parse('$baseUrl/group/find/my');
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
      return body.map((dynamic item) => GroupModel.fromJson(item)).toList();
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      throw Exception('Bad Request: ${error['error']}');
    } else if (response.statusCode == 403) {
      await _authService.logoutUser();
      throw Exception('Forbidden: ${response.body}');
    } else {
      throw Exception('Failed to load groups');
    }
  }

  Future<List<GroupModel>> getFilteredGroups(GroupFilterModel filter) async {
    final url = filter.buildUrl('$baseUrl/group/filter');
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
      List<GroupModel> res =
          body.map((dynamic item) => GroupModel.fromJson(item)).toList();

      sortGroups(res, filter.sortBy);

      for (var group in res) {
        if (group.users.length > 0) {
          continue;
        }
        var newFetch = await getGroupById(group.id!);
        group.users = newFetch.users;
      }

      return res;
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      throw Exception('Bad Request: ${error['error']}');
    } else if (response.statusCode == 403) {
      await _authService.logoutUser();
      throw Exception('Forbidden: ${response.body}');
    } else {
      throw Exception('Failed to load groups');
    }
  }

  Future<List<GroupModel>> getUserWaitingListGroups() async {
    final url = Uri.parse('$baseUrl/group/waitinglist/my');
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
      final List<GroupModel> groups =
          body.map((dynamic item) => GroupModel.fromJson(item)).toList();

      // // FIXME: (backend): they don't return the users of this group
      // FIXME: this should be fixed but is commented in case it's not
      // for (var group in groups) {
      //   final response = await http.get(
      //     Uri.parse('$baseUrl/group/${group.id}'),
      //     headers: headers,
      //   );

      //   if (response.statusCode == 200) {
      //     Map<String, dynamic> responseData = jsonDecode(response.body);
      //     group.users = GroupModel.fromJson(responseData).users;
      //   } else {
      //     throw Exception('Failed to get group: ${response.body}');
      //   }
      // }
      return groups;
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      throw Exception('Bad Request: ${error['error']}');
    } else if (response.statusCode == 403) {
      await _authService.logoutUser();
      throw Exception('Forbidden: ${response.body}');
    } else {
      throw Exception('Failed to load groups');
    }
  }

  Future<GroupModel> getGroupById(int groupId) async {
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    final response = await http.get(
      Uri.parse('$baseUrl/group/$groupId'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      Map<String, dynamic> responseData = jsonDecode(response.body);
      return GroupModel.fromJson(responseData);
    } else {
      throw Exception('Failed to get group: ${response.body}');
    }

    // List<GroupModel> groups = await getUserGroups();
    // for (var group in groups) {
    //   if (group.id == groupId) {
    //     return group;
    //   }
    // }
    // throw Exception('Failed to get group: Not found');
  }

  Future<List<UserModel>> getGroupWaitingList(int groupId) async {
    final url = Uri.parse('$baseUrl/group/waitinglist/$groupId');
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
      final List<GroupWaitingListUserModel> waitingListUsers = body
          .map((dynamic item) => GroupWaitingListUserModel.fromJson(item))
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

  Future<bool> joinGroupWaitingList(int groupId) async {
    final url = Uri.parse('$baseUrl/group/waitinglist/join/$groupId');
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

  Future<bool> leaveGroupWaitingList(int groupId) async {
    final url = Uri.parse('$baseUrl/group/waitinglist/leave/$groupId');
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
      // Successfully left the waiting list
      return true;
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      throw Exception('Bad Request: ${error['error']}');
    } else if (response.statusCode == 403) {
      final error = jsonDecode(response.body);
      throw Exception('Forbidden: ${error['error']}');
    } else {
      throw Exception('Failed to leave the waiting list: ${response.body}');
    }
  }

  Future<bool> isUserInGroupWaitingList(int groupId, int userId) async {
    final url = Uri.parse('$baseUrl/group/waitinglist/$groupId');
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
      final List<GroupWaitingListUserModel> waitingListUsers = body
          .map((dynamic item) => GroupWaitingListUserModel.fromJson(item))
          .toList();

      return waitingListUsers.any((user) => user.userId == userId);
    } else if (response.statusCode == 404) {
      return false;
    } else {
      throw Exception(
          'Failed to check if user is in waiting list: ${response.body}');
    }
  }

  Future<bool> acceptUserIntoGroup(int groupId, int userId) async {
    final url = Uri.parse('$baseUrl/group/waitinglist/accept/$groupId/$userId');
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
      // User has been accepted into the group
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

  Future<bool> declineUserFromGroup(int groupId, int userId) async {
    final url =
        Uri.parse('$baseUrl/group/waitinglist/decline/$groupId/$userId');
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
      // User has been declined from the group
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

  Future<int> getGroupRoleId(GroupModel group, int userId) async {
    // FIXME: fix this
    // I think it's wrong
    final url = Uri.parse('$baseUrl/group/user/$userId');

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
      final data = jsonDecode(response.body);
      return data['grouproleid'];
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
      throw Exception('Failed to retrieve group user: ${response.body}');
    }
  }

  Future<List<GroupModel>> getSchools() async {
    final url = Uri.parse('$baseUrl/group/schools');

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
      return body.map((dynamic item) => GroupModel.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load schools');
    }
  }

  Future<List<GroupModel>> getMySchools() async {
    List<GroupModel> schools = await getSchools();
    final userId = await getUserId();
    List<GroupModel> mySchools = schools.where((school) {
      return school.users.any((user) => user.id == userId);
    }).toList();

    return mySchools;
  }

  Future<bool> leaveGroup(int userId) async {
    final url = Uri.parse('$baseUrl/group/user/leave/$userId');

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

    if (response.statusCode == 200) {
      return true;
    } else {
      throw Exception('Failed to leave group');
    }
  }

  Future<bool> promoteUser(int groupId, int userId) async {
    final url = Uri.parse("$baseUrl/group/user/promote/$groupId/$userId");

    Map<String, String> headers;

    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    final response = await http.patch(url, headers: headers);

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception('Failed to promote user: ${error['message']}');
    }

    return true;
  }

  Future<bool> demoteUser(int groupId, int userId) async {
    final url = Uri.parse("$baseUrl/group/user/demote/$groupId/$userId");

    Map<String, String> headers;

    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    final response = await http.patch(url, headers: headers);

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception('Failed to demote user: ${error['message']}');
    }

    return true;
  }

  Future<bool> changeGroupOwner(int groupId, int userId) async {
    final url = Uri.parse('$baseUrl/group/user/owner/edit/$groupId/$userId');
    Map<String, String> headers;

    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    final response = await http.patch(url, headers: headers);

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception('Failed to change owner: ${error['message']}');
    }

    return true;
  }

  Future<GroupModel?> getSchoolById(int? parentId) async {
    if (parentId == null) {
      return null;
    }

    return getGroupById(parentId);
  }
}
