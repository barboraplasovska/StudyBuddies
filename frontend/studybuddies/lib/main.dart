import 'package:calendar_view/calendar_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:studybuddies/core/services/auth_service.dart';
import 'package:studybuddies/ui/styles/theme.dart';
import 'package:studybuddies/ui/pages/splashscreen_page.dart';

void main() async {
  await dotenv.load(fileName: ".env");
  try {
    runApp(
      const MyApp(),
    );
  } catch (e) {
    if (e.toString().contains('Invalid session information')) {
      AuthService().logoutUser();
      runApp(
        const MyApp(),
      );
    }
  }
}

// ROOT
class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool isLoggedIn = false;

  @override
  Widget build(BuildContext context) {
    return CalendarControllerProvider(
      controller: EventController(),
      child: MaterialApp(
        title: 'studybuddies',
        theme: theme,
        home: const SplashScreenPage(),
      ),
    );
  }
}
