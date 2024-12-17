import 'package:flutter/material.dart';
import 'package:studybuddies/app_router.dart';
import 'package:studybuddies/ui/appbars/simple_back_arrow_app_bar.dart';
import 'package:studybuddies/ui/components/buttons/sb_big_button.dart';

class ChangePasswordSuccessPage extends StatefulWidget {
  const ChangePasswordSuccessPage({super.key});

  @override
  State<ChangePasswordSuccessPage> createState() =>
      _ChangePasswordSuccessPageState();
}

class _ChangePasswordSuccessPageState extends State<ChangePasswordSuccessPage> {
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController repeatPasswordController =
      TextEditingController();

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
              "Success",
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 22,
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 15, vertical: 10),
              child: Text(
                "You have successfully changed your password!",
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
                    builder: (context) => const AppRouter(),
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
