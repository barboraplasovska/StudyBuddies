import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/filters_model.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/ui/appbars/simple_title_app_bar.dart';
import 'package:studybuddies/ui/components/buttons/sb_text_button.dart';
import 'package:studybuddies/ui/components/list_tiles/sb_filters_listtile_dropdown.dart';

class FilterGroupsPage extends StatefulWidget {
  final FiltersModel initialFilter;

  const FilterGroupsPage({
    super.key,
    required this.initialFilter,
  });

  @override
  State<FilterGroupsPage> createState() => _FilterGroupsPageState();
}

class _FilterGroupsPageState extends State<FilterGroupsPage> {
  final GroupService groupService = GroupService();
  String _sortBy = 'Alphabetically';
  int? _schoolId = null;
  String _schoolName = 'All schools';

  late Future<List<GroupModel>> schoolsFuture;

  @override
  void initState() {
    super.initState();
    _sortBy = widget.initialFilter.groupFilter.sortBy;
    _schoolId = widget.initialFilter.groupFilter.schoolId;

    schoolsFuture = groupService.getSchools();
  }

  void _applyFilters() {
    widget.initialFilter.updateGroupFilter(
      newSortBy: _sortBy,
      newSchoolId: _schoolId,
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: SimpleTitleAppBar(
        title: "Filter groups",
        actionTitle: "Apply",
        action: _applyFilters,
      ),
      body: FutureBuilder(
        future: schoolsFuture,
        builder: (builder, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return const Center(child: Text('An error occurred'));
          }

          final schools = snapshot.data as List<GroupModel>;

          if (_schoolId != null) {
            _schoolName =
                schools.firstWhere((school) => school.id == _schoolId).name;
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SBFilterListTileDropdown(
                title: "Sort by",
                defaultValue: "Alphabetically",
                icon: Icons.sort,
                options: const ["Alphabetically", "Popularity"],
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
              SBFilterListTileDropdown(
                title: "Filter by school",
                defaultValue: "All schools",
                icon: Icons.sort,
                options: [
                  'All schools',
                  ...schools.map((school) => school.name)
                ],
                value: _schoolName,
                onChanged: (newValue) {
                  setState(() {
                    _schoolName = newValue!;
                    if (_schoolName != "All schools") {
                      _schoolId = schools
                          .firstWhere((school) => school.name == _schoolName)
                          .id;
                    } else {
                      _schoolId = null;
                    }
                  });
                },
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
                        _schoolId = null;
                        _schoolName = 'All schools';
                      });
                    }),
              ),
            ],
          );
        },
      ),
    );
  }
}
