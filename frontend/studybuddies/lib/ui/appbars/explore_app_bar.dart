import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:provider/provider.dart';
import 'package:studybuddies/core/models/filters_model.dart';
import 'package:studybuddies/core/models/search_type.dart';
import 'package:studybuddies/ui/pages/explore_filters/filter_events_page.dart';
import 'package:studybuddies/ui/pages/explore_filters/filter_groups_page.dart';

class ExploreAppBar extends StatefulWidget implements PreferredSizeWidget {
  final SearchType searchType;

  const ExploreAppBar({
    super.key,
    required this.searchType,
  });

  @override
  State<ExploreAppBar> createState() => _ExploreAppBarState();

  @override
  Size get preferredSize => const Size.fromHeight(150);
}

class _ExploreAppBarState extends State<ExploreAppBar> {
  String _currentCity = "Paris";
  bool _isLocating = false;

  late FiltersModel filter;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Access the provider here, since this method is called after the widget is built
    filter = Provider.of<FiltersModel>(context);
  }

  // Method to get the current location and update the city
  Future<void> _getCurrentLocation() async {
    setState(() {
      _isLocating = true;
    });

    bool serviceEnabled;
    LocationPermission permission;

    // Check if location services are enabled
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      // Location services are not enabled
      setState(() {
        _isLocating = false;
      });
      return;
    }

    // Request location permissions
    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        // Permissions are denied
        setState(() {
          _isLocating = false;
        });
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      // Permissions are permanently denied
      setState(() {
        _isLocating = false;
      });
      return;
    }

    // Get the current position
    Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);

    // Reverse geocode to get the city name
    List<Placemark> placemarks =
        await placemarkFromCoordinates(position.latitude, position.longitude);

    if (placemarks.isNotEmpty) {
      Placemark place = placemarks[0];
      setState(() {
        _currentCity = place.locality ?? "Unknown";
        _isLocating = false;
      });
    }
  }

  void _navigateToFilterPage(FiltersModel filter) async {
    if (widget.searchType == SearchType.groups) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => FilterGroupsPage(
            initialFilter: filter,
          ),
        ),
      );
    } else {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => FilterEventsPage(
            initialFilter: filter,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppBar(
      automaticallyImplyLeading: false,
      backgroundColor: Theme.of(context).colorScheme.primary,
      toolbarHeight: 150, // Increase the height of the AppBar
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search bar with underline style
          Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search',
                    prefixIcon: const Icon(
                      Icons.search,
                      color: Colors.white,
                      size: 35,
                    ),
                    focusedBorder: UnderlineInputBorder(
                      borderSide: BorderSide(
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                    ),
                    enabledBorder: const UnderlineInputBorder(
                      borderSide: BorderSide(
                        color: Colors.white,
                      ),
                    ),
                    border: const UnderlineInputBorder(
                      borderSide: BorderSide(
                        color: Colors.white,
                      ),
                    ),
                    hintStyle: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                    ),
                  ),
                ),
              ),
              IconButton(
                iconSize: 35,
                icon: const Icon(
                  Icons.tune,
                  color: Colors.white,
                ),
                onPressed: () {
                  _navigateToFilterPage(filter);
                },
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Location dropdown row
          Row(
            children: [
              IconButton(
                iconSize: 35,
                icon: const Icon(
                  Icons.my_location,
                  color: Colors.white,
                ),
                onPressed: _isLocating
                    ? null // Disable while locating
                    : () => _getCurrentLocation(), // Fetch location on click
              ),
              const SizedBox(width: 8),
              _isLocating
                  ? const CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ) // Show loader when locating
                  : Text(
                      _currentCity,
                      style: const TextStyle(
                        color: Colors.white,
                      ),
                    ),
              const SizedBox(
                width: 4,
              ),
              const Icon(
                Icons.arrow_drop_down,
                color: Colors.white,
                size: 35,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
