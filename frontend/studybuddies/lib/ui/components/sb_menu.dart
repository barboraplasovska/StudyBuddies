import 'package:flutter/material.dart';

/// Menu
///
/// Description: Navigation menu for the app
///
/// @param {int} pageIndex - The current page index
/// @param {Function} onItemSelected - Function to be called when an item is selected
class SBMenu extends StatefulWidget {
  final int pageIndex;
  final Function onItemSelected;
  const SBMenu({
    super.key,
    required this.pageIndex,
    required this.onItemSelected,
  });

  @override
  State<SBMenu> createState() => _SBMenuState();
}

class _SBMenuState extends State<SBMenu> {
  int currentPageIndex = 0;

  @override
  Widget build(BuildContext context) {
    currentPageIndex = widget.pageIndex;

    return NavigationBar(
      onDestinationSelected: (int index) {
        setState(() {
          currentPageIndex = index;
          widget.onItemSelected(index);
        });
      },
      indicatorColor: Theme.of(context).colorScheme.primary,
      selectedIndex: currentPageIndex,
      destinations: const <Widget>[
        NavigationDestination(
          icon: Icon(Icons.home),
          label: "Home",
        ),
        NavigationDestination(
          icon: Icon(Icons.search),
          label: "Explore",
        ),
        NavigationDestination(
          icon: Icon(Icons.calendar_month_sharp),
          label: "Calendar",
        ),
        NavigationDestination(
          icon: Icon(Icons.person),
          label: "Profile",
        )
      ],
    );
  }
}
