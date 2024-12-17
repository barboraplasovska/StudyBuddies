import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:studybuddies/app_router.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/ui/pages/welcome_page.dart';

class SplashScreenPage extends StatefulWidget {
  const SplashScreenPage({super.key});

  @override
  _SplashScreenPageState createState() => _SplashScreenPageState();
}

class _SplashScreenPageState extends State<SplashScreenPage>
    with SingleTickerProviderStateMixin {
  AnimationController? _controller;
  Animation<double>? _animation;

  final FlutterSecureStorage storage = const FlutterSecureStorage();

  final GroupService groupService = GroupService();

  @override
  void initState() {
    //TO DELETE ALL STORAGE
    //storage.deleteAll();
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    _animation = Tween(begin: 0.0, end: 1.0).animate(_controller!)
      ..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          _controller!.reverse();
        } else if (status == AnimationStatus.dismissed) {
          checkFirstSeen();
        }
      });
    _controller!.forward();
  }

  @override
  void dispose() {
    _controller!.dispose();
    super.dispose();
  }

  Future checkFirstSeen() async {
    final expireAt = await storage.read(key: 'expireAt');
    bool isLoggedIn = expireAt != null &&
        DateTime.now()
            .isBefore(DateTime.fromMillisecondsSinceEpoch(int.parse(expireAt)));

    try {
      await groupService.getGroupById(1);
    } catch (e) {
      if (e.toString().contains("Invalid session information")) {
        isLoggedIn = false;
      }
    }

    if (isLoggedIn) {
      Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const AppRouter()));
    } else {
      Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => WelcomeScreenPage()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.primary,
      body: FadeTransition(
        opacity: _animation!,
        child: Center(
          child: Image.asset('assets/logo/studybuddies-logo1.png'),
        ),
      ),
    );
  }
}
