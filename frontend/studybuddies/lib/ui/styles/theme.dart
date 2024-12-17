import 'package:flutter/material.dart';

final ThemeData theme = _theme();

ThemeData _theme() {
  final ThemeData base = ThemeData.light();

  return base.copyWith(
    dividerTheme: const DividerThemeData(
      color: Color(0xFFF2A949),
    ),
    colorScheme: base.colorScheme.copyWith(
      primary: const Color(0xFFF2A949),
      onPrimary: Colors.white,
      secondary: const Color(0xFF5F9DB3),
      onSecondary: const Color(0xFF686868), // disabled color
      tertiary: const Color(0xFF316778),
    ),
  );
}
