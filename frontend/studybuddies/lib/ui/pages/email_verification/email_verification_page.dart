import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:studybuddies/core/services/auth_service.dart';
import 'package:studybuddies/core/services/user_service.dart';
import 'package:studybuddies/ui/components/buttons/sb_big_button.dart';
import 'package:studybuddies/ui/components/buttons/sb_text_button.dart';
import 'package:studybuddies/ui/pages/email_verification/correct_email_verification_page.dart';

class EmailVerificationPage extends StatefulWidget {
  final String email;
  final bool isPasswordReset;

  EmailVerificationPage({required this.email, required this.isPasswordReset});

  @override
  _EmailVerificationPageState createState() => _EmailVerificationPageState();
}

class _EmailVerificationPageState extends State<EmailVerificationPage> {
  final FlutterSecureStorage storage = const FlutterSecureStorage();
  final AuthService authService = AuthService();
  final UserService userService = UserService();
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());

  // Create a list of FocusNodes for each TextField
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  // Timer variables for resend email feature
  Timer? _resendTimer;
  int _resendCooldown = 0; // Resend cooldown in seconds

  @override
  void initState() {
    super.initState();
    // Add listeners to each text field for real-time validation
    for (var controller in _controllers) {
      controller.addListener(isCodeValid);
    }
  }

  @override
  void dispose() {
    // Dispose controllers, focus nodes, and cancel any running timers
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var focusNode in _focusNodes) {
      focusNode.dispose();
    }
    _resendTimer?.cancel();
    super.dispose();
  }

  bool isCodeValid() {
    final RegExp numericRegex = RegExp(r'^[0-9]$');
    return _controllers.every((controller) {
      return controller.text.length == 1 &&
          numericRegex.hasMatch(controller.text);
    });
  }

  Future<bool> verifyEmail() async {
    final verificationCode =
        _controllers.map((controller) => controller.text).join();

    // If all fields are empty, show error message
    if (verificationCode.isEmpty) {
      _showErrorDialog(context, "You didn't enter the code.");
      return false;
    }

    if (!isCodeValid()) {
      _showErrorDialog(context, "Invalid code.");
      return false;
    }

    try {
      final int mailCode = int.parse(verificationCode);

      // Choose the correct service based on `isPasswordReset`
      if (widget.isPasswordReset) {
        await userService.validatePasswordReset(widget.email, mailCode);
      } else {
        await authService.getVerified(widget.email, verificationCode);
      }

      // If verification is successful, navigate to the success page
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => CorrectEmailVerificationPage(
            isPasswordReset: widget.isPasswordReset,
            email: widget.email,
          ),
        ),
      );
      return true;
    } catch (e) {
      _showErrorDialog(context, e.toString());
      return false;
    }
  }

  // Resend verification email and start cooldown timer
  void resendVerificationEmail() {
    if (_resendCooldown == 0) {
      userService.resendVerificationEmail(widget.email).then((_) {
        _startResendCooldown();
      }).catchError((error) {
        _showErrorDialog(context, "Failed to resend email: $error");
      });
    }
  }

  // Start the cooldown timer
  void _startResendCooldown() {
    setState(() {
      _resendCooldown = 30; // 30 seconds cooldown
    });

    _resendTimer = Timer.periodic(Duration(seconds: 1), (timer) {
      if (_resendCooldown == 0) {
        timer.cancel();
      } else {
        setState(() {
          _resendCooldown--;
        });
      }
    });
  }

  void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
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
      body: buildVerificationForm(),
    );
  }

  Widget buildVerificationForm() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Image.asset(
          "assets/imgs/envelope.png",
          width: 100,
        ),
        const SizedBox(height: 20),
        const Text(
          'Check your email',
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 10),
        const Text('We sent you a verification code to'),
        Text(
          widget.email,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: List.generate(6, (index) {
            return Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                border: Border.all(
                  color: Colors.orange,
                ),
                borderRadius: BorderRadius.circular(5),
              ),
              child: TextField(
                controller: _controllers[index],
                focusNode: _focusNodes[index], // Set the focus node
                textAlign: TextAlign.center,
                keyboardType: TextInputType.number,
                maxLength: 1,
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  counterText: '',
                ),
                onChanged: (value) {
                  if (value.length == 1 && index < 5) {
                    // Move to the next field when a number is entered
                    FocusScope.of(context).requestFocus(_focusNodes[index + 1]);
                  } else if (value.isEmpty && index > 0) {
                    // If backspace is pressed, move to the previous field
                    FocusScope.of(context).requestFocus(_focusNodes[index - 1]);
                  }
                },
              ),
            );
          }),
        ),
        const SizedBox(height: 20),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: SBBigButton(
            title: "Verify email",
            blueColor: true,
            width: 380,
            smallerText: true,
            onPressed: verifyEmail,
          ),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Padding(
              padding: EdgeInsets.only(right: 5),
              child: Text("Didn't receive email?"),
            ),
            SBTextButton(
              title: "Click to resend",
              color: _resendCooldown > 0
                  ? Colors.grey
                  : Theme.of(context).colorScheme.primary,
              onPressed: _resendCooldown > 0
                  ? null
                  : resendVerificationEmail, // Fix here
            ),
          ],
        ),
        if (_resendCooldown > 0)
          Text(
            "You can resend the email in $_resendCooldown seconds.",
            style: const TextStyle(color: Colors.grey),
          )
        else
          const SizedBox(height: 20),
      ],
    );
  }
}
