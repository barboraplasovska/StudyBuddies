import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/exam_model.dart';
import 'package:studybuddies/ui/pages/exams/edit_exam_page.dart';

class ExamDetailAppBar extends StatelessWidget implements PreferredSizeWidget {
  final ExamModel exam;
  final Function() onEditExam;

  const ExamDetailAppBar({
    super.key,
    required this.exam,
    required this.onEditExam,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Theme.of(context).colorScheme.primary,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => Navigator.pop(context),
      ),
      actions: <Widget>[
        IconButton(
          icon: const Icon(Icons.edit, color: Colors.white),
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => EditExamPage(exam: exam),
            ),
          ).then((value) => onEditExam()),
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
