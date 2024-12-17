import 'package:flutter/material.dart';
import 'package:studybuddies/ui/pages/profile/settings_page.dart';

/// ProfileAppBar
///
/// Description: app bar for profile page, primary color title and settings button
class ProfileAppBar extends StatelessWidget implements PreferredSizeWidget {
  const ProfileAppBar({super.key});

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
        const Spacer(),
        IconButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SettingsPage()),
            );
          },
          icon: const Icon(Icons.settings),
        ),
      ],
      automaticallyImplyLeading: false,
      elevation: 0,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
