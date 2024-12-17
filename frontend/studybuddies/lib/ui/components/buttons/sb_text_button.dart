import 'package:flutter/material.dart';

/// Text button
///
/// @param title: String - title of the button
/// @param color: Color - color of the button
/// @param leadingIcon: IconData? - icon to be displayed before the title
/// @param onPressed: Function - action to be performed when button is pressed
class SBTextButton extends StatelessWidget {
  final String title;
  final Color color;
  final IconData? leadingIcon;
  final double? fontSize;
  final VoidCallback? onPressed;

  const SBTextButton({
    Key? key,
    required this.title,
    required this.color,
    this.leadingIcon,
    this.fontSize,
    required this.onPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextButton(
      style: ButtonStyle(
        padding: MaterialStateProperty.all(EdgeInsets.zero),
        shape: MaterialStateProperty.all<OutlinedBorder>(
          RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        overlayColor: MaterialStateColor.resolveWith(
          (Set<MaterialState> states) {
            return color.withOpacity(0.05);
          },
        ),
      ),
      onPressed: onPressed,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (leadingIcon != null)
            Icon(
              leadingIcon,
              color: color,
            ),
          if (leadingIcon != null) const SizedBox(width: 8),
          Text(
            title,
            style: TextStyle(
              color: color,
              fontSize: fontSize ?? 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
