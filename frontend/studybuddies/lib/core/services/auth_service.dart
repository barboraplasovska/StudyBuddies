import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:studybuddies/core/models/credential_info_model.dart';
import 'package:studybuddies/core/models/user_info_model.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/core/utils/cookies_utils.dart';

class AuthService {
  final String baseUrl = dotenv.env['API_BASE_URL'] ?? "";
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  Future<void> registerUser(
      UserInfo userInfo, CredentialInfo credentialInfo) async {
    final url = Uri.parse('$baseUrl/user/register');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userInfo': userInfo.toJson(),
        'credentialInfo': credentialInfo.toJson(),
      }),
    );

    if (response.statusCode == 201) {
      return;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error']);
    }
  }

  Future<void> logoutUser() async {
    await storage.delete(key: 'sessionId');
    await storage.delete(key: 'jwt');
    await storage.delete(key: 'userId');
    await storage.delete(key: 'expireAt');
  }

  Future<void> loginUser(String email, String password) async {
    final url = Uri.parse('$baseUrl/user/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({"email": email, "password": password}),
    );

    if (response.statusCode == 200) {
      final setCookie = response.headers["set-cookie"];
      if (setCookie != null) {
        final cookies = parseCookies(setCookie);
        final sessionId = cookies['sessionId'];
        final jwt = cookies['jwt'];
        final expireAt = cookies['expireAt'];

        if (sessionId != null && jwt != null) {
          await storage.write(key: 'sessionId', value: sessionId);
          await storage.write(key: 'jwt', value: jwt);
          await storage.write(
              key: 'userId', value: jsonDecode(response.body)['id'].toString());
          await storage.write(key: 'expireAt', value: expireAt);
        } else {
          throw Exception('Failed to extract cookies.');
        }
      } else {
        throw Exception('Set-Cookie header not found.');
      }
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error']);
    }
  }

  Future<UserModel> getVerified(String email, String mailCode) async {
    final url = Uri.parse('$baseUrl/user/verify/$email/$mailCode');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 201) {
      final setCookie = response.headers['set-cookie'];
      if (setCookie != null) {
        final cookies = parseCookies(setCookie);
        final sessionId = cookies['sessionId'];
        final jwt = cookies['jwt'];
        final expireAt = cookies['expireAt'];

        if (sessionId != null && jwt != null) {
          UserModel user = UserModel.fromJson(jsonDecode(response.body));

          await storage.write(key: 'sessionId', value: sessionId);
          await storage.write(key: 'jwt', value: jwt);
          await storage.write(key: 'userId', value: user.id.toString());
          await storage.write(key: 'expireAt', value: expireAt);

          return user;
        } else {
          throw Exception('Failed to extract cookies.');
        }
      } else {
        throw Exception('Set-Cookie header not found.');
      }
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error']);
    }
  }

  Future<bool> getEmail(String email) async {
    final url = Uri.parse('$baseUrl/user/verify/$email/new');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 204) {
      return true;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error']);
    }
  }
}
