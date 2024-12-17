import 'package:flutter/material.dart';
import 'package:studybuddies/ui/appbars/simple_back_arrow_app_bar.dart';
import 'package:studybuddies/ui/components/buttons/sb_big_button.dart';
import 'package:studybuddies/ui/pages/welcome_page.dart';

class ResetPasswordSuccessPage extends StatefulWidget {
  const ResetPasswordSuccessPage({super.key});

  @override
  State<ResetPasswordSuccessPage> createState() =>
      _ResetPasswordSuccessPageState();
}

class _ResetPasswordSuccessPageState extends State<ResetPasswordSuccessPage> {
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController repeatPasswordController =
      TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: SimpleBackArrowAppBar(),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Text(
              "Success",
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 22,
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 15, vertical: 10),
              child: Text(
                "You have successfully reset your password! You can now login.",
                textAlign: TextAlign.center,
              ),
            ),
            SBBigButton(
              title: "Ok",
              blueColor: true,
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => WelcomeScreenPage(),
                  ),
                );
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
