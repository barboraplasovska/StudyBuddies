import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class SBFilterListTileDropdown extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<String> options;
  final String? value;
  final double? position;
  final bool? replaceTitle;
  final void Function(String?)? onChanged;
  final String hintText;
  final String defaultValue;

  SBFilterListTileDropdown({
    required this.title,
    required this.icon,
    required this.options,
    required this.defaultValue,
    this.replaceTitle = false,
    this.position,
    this.value,
    this.onChanged,
    this.hintText = 'Select an option',
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(
        icon,
        size: 28,
      ),
      title: Text(
        getTitle(),
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 16,
        ),
      ),
      subtitle: replaceTitle == true
          ? null
          : Text(
              value ?? hintText,
              style: const TextStyle(
                fontSize: 14,
              ),
            ),
      trailing: value != defaultValue
          ? IconButton(
              icon: const Icon(Icons.close),
              color: Colors.red,
              onPressed: () {
                onChanged!(defaultValue);
              },
            )
          : null,
      onTap: () {
        showMenu(
          context: context,
          position: RelativeRect.fromLTRB(0, position ?? 190, 0, 0),
          items: _buildMenuItems(),
        );
      },
    );
  }

  String getTitle() {
    if (replaceTitle == true) {
      return value ?? title;
    } else {
      return title;
    }
  }

  List<PopupMenuEntry<String>> _buildMenuItems() {
    List<PopupMenuEntry<String>> menuItems = [];
    for (int index = 0; index < options.length; index++) {
      menuItems.add(
        PopupMenuItem<String>(
          value: options[index],
          child: Text(options[index]),
          onTap: () {
            if (onChanged != null) {
              onChanged!(options[index]);
            }
          },
        ),
      );

      if (index != options.length - 1) {
        menuItems.add(const PopupMenuDivider());
      }
    }
    return menuItems;
  }
}
