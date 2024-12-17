import 'package:flutter/material.dart';

/// Small button
///
/// @param title: String - title of the button
/// @param onPressed: Function? - action to be performed when button is pressed
/// @param isDisabled: bool? - if True, button will be disabled
// ignore: must_be_immutable
class SBSmallButton extends StatelessWidget {
  final String title;
  final Function()? onPressed;
  final Color? color;
  bool? isDisabled;

  SBSmallButton(
      {super.key,
      required this.title,
      this.color,
      required this.onPressed,
      this.isDisabled});

  @override
  Widget build(BuildContext context) {
    isDisabled ??= false;
    return GestureDetector(
      onTap: isDisabled == true ? null : onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isDisabled == true
              ? Theme.of(context).colorScheme.onSecondary
              : (color ?? Theme.of(context).colorScheme.primary),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          title,
          style: TextStyle(
            fontSize: 14,
            color: Theme.of(context).colorScheme.onPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
