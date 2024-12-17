import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/core/services/group_service.dart';

class UserService {
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

  Future<UserModel>? getUser([int? userId]) async {
    userId ??= await getUserId();
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    if (userId == null) {
      throw Exception("User ID not found in storage");
    }

    final response = await http.get(
      Uri.parse('$baseUrl/user/$userId'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      var user = UserModel.fromJson(json.decode(response.body));
      user.groups = await GroupService().getUserGroups();
      return user;
    } else {
      throw Exception('Failed to load user: ${response.body}');
    }
  }

  Future<UserModel>? updateUser({
    String? name,
    String? description,
    String? roleId,
    String? banDate,
    String? picture,
  }) async {
    final int? userId = await getUserId();
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    if (userId == null) {
      throw Exception("User ID not found in storage");
    }

    // Reuse the getUser method to fetch the current user information
    final UserModel? currentUser = await getUser();
    if (currentUser == null) {
      throw Exception("Failed to load current user");
    }

    // Create a UserInfo object with the provided or current values
    final Map<String, dynamic> updatedFields = {};
    if (name != null) updatedFields['name'] = name;
    if (description != null) updatedFields['description'] = description;
    if (roleId != null) updatedFields['roleId'] = roleId;
    if (banDate != null) updatedFields['banDate'] = banDate;
    if (picture != null) updatedFields['picture'] = picture;

    final response = await http.put(
      Uri.parse('$baseUrl/user/$userId'),
      headers: headers,
      body: json.encode(updatedFields),
    );

    if (response.statusCode == 200) {
      return UserModel.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to update user: ${response.body}');
    }
  }

  Future<void> deleteUser() async {
    final int? userId = await getUserId();
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    if (userId == null) {
      throw Exception("User ID not found in storage");
    }

    final response = await http.delete(
      Uri.parse('$baseUrl/user/$userId'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      print("User deleted successfully");
    } else {
      throw Exception('Failed to delete user: ${response.body}');
    }
  }

  Future<bool> changePassword(String oldPassword, String newPassword) async {
    final url =
        Uri.parse('$baseUrl/user/password/change/$oldPassword/$newPassword');

    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    final response = await http.patch(
      url,
      headers: headers,
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      throw Exception('Failed to change password: ${response.body}');
    }
  }

  Future<void> initPasswordReset(String email) async {
    final url = Uri.parse('$baseUrl/user/password/reset/init/$email');

    final response = await http.post(
      url,
    );

    if (response.statusCode == 204) {
      print("Password reset process initiated.");
    } else if (response.statusCode == 400) {
      var errorMessage = json.decode(response.body)['error'];
      throw Exception('Bad request: $errorMessage');
    } else if (response.statusCode == 404) {
      var errorMessage = json.decode(response.body)['error'];
      throw Exception('User not found: $errorMessage');
    } else {
      throw Exception('Failed to initiate password reset: ${response.body}');
    }
  }

  Future<void> validatePasswordReset(String email, int code) async {
    final url = Uri.parse('$baseUrl/user/password/reset/validate/$email/$code');

    final response = await http.post(
      url,
    );

    if (response.statusCode == 204) {
      print("Password reset process validated.");
    } else if (response.statusCode == 400) {
      var errorMessage = json.decode(response.body)['error'];
      throw Exception('Bad request: $errorMessage');
    } else if (response.statusCode == 403) {
      var errorMessage = json.decode(response.body)['error'];
      throw Exception('Forbidden: $errorMessage');
    } else {
      throw Exception('Failed to validate password reset: ${response.body}');
    }
  }

  Future<void> resetPassword(String email, String newPassword) async {
    final url =
        Uri.parse('$baseUrl/user/password/reset/edit/$email/$newPassword');

    final response = await http.post(
      url,
    );

    if (response.statusCode == 200) {
      print("Password has been successfully reset.");
    } else if (response.statusCode == 400) {
      var errorMessage = json.decode(response.body)['error'];
      throw Exception('Bad request: $errorMessage');
    } else if (response.statusCode == 403) {
      var errorMessage = json.decode(response.body)['error'];
      throw Exception('Forbidden: $errorMessage');
    } else {
      throw Exception('Failed to reset password: ${response.body}');
    }
  }

  Future<void> resendVerificationEmail(String email) async {
    final url = Uri.parse('$baseUrl/user/verify/$email/new');

    try {
      final response = await http.get(url);

      if (response.statusCode == 204) {
        print('Verification email sent successfully.');
      } else if (response.statusCode == 403) {
        print('Error: User is already registered with this email.');
      } else {
        print('Error: Unexpected response ${response.statusCode}');
      }
    } catch (e) {
      print('Error: Failed to send verification email. $e');
    }
  }
}
