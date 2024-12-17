import 'package:flutter/material.dart';

/// HomeAppBar
///
/// Description: app bar for home page, primary color with logo
class HomeAppBar extends StatelessWidget implements PreferredSizeWidget {
  const HomeAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Theme.of(context).colorScheme.primary,
      foregroundColor: Colors.white,
      actions: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 10, 10),
          child: Image.asset(
            'assets/logo/studybuddies-logo2.png',
            height: 25,
          ),
        ),
        const Spacer()
      ],
      automaticallyImplyLeading: false,
      elevation: 0,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
