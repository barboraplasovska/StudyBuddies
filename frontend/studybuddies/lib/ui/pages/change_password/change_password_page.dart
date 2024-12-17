import 'package:flutter/material.dart';
import 'package:studybuddies/core/services/user_service.dart';
import 'package:studybuddies/ui/appbars/simple_back_arrow_app_bar.dart';
import 'package:studybuddies/ui/components/buttons/sb_big_button.dart';
import 'package:studybuddies/ui/components/textfields/sb_textfield.dart';
import 'package:studybuddies/ui/pages/change_password/change_password_success_page.dart';

class ChangePasswordPage extends StatefulWidget {
  const ChangePasswordPage({super.key});

  @override
  State<ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<ChangePasswordPage> {
  final TextEditingController oldPasswordController = TextEditingController();
  final TextEditingController newPasswordController = TextEditingController();
  final TextEditingController repeatNewPasswordController =
      TextEditingController();

  UserService userService = UserService();

  bool isFormValid = false;

  @override
  void initState() {
    super.initState();
    oldPasswordController.addListener(validateForm);
    newPasswordController.addListener(validateForm);
    repeatNewPasswordController.addListener(validateForm);
  }

  @override
  void dispose() {
    oldPasswordController.dispose();
    newPasswordController.dispose();
    repeatNewPasswordController.dispose();
    super.dispose();
  }

  void validateForm() {
    setState(() {
      if (oldPasswordController.text.isEmpty ||
          newPasswordController.text.isEmpty ||
          repeatNewPasswordController.text.isEmpty) {
        // If any of the fields are empty, the form is invalid
        isFormValid = false;
        return;
      }

      if (newPasswordController.text != repeatNewPasswordController.text) {
        // If the new password and the repeated password do not match, the form is invalid
        isFormValid = false;
        return;
      }

      // If all conditions are met, the form is valid
      isFormValid = true;
    });
  }

  void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error editing event'),
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

  Future<bool> changePassword() async {
    if (isFormValid) {
      try {
        await userService.changePassword(
          oldPasswordController.text,
          newPasswordController.text,
        );
        return true;
      } catch (error) {
        _showErrorDialog(context, error.toString());
        return false;
      }
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const SimpleBackArrowAppBar(),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Text(
              "Change password",
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 22,
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 15, vertical: 10),
              child: Text(
                "Choose a strong new password. It cannot be the same as your previous password.",
                textAlign: TextAlign.center,
              ),
            ),
            SBTextField(
              labelText: "Old password",
              hintText: "********",
              controller: oldPasswordController,
              type: TextFieldType.password,
            ),
            SBTextField(
              labelText: "New password",
              hintText: "********",
              controller: newPasswordController,
              type: TextFieldType.password,
            ),
            SBTextField(
              labelText: "Repeat password",
              hintText: "********",
              controller: repeatNewPasswordController,
              type: TextFieldType.password,
            ),
            SBBigButton(
              title: "Save",
              blueColor: true,
              onPressed: () async {
                bool res = await changePassword();
                if (res) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ChangePasswordSuccessPage(),
                    ),
                  );
                }
              },
              width: 380,
              smallerText: true,
            )
          ],
        ),
      ),
    );
  }
}
