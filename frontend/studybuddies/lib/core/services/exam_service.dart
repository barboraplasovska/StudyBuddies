import 'dart:convert';
import 'dart:ui';
import 'package:calendar_view/calendar_view.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:studybuddies/core/models/exam_model.dart';
import 'package:studybuddies/core/services/auth_service.dart';
import 'package:http/http.dart' as http;

class ExamService {
  final String baseUrl = dotenv.env['API_BASE_URL'] ?? "";
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  Future<int?> getUserId() async {
    String? userId = await storage.read(key: "userId");
    return userId != null ? int.parse(userId) : null;
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

  Future<ExamModel> createExam(ExamModel exam) async {
    final url = Uri.parse('$baseUrl/exam');

    int? userId = await getUserId();
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }
    if (userId == null) {
      throw Exception("User ID not found in storage");
    }

    exam.userId = userId;

    final body = jsonEncode(exam.toJson());

    final response = await http.post(
      url,
      headers: headers,
      body: body,
    );

    if (response.statusCode == 201) {
      return ExamModel.fromJson(jsonDecode(response.body));
    } else if (response.statusCode == 400) {
      throw Exception('Bad Request: ${jsonDecode(response.body)['error']}');
    } else if (response.statusCode == 401) {
      throw Exception('Unauthorized: ${jsonDecode(response.body)['error']}');
    } else if (response.statusCode == 403) {
      throw Exception('Forbidden: ${jsonDecode(response.body)['error']}');
    } else {
      throw Exception('Failed to create exam: ${response.statusCode}');
    }
  }

  void updateExam(int id, Map<String, dynamic> updateData) async {
    final url = Uri.parse('$baseUrl/exam/$id');

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

    if (response.statusCode != 200) {
      throw Exception('Failed to update exam: ${response.statusCode}');
    }
  }

  Future<ExamModel> getExamById(int id) async {
    final url = Uri.parse('$baseUrl/exam/$id');

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
      return ExamModel.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to get exam: ${response.statusCode}');
    }
  }

  Future<List<ExamModel>> getUserExams() async {
    final url = Uri.parse('$baseUrl/exam/my');

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
      final List<dynamic> examsJson = jsonDecode(response.body);
      return examsJson.map((e) => ExamModel.fromJson(e)).toList();
    } else {
      AuthService().logoutUser();
      throw Exception('Failed to get exams: ${response.statusCode}');
    }
  }

  void addExamsToCalendar(EventController controller, Color color) async {
    final exams = await getUserExams();

    for (final exam in exams) {
      if (controller.allEvents.any((element) =>
          element.event is ExamModel &&
          (element.event as ExamModel?)?.id == exam.id)) {
        continue;
      }

      final event = CalendarEventData(
        title: exam.name,
        description: exam.description,
        date: DateTime.parse(exam.date),
        startTime: DateTime.parse(exam.date),
        endTime: DateTime.parse(exam.endtime),
        color: color,
        event: exam,
      );

      controller.add(event);
    }
  }
}
