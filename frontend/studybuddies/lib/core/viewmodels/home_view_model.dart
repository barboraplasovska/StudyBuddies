import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class HomeViewModel extends ChangeNotifier {
  HomeViewModel({required this.authService});

  final AuthService authService;

  // Future<void> signOut() async {
  //   await authService.signOut();
  // }
}
