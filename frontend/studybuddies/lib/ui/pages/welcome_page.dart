import 'package:flutter/material.dart';
import 'package:studybuddies/ui/components/buttons/sb_big_button.dart';
import 'package:studybuddies/ui/pages/auth/login_page.dart';
import 'package:studybuddies/ui/pages/auth/register_page.dart';

class WelcomeScreenPage extends StatefulWidget {
  @override
  _WelcomeScreenPageState createState() => _WelcomeScreenPageState();
}

class _WelcomeScreenPageState extends State<WelcomeScreenPage>
    with SingleTickerProviderStateMixin {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.primary,
      body: Center(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Image.asset('assets/logo/studybuddies-logo1.png'),
            const SizedBox(
                height:
                    8.0), // Provide spacing between the logo and the slogan.
            const Text(
              'By students, for students.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16.0,
                color: Colors.white,
              ),
            ),
            const SizedBox(
                height:
                    48.0), // Provide spacing between the slogan and the buttons.
            SBBigButton(
                title: "Register",
                blueColor: true,
                onPressed: () => {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => RegisterPage()),
                      ),
                    }),

            SizedBox(height: 16.0), // Provide spacing between the buttons.
            SBBigButton(
                title: "Login",
                blueColor: false,
                onPressed: () => {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => LoginPage()),
                      ),
                    }),
          ],
        ),
      ),
    );
  }
}
