import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/exam_model.dart';
import 'package:studybuddies/core/utils/utils.dart';
import 'package:studybuddies/ui/pages/exams/exam_detail_page.dart';

class SBExamCard extends StatelessWidget {
  final ExamModel exam;
  const SBExamCard({super.key, required this.exam});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ExamDetailPage(exam: exam),
          ),
        );
      },
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            truncateText(exam.name, maxLength: 30),
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 16,
            ),
          ),
          //const Spacer(),
          Text(
            truncateText(formatExamDateText(exam.date), maxLength: 30),
            style: TextStyle(
              color: Colors.black.withOpacity(0.5),
              fontWeight: FontWeight.w700,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}
