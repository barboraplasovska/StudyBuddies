import 'package:flutter/material.dart';

/// Simple Back Arrow App Bar
class SimpleBackArrowAppBar extends StatelessWidget
    implements PreferredSizeWidget {
  const SimpleBackArrowAppBar({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Theme.of(context).colorScheme.primary,
      leading: IconButton(
        icon: const Icon(
          Icons.arrow_back_ios,
          color: Colors.white,
        ),
        onPressed: () => Navigator.pop(context),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
