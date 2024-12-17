import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/filters_model.dart';
import 'package:studybuddies/ui/appbars/simple_title_app_bar.dart';
import 'package:studybuddies/ui/components/buttons/sb_text_button.dart';
import 'package:studybuddies/ui/components/list_tiles/sb_filters_listtile_calendar_selector.dart';
import 'package:studybuddies/ui/components/list_tiles/sb_filters_listtile_dropdown.dart';

class FilterEventsPage extends StatefulWidget {
  final FiltersModel initialFilter;
  const FilterEventsPage({
    super.key,
    required this.initialFilter,
  });

  @override
  State<FilterEventsPage> createState() => _FilterEventsPageState();
}

class _FilterEventsPageState extends State<FilterEventsPage> {
  late String _sortBy;
  late bool _yourGroupsOnly;
  late DateTime? _date;
  late String? _time;

  @override
  void initState() {
    super.initState();
    _sortBy = widget.initialFilter.eventFilter.sortBy;
    _yourGroupsOnly = widget.initialFilter.eventFilter.yourGroupsOnly;
    _date = widget.initialFilter.eventFilter.date;
    _time = widget.initialFilter.eventFilter.time;
  }

  void _applyFilters() {
    widget.initialFilter.updateEventFilter(
      newSortBy: _sortBy,
      newDate: _date,
      newTime: _time,
      newYourGroupsOnly: _yourGroupsOnly,
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: SimpleTitleAppBar(
        title: "Filter events",
        actionTitle: "Apply",
        action: _applyFilters,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SBFilterListTileDropdown(
            title: "Sort by",
            defaultValue: "Alphabetically",
            icon: Icons.sort,
            options: const ["Alphabetically", "Event date", "Popularity"],
            value: _sortBy,
            onChanged: (newValue) {
              setState(() {
                _sortBy = newValue!;
              });
            },
          ),
          Divider(
            color: Theme.of(context).colorScheme.onSecondary.withAlpha(60),
            indent: 15,
            endIndent: 15,
          ),
          SBFiltersListTileCalendarSelector(
            selectDate: true,
            value: _date,
            onChanged: (newDate) {
              setState(() {
                _date = newDate;
              });
            },
          ),
          Divider(
            color: Theme.of(context).colorScheme.onSecondary.withAlpha(60),
            indent: 15,
            endIndent: 15,
          ),
          SBFilterListTileDropdown(
            title: "Any time",
            icon: Icons.access_time,
            position: 330,
            replaceTitle: true,
            options: const ["Morning", "Afternoon", "Evening"],
            value: _time,
            defaultValue: "Any time",
            onChanged: (newTimeString) {
              setState(() {
                _time = newTimeString;
              });
            },
          ),
          Divider(
            color: Theme.of(context).colorScheme.onSecondary.withAlpha(60),
            indent: 15,
            endIndent: 15,
          ),
          ListTile(
            title: const Text(
              "Your groups only",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            trailing: Switch(
              value: _yourGroupsOnly,
              onChanged: (bool value) {
                setState(() {
                  _yourGroupsOnly = value;
                });
              },
            ),
          ),
          Divider(
            color: Theme.of(context).colorScheme.onSecondary.withAlpha(60),
            indent: 15,
            endIndent: 15,
          ),
          const SizedBox(height: 20),
          Center(
            child: SBTextButton(
              title: "Reset filters",
              color: Theme.of(context).colorScheme.primary,
              onPressed: () {
                setState(() {
                  _sortBy = 'Alphabetically';
                  _yourGroupsOnly = false;
                  _date = null;
                  _time = "Any time";
                });
              },
            ),
          ),
        ],
      ),
    );
  }
}
