import 'package:flutter/material.dart';

class SBDropdownMenu extends StatelessWidget {
  final Map<String, Function?> items;
  final double? width;
  final Icon? icon;

  const SBDropdownMenu({
    required this.items,
    this.width,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    Icon _icon = icon ??
        const Icon(
          Icons.more_vert,
        );
    return PopupMenuButton<dynamic>(
      icon: _icon,
      itemBuilder: (BuildContext context) {
        List<PopupMenuEntry<dynamic>> menuItems = [];
        var index = 0;

        items.forEach((key, value) {
          menuItems.add(
            PopupMenuItem<dynamic>(
              value: value,
              child: InkWell(
                onTap: () {
                  Navigator.pop(context);
                  if (value != null) value();
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: SizedBox(
                    width: width,
                    child: Text(key),
                  ),
                ),
              ),
            ),
          );

          // Add divider between items except the last one
          if (index != items.length - 1) {
            menuItems.add(const PopupMenuDivider());
          }
          index++;
        });

        return menuItems;
      },
      onSelected: (dynamic value) {
        if (value != null) value();
      },
      offset: Offset(0, 40),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
    );
  }
}
