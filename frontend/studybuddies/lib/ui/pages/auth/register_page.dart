import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/credential_info_model.dart';
import 'package:studybuddies/core/models/user_info_model.dart';
import 'package:studybuddies/core/services/auth_service.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:studybuddies/ui/components/textfields/sb_textfield.dart';
import 'package:studybuddies/ui/pages/email_verification/email_verification_page.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({Key? key}) : super(key: key);

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final AuthService _authService = AuthService();
  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController repeatPasswordController =
      TextEditingController();

  bool isFormValid = false;

  @override
  void initState() {
    super.initState();
    nameController.addListener(validateForm);
    emailController.addListener(validateForm);
    passwordController.addListener(validateForm);
    repeatPasswordController.addListener(validateForm);
  }

  @override
  void dispose() {
    nameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    repeatPasswordController.dispose();
    super.dispose();
  }

  void validateForm() {
    setState(() {
      isFormValid = nameController.text.isNotEmpty &&
          emailController.text.isNotEmpty &&
          passwordController.text.isNotEmpty &&
          repeatPasswordController.text.isNotEmpty &&
          passwordController.text == repeatPasswordController.text;
    });
  }

  void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Error In Response'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  void register() async {
    if (isFormValid) {
      final userInfo = UserInfo(
        name: nameController.text,
        description: "",
        roleId: "2",
        picture:
            "https://picsum.photos/200/300?random=${nameController.text.length}",
      );
      final credentialInfo = CredentialInfo(
        email: emailController.text,
        password: passwordController.text,
      );

      try {
        await _authService.registerUser(userInfo, credentialInfo);
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => EmailVerificationPage(
              email: emailController.text,
              isPasswordReset: false,
            ),
          ),
        );
      } catch (e) {
        _showErrorDialog(context, e.toString());
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: Column(
        children: [
          Container(
            height: 150,
            color: Theme.of(context).colorScheme.primary,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                IconButton(
                  icon: const Icon(
                    Icons.chevron_left,
                    size: 40,
                  ),
                  color: Colors.white,
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Image.asset(
                    'assets/logo/studybuddies-logo1.png',
                    height: 60,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 80),
                    const Padding(
                      padding: EdgeInsets.only(bottom: 20),
                      child: Text(
                        "Register",
                        style: TextStyle(
                          fontSize: 40,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    SBTextField(
                      labelText: 'Name',
                      hintText: 'Enter your name and surname',
                      controller: nameController,
                      type: TextFieldType.text,
                    ),
                    SBTextField(
                      labelText: 'School email',
                      hintText: 'Enter your school email',
                      controller: emailController,
                      type: TextFieldType.email,
                    ),
                    SBTextField(
                      labelText: 'Password',
                      hintText: 'Enter your password',
                      controller: passwordController,
                      type: TextFieldType.password,
                    ),
                    SBTextField(
                      labelText: "Repeat Password",
                      hintText: 'Repeat your password',
                      controller: repeatPasswordController,
                      type: TextFieldType.password,
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          SBSmallButton(
                            title: "Register",
                            onPressed: register,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
