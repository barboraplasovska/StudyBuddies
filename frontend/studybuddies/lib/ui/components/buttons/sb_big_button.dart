// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';

/// Big button
///
/// @param title: String - title of the button
/// @param blueColor: bool - if True, button will be blue, else white
/// @param onPressed: Function? - action to be performed when button is pressed
/// @param isDisabled: bool? - if True, button will be disabled
class SBBigButton extends StatelessWidget {
  final String title;
  final bool blueColor;
  final Function()? onPressed;
  bool? isDisabled;
  final double? width;
  final bool? smallerText;

  SBBigButton(
      {super.key,
      required this.title,
      required this.blueColor,
      required this.onPressed,
      this.width,
      this.smallerText,
      this.isDisabled});

  @override
  Widget build(BuildContext context) {
    isDisabled ??= false;
    return Padding(
      padding: const EdgeInsets.all(0),
      child: FilledButton(
        onPressed: isDisabled == true ? null : onPressed,
        style: ButtonStyle(
          shape: MaterialStateProperty.all<RoundedRectangleBorder>(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          fixedSize: MaterialStateProperty.all<Size?>(
            Size.fromWidth(width ?? 270),
          ),
          overlayColor: MaterialStateColor.resolveWith(
            (Set<MaterialState> states) {
              if (blueColor) {
                return Colors.white.withOpacity(0.1);
              } else {
                return Theme.of(context).colorScheme.secondary.withOpacity(0.1);
              }
            },
          ),
          backgroundColor:
              MaterialStateColor.resolveWith((Set<MaterialState> states) {
            if (states.contains(MaterialState.disabled)) {
              return Theme.of(context).colorScheme.onSecondary;
            }
            if (blueColor) {
              return Theme.of(context).colorScheme.tertiary;
            } else {
              return Colors.white;
            }
          }),
          padding: MaterialStateProperty.all<EdgeInsetsGeometry>(
            const EdgeInsets.symmetric(horizontal: 15.0, vertical: 4.0),
          ),
        ),
        child: Text(
          title,
          style: TextStyle(
            fontSize: smallerText != null && smallerText! ? 18 : 25,
            color: blueColor
                ? Theme.of(context).colorScheme.onPrimary
                : Colors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
