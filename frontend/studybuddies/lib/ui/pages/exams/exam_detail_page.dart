import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/exam_model.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/services/exam_service.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/core/utils/utils.dart';
import 'package:studybuddies/ui/appbars/exam_detail_app_bar.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ExamDetailPage extends StatefulWidget {
  final ExamModel exam;

  ExamDetailPage({
    required this.exam,
  });

  @override
  _ExamDetailPageState createState() => _ExamDetailPageState();
}

class _ExamDetailPageState extends State<ExamDetailPage> {
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  ExamService examService = ExamService();
  GroupService groupService = GroupService();
  late ExamModel exam;
  late Future<GroupModel> groupFuture;

  @override
  void initState() {
    exam = widget.exam;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: ExamDetailAppBar(
          exam: exam,
          onEditExam: () async {
            ExamModel newexam = await examService.getExamById(exam.id!);
            setState(() {
              exam = newexam;
            });
          }),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  exam.name,
                  style: const TextStyle(
                      fontSize: 24, fontWeight: FontWeight.bold),
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.calendar_today),
                  title: Text(
                    formatDateText(exam.date),
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  subtitle: Row(
                    children: [
                      Text(exam.getTime()),
                      Text(" - "),
                      Text(exam.getEndTime()),
                    ],
                  ),
                ),
                if (exam.description.isNotEmpty) const SizedBox(height: 20),
                Text(
                  exam.description,
                  style: const TextStyle(fontSize: 16),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
