import 'package:flutter/material.dart';

/// Simple title app bar
///
/// Description: This widget is a simple app bar with a title.
///
/// @param: title: String - the title of the app bar
/// @param: actionTitle: String? - title of an action that will be displayed trailing in the app bar
/// @param: action: void Function()? - function that will be called when the action is pressed
class SimpleTitleAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String? actionTitle;
  final void Function()? action;

  const SimpleTitleAppBar({
    super.key,
    required this.title,
    this.actionTitle,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(title),
      centerTitle: false,
      actions: action != null
          ? [
              TextButton(
                onPressed: action,
                child: Text(
                  actionTitle ?? "Caca",
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              )
            ]
          : null,
      titleSpacing: 0,
      backgroundColor: Theme.of(context).colorScheme.primary,
      foregroundColor: Colors.white,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
