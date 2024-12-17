import 'package:calendar_view/calendar_view.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:studybuddies/core/models/filters_model.dart';
import 'package:studybuddies/core/models/search_type.dart';
import 'package:studybuddies/core/services/event_service.dart';
import 'package:studybuddies/core/services/exam_service.dart';
import 'package:studybuddies/core/services/user_service.dart';
import 'package:studybuddies/ui/appbars/calendar_app_bar.dart';
import 'package:studybuddies/ui/appbars/explore_app_bar.dart';
import 'package:studybuddies/ui/appbars/home_app_bart.dart';
import 'package:studybuddies/ui/appbars/profile_app_bar.dart';
import 'package:studybuddies/ui/components/sb_menu.dart';
import 'package:studybuddies/ui/views/calendar_view.dart';
import 'package:studybuddies/ui/views/explore_view.dart';
import 'package:studybuddies/ui/views/home_view.dart';
import 'package:studybuddies/ui/views/profile_view.dart';

class AppRouter extends StatefulWidget {
  const AppRouter({super.key});

  @override
  State<AppRouter> createState() => _AppRouterState();
}

class _AppRouterState extends State<AppRouter> {
  int currentPageIndex = 0;
  SearchType searchType = SearchType.events;
  bool isDayView = false;
  DateTime selectedDate = DateTime.now();

  EventService eventService = EventService();
  ExamService examService = ExamService();
  UserService userService = UserService();

  late EventController controller;
  late Future<int?> _myUserIdFuture;

  void updateCalendar() {
    eventService.addEventsToCalendar(
      controller,
      Theme.of(context).colorScheme.secondary,
    );

    examService.addExamsToCalendar(
      controller,
      Colors.purple.shade300,
    );
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    _myUserIdFuture = userService.getUserId();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    controller = CalendarControllerProvider.of(context).controller;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<int?>(
        future: _myUserIdFuture,
        builder: (builder, snapshot) {
          int? myUserId = snapshot.data;
          if (myUserId == null) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }
          return ChangeNotifierProvider<FiltersModel>(
            create: (_) => FiltersModel(),
            child: Scaffold(
              appBar: <PreferredSizeWidget?>[
                const HomeAppBar(),
                ExploreAppBar(
                  searchType: searchType,
                ),
                CalendarAppBar(
                  isDayView: isDayView,
                  onDateTap: () {
                    setState(() {
                      isDayView = false;
                    });
                  },
                  updateCalendar: updateCalendar,
                ),
                const ProfileAppBar(),
              ][currentPageIndex],
              bottomNavigationBar: SBMenu(
                  pageIndex: currentPageIndex,
                  onItemSelected: (int index) {
                    setState(() {
                      currentPageIndex = index;
                    });
                  }),
              body: <Widget>[
                HomeView(
                  myUserId: myUserId,
                ),
                ExploreView(
                  onUpdateSearchType: (newType) {
                    setState(() {
                      searchType = newType;
                    });
                  },
                  myUserId: myUserId,
                ),
                CalendarView(
                  isDayView: isDayView,
                  selectedDate: selectedDate,
                  onDateSelected: (date) {
                    setState(() {
                      selectedDate = date;
                      isDayView = true;
                    });
                  },
                  onBackToMonthView: () {
                    setState(() {
                      isDayView = false;
                    });
                  },
                  updateCalendar: updateCalendar,
                  myUserId: myUserId,
                ),
                const ProfileView(),
              ][currentPageIndex],
            ),
          );
        });
  }
}
