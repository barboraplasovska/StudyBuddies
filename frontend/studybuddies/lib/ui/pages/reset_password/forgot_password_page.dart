import 'package:flutter/material.dart';
import 'package:studybuddies/core/services/user_service.dart';
import 'package:studybuddies/ui/appbars/simple_back_arrow_app_bar.dart';
import 'package:studybuddies/ui/components/buttons/sb_big_button.dart';
import 'package:studybuddies/ui/components/textfields/sb_textfield.dart';
import 'package:studybuddies/ui/pages/email_verification/email_verification_page.dart';

class ForgotPasswordPage extends StatelessWidget {
  const ForgotPasswordPage({super.key});

  @override
  Widget build(BuildContext context) {
    TextEditingController schoolController = TextEditingController();
    UserService userService = UserService();
    return Scaffold(
      appBar: const SimpleBackArrowAppBar(),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Text(
              "Reset password",
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 22,
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 15, vertical: 10),
              child: Text(
                "Please enter your email to receive a verification code.",
                textAlign: TextAlign.center,
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 5),
              child: SBTextField(
                hintText: "ex. john.doe@school.com",
                controller: schoolController,
              ),
            ),
            SBBigButton(
              title: "Send",
              blueColor: true,
              onPressed: () {
                if (schoolController.text.isNotEmpty) {
                  userService.initPasswordReset(schoolController.text);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => EmailVerificationPage(
                        email: schoolController.text,
                        isPasswordReset: true,
                      ),
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
