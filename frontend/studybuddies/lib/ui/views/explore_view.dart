import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/event_filter_model.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/models/filters_model.dart';
import 'package:studybuddies/core/models/group_filter_model.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/models/search_type.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/core/services/event_service.dart';
import 'package:studybuddies/core/services/user_service.dart';
import 'package:studybuddies/ui/components/cards/sb_explore_event_card.dart';
import 'package:studybuddies/ui/components/cards/sb_explore_group_card.dart';
import 'package:studybuddies/ui/components/switches/sb_switch.dart';
import 'package:provider/provider.dart';

// ignore: must_be_immutable
class ExploreView extends StatefulWidget {
  final int myUserId;
  Function(SearchType)? onUpdateSearchType;

  ExploreView({
    super.key,
    required this.myUserId,
    required this.onUpdateSearchType,
  });

  @override
  State<ExploreView> createState() => _ExploreViewState();
}

class _ExploreViewState extends State<ExploreView> {
  final GroupService _groupService = GroupService();
  final EventService _eventService = EventService();
  final UserService _userService = UserService();

  late Future<List<GroupModel>> _groupsFuture;
  late Future<List<EventModel>> _eventsFuture;
  late Future<int?> _myUserIdFuture;

  late FiltersModel _filtersModel;

  SearchType searchType = SearchType.events;
  int selectedIndex = 0;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    _filtersModel = Provider.of<FiltersModel>(context, listen: true);
    _filtersModel.addListener(_fetchAll);

    _fetchAll();
  }

  @override
  void dispose() {
    _filtersModel.removeListener(_fetchAll);
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _myUserIdFuture = _userService.getUserId();
  }

  void _fetchEvents(EventFilterModel eventFilter) {
    if (mounted) {
      _eventsFuture = _eventService.getFilteredEvents(eventFilter);
    }
  }

  void _fetchGroups(GroupFilterModel groupFilter) {
    if (mounted) {
      _groupsFuture = _groupService.getFilteredGroups(groupFilter);
    }
  }

  void _fetchAll() {
    var filters = Provider.of<FiltersModel>(context, listen: false);
    if (mounted) {
      _fetchEvents(filters.eventFilter);
      _fetchGroups(filters.groupFilter);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _myUserIdFuture,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Center(
            child: Text('Error: ${snapshot.error}'),
          );
        }
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        }
        int myUserId = snapshot.data as int;
        return Padding(
          padding: const EdgeInsets.only(top: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Center(
                child: SBSwitch(
                  labels: const [
                    "Events",
                    "Groups",
                  ],
                  selectedLabelIndex: (int value) {
                    setState(() {
                      if (value == 1) {
                        searchType = SearchType.groups;
                        selectedIndex = 1;
                      } else {
                        searchType = SearchType.events;
                        selectedIndex = 0;
                      }
                    });
                    widget.onUpdateSearchType!(searchType);
                    _fetchAll();
                  },
                  selectedIndex: selectedIndex,
                ),
              ),
              if (searchType == SearchType.groups)
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: FutureBuilder(
                    future: _groupsFuture,
                    builder: (builder, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(
                          child: CircularProgressIndicator(),
                        );
                      }
                      if (snapshot.hasError) {
                        return Center(
                          child: Text("Error: ${snapshot.error.toString()}"),
                        );
                      }
                      List<GroupModel> groups =
                          snapshot.data as List<GroupModel>;
                      return ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: groups.length,
                        separatorBuilder: (context, index) => Divider(
                          color: Theme.of(context)
                              .colorScheme
                              .onSecondary
                              .withAlpha(60),
                          indent: 20,
                          endIndent: 20,
                        ),
                        itemBuilder: (BuildContext context, int index) {
                          return SBExploreGroupCard(
                            group: groups[index],
                            myUserId: myUserId,
                            forceUpdate: () {
                              _fetchAll();
                            },
                          );
                        },
                      );
                    },
                  ),
                )
              else if (searchType == SearchType.events)
                Expanded(
                  child: FutureBuilder<List<EventModel>>(
                    future: _eventsFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(
                          child: CircularProgressIndicator(),
                        );
                      }
                      if (snapshot.hasError) {
                        return Center(
                          child: Text('Error: ${snapshot.error.toString()}'),
                        );
                      }
                      if (!snapshot.hasData || snapshot.data!.isEmpty) {
                        return const Center(
                          child: Text('No events found'),
                        );
                      }
                      List<EventModel> events = snapshot.data ?? [];

                      return ListView.builder(
                        padding: const EdgeInsets.all(16.0),
                        itemCount: events.length,
                        itemBuilder: (context, index) {
                          final event = events[index];
                          return SBExploreEventCard(
                            event: event,
                            myUserId: myUserId,
                            forceUpdate: () {
                              _fetchAll();
                            },
                          );
                        },
                      );
                    },
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
