import 'package:flutter/material.dart';

/// Buttons Tab
///
/// Description: used with SB Switch
///
/// @param title: String? - title of the tab
/// @param onPressed: Function? - action to be performed when tab is pressed
/// @param width: double? - width of the tab
/// @param isSelected: bool? - if True, tab will be selected
class SBButtonsTab extends StatelessWidget {
  const SBButtonsTab({
    super.key,
    this.title,
    this.onPressed,
    required this.width,
    this.isSelected,
  });

  final String? title;
  final Function? onPressed;
  final double? width;
  final bool? isSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: 50,
      child: Container(
        margin: EdgeInsets.zero,
        decoration: isSelected!
            ? BoxDecoration(
                borderRadius: BorderRadius.circular(15),
                color: Theme.of(context).colorScheme.tertiary.withAlpha(140),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    offset: Offset(0.0, 1.5),
                    blurRadius: 1.0,
                    spreadRadius: 1.0,
                  ),
                ],
              )
            : null,
        child: TextButton(
          onPressed: onPressed as void Function()?,
          style: ButtonStyle(
            shape: MaterialStateProperty.all(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
            ),
            padding: MaterialStateProperty.all(EdgeInsets.zero),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                title!,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                  fontSize: 20,
                ),
                textAlign: TextAlign.center,
              )
            ],
          ),
        ),
      ),
    );
  }
}
