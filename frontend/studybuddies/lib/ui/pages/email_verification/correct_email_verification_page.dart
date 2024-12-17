import 'package:flutter/material.dart';
import 'package:studybuddies/app_router.dart';
import 'package:studybuddies/ui/components/buttons/sb_big_button.dart';
import 'package:studybuddies/ui/pages/reset_password/create_new_password_page.dart';

class CorrectEmailVerificationPage extends StatelessWidget {
  final bool isPasswordReset;
  final String email;

  const CorrectEmailVerificationPage({
    super.key,
    required this.isPasswordReset,
    this.email = "",
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.primary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              Image.asset(
                "assets/imgs/envelope-checkmark.png",
                width: 100,
              ),
              const SizedBox(height: 20),
              const Text(
                'Email verified',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 10),
              const Text(
                'Your email has been successfully verified. Click below to continue.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 50),
              SBBigButton(
                title: "Continue",
                blueColor: true,
                width: 380,
                smallerText: true,
                onPressed: () {
                  if (isPasswordReset) {
                    // Continue resetting password
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CreateNewPasswordPage(
                          email: email,
                        ),
                      ),
                    );
                  } else {
                    // Navigate to homepage
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const AppRouter(),
                      ),
                    );
                  }
                },
              ),
              const SizedBox(
                height: 30,
              )
            ],
          ),
        ),
      ),
    );
  }
}
