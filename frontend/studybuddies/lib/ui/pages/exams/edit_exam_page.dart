import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:studybuddies/core/models/exam_model.dart';
import 'package:studybuddies/core/services/exam_service.dart';
import 'package:studybuddies/core/utils/utils.dart';
import 'package:studybuddies/ui/appbars/form_app_bar.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:studybuddies/ui/components/textfields/sb_textfield.dart';

class EditExamPage extends StatefulWidget {
  final ExamModel exam;
  const EditExamPage({
    super.key,
    required this.exam,
  });

  @override
  State<EditExamPage> createState() => _EditExamPageState();
}

class _EditExamPageState extends State<EditExamPage> {
  final TextEditingController subjectNameController = TextEditingController();
  final TextEditingController examDateController = TextEditingController();
  final TextEditingController startTimeController = TextEditingController();
  final TextEditingController endTimeController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();

  ExamService examService = ExamService();

  bool isFormValid = false;

  @override
  void initState() {
    super.initState();
    subjectNameController.addListener(validateForm);
    examDateController.addListener(validateForm);

    subjectNameController.text = widget.exam.name;
    examDateController.text =
        DateFormat('dd/MM/yyyy').format(DateTime.parse(widget.exam.date));

    startTimeController.text =
        DateFormat('HH:mm').format(DateTime.parse(widget.exam.date));
    endTimeController.text =
        DateFormat('HH:mm').format(DateTime.parse(widget.exam.endtime));
    descriptionController.text = widget.exam.description;
  }

  @override
  void dispose() {
    subjectNameController.dispose();
    examDateController.dispose();
    startTimeController.dispose();
    endTimeController.dispose();
    descriptionController.dispose();
    super.dispose();
  }

  void validateForm() {
    setState(() {
      isFormValid = subjectNameController.text.isNotEmpty &&
          examDateController.text.isNotEmpty;
    });
  }

  void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void addExam() async {
    if (isFormValid) {
      await examService.createExam(
        ExamModel(
          name: subjectNameController.text,
          description: descriptionController.text,
          date: convertDateFormat(
              examDateController.text, startTimeController.text),
          endtime: convertDateFormat(
              examDateController.text, endTimeController.text),
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const FormAppBar(title: 'Edit exam'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            SBTextField(
              labelText: 'Subject name',
              hintText: 'ex. Maths',
              controller: subjectNameController,
            ),
            SBTextField(
              labelText: 'Date',
              hintText: 'Select date',
              controller: examDateController,
              type: TextFieldType.date,
            ),
            const Text(
              'Time',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Row(
              children: [
                Expanded(
                  child: SBTextField(
                    hintText: 'Start time',
                    controller: startTimeController,
                    type: TextFieldType.time,
                  ),
                ),
                const SizedBox(width: 8),
                const Text('-'),
                const SizedBox(width: 8),
                Expanded(
                  child: SBTextField(
                    hintText: 'End time',
                    controller: endTimeController,
                    type: TextFieldType.time,
                  ),
                ),
              ],
            ),
            SBTextField(
              labelText: 'Description',
              hintText: 'Enter the description',
              controller: descriptionController,
              multipleLines: true,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                SBSmallButton(
                  title: "Edit exam",
                  onPressed: isFormValid ? addExam : null,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
