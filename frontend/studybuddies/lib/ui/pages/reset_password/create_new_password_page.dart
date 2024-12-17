import 'package:flutter/material.dart';
import 'package:studybuddies/core/services/user_service.dart';
import 'package:studybuddies/ui/appbars/simple_back_arrow_app_bar.dart';
import 'package:studybuddies/ui/components/buttons/sb_big_button.dart';
import 'package:studybuddies/ui/components/textfields/sb_textfield.dart';
import 'package:studybuddies/ui/pages/reset_password/reset_password_success_page.dart';

class CreateNewPasswordPage extends StatefulWidget {
  final String email;
  const CreateNewPasswordPage({
    super.key,
    required this.email,
  });

  @override
  State<CreateNewPasswordPage> createState() => _CreateNewPasswordPageState();
}

class _CreateNewPasswordPageState extends State<CreateNewPasswordPage> {
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController repeatPasswordController =
      TextEditingController();
  final UserService userService = UserService();

  String? errorMessage;

  @override
  void initState() {
    super.initState();

    // Add listeners to both text fields to validate as the user types
    passwordController.addListener(_validatePasswords);
    repeatPasswordController.addListener(_validatePasswords);
  }

  @override
  void dispose() {
    // Dispose of the controllers when the widget is disposed
    passwordController.dispose();
    repeatPasswordController.dispose();
    super.dispose();
  }

  // Function to validate if passwords match
  void _validatePasswords() {
    setState(() {
      if (passwordController.text.isNotEmpty &&
          repeatPasswordController.text.isNotEmpty) {
        if (passwordController.text != repeatPasswordController.text) {
          errorMessage = "Passwords do not match.";
        } else {
          errorMessage = null; // Clear the error if they match
        }
      }
    });
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
              "Create new password",
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
              labelText: "Password",
              hintText: "********",
              controller: passwordController,
              type: TextFieldType.password,
            ),
            SBTextField(
              labelText: "Repeat password",
              hintText: "********",
              controller: repeatPasswordController,
              type: TextFieldType.password,
            ),

            // Display the error message if passwords do not match
            if (errorMessage != null)
              Padding(
                padding: const EdgeInsets.only(top: 10, bottom: 10),
                child: Text(
                  errorMessage!,
                  style: const TextStyle(color: Colors.red),
                ),
              ),

            SBBigButton(
              title: "Save",
              blueColor: true,
              isDisabled: errorMessage != null,
              onPressed: () {
                if (passwordController.text.isNotEmpty &&
                    repeatPasswordController.text.isNotEmpty) {
                  // Ensure passwords match before resetting the password
                  if (passwordController.text ==
                      repeatPasswordController.text) {
                    userService.resetPassword(
                      widget.email,
                      passwordController.text,
                    );
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ResetPasswordSuccessPage(),
                      ),
                    );
                  }
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
