import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/models/exam_model.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/services/exam_service.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/core/services/event_service.dart';
import 'package:studybuddies/ui/components/cards/sb_event_card.dart';
import 'package:studybuddies/ui/components/cards/sb_exam_card.dart';
import 'package:studybuddies/ui/components/cards/sb_group_card.dart';
import 'package:studybuddies/ui/components/buttons/sb_text_button.dart';
import 'package:studybuddies/ui/pages/groups/new_group_page.dart';
import 'package:studybuddies/ui/pages/splashscreen_page.dart';

class HomeView extends StatefulWidget {
  final int myUserId;

  const HomeView({
    super.key,
    required this.myUserId,
  });

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  final GroupService _groupService = GroupService();
  final EventService _eventService = EventService();
  final ExamService _examService = ExamService();
  late Future<List<GroupModel>> _groupsFuture;
  late Future<List<EventModel>> _eventsFuture;
  late Future<List<ExamModel>> _examsFuture;
  late Future<EventModel?> _nextEventFuture;

  @override
  void initState() {
    super.initState();
    setFutures();
  }

  void setFutures() async {
    try {
      _groupsFuture = _groupService.getUserGroups();
      _eventsFuture = _eventService.getEvents();
      _examsFuture = _examService.getUserExams();
      _nextEventFuture = _eventService.getUsersNextEvent();
    } catch (e) {
      if (e is Exception &&
          (e.toString().contains('Invalid session information') ||
              e.toString().contains("Invalid JWT"))) {
        Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => const SplashScreenPage()));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<EventModel>>(
      future: _eventsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        } else if (snapshot.hasError) {
          return Center(
            child: Text(
              'Error: ${snapshot.error}',
            ),
          );
        } else {
          var events = snapshot.data ?? [];
          return SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Your groups",
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 20,
                        ),
                      ),
                      SBTextButton(
                        title: "New group",
                        leadingIcon: Icons.add,
                        color: Theme.of(context).colorScheme.tertiary,
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const NewGroupPage(),
                            ),
                          ).then((_) {
                            // Refresh groups after returning from NewGroupPage
                            try {
                              setState(() {
                                _groupsFuture = _groupService.getUserGroups();
                              });
                            } catch (e) {
                              if (e is Exception &&
                                  e.toString().contains(
                                      'Invalid session information')) {
                                Navigator.of(context).pushReplacement(
                                    MaterialPageRoute(
                                        builder: (context) =>
                                            const SplashScreenPage()));
                              }
                            }
                          });
                        },
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(15, 0, 0, 10),
                  child: FutureBuilder<List<GroupModel>>(
                    future: _groupsFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      } else if (snapshot.hasError) {
                        return Center(child: Text('Error: ${snapshot.error}'));
                      } else {
                        var groups = snapshot.data ?? [];
                        if (groups.isEmpty) {
                          return const Center(
                              child: Text('Join a group to see it here'));
                        } else {
                          return SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: groups.map((group) {
                                return SBGroupCard(
                                  group: group,
                                  events: events,
                                  updateGroupCallback: () {
                                    setState(() {
                                      setFutures();
                                    });
                                  },
                                  myUserId: widget.myUserId,
                                );
                              }).toList(),
                            ),
                          );
                        }
                      }
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Upcoming exams",
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 20,
                        ),
                      ),
                      FutureBuilder(
                          future: _examsFuture,
                          builder: (builder, snapshot) {
                            if (snapshot.connectionState ==
                                ConnectionState.waiting) {
                              return const Center(
                                child: CircularProgressIndicator(),
                              );
                            } else if (snapshot.hasError) {
                              return Center(
                                child: Text(
                                  'Error: ${snapshot.error}',
                                ),
                              );
                            } else {
                              List<ExamModel> exams = snapshot.data ?? [];
                              if (exams.isEmpty) {
                                return const Text('No upcoming exams.');
                              } else {
                                return ListView.builder(
                                  shrinkWrap: true,
                                  itemCount: exams.length,
                                  itemBuilder: (context, index) {
                                    return SBExamCard(
                                      exam: exams[index],
                                    );
                                  },
                                );
                              }
                            }
                          })
                    ],
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.only(left: 20),
                  child: Text(
                    "Your next event",
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 20,
                    ),
                  ),
                ),
                FutureBuilder(
                  future: _nextEventFuture,
                  builder: (context, snapshot) {
                    EventModel? nextEvent = snapshot.data;
                    if (nextEvent != null) {
                      return SBEventCard(
                          event: nextEvent,
                          myUserId: widget.myUserId,
                          forceUpdate: () {
                            setFutures();
                          });
                    } else {
                      return const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 20),
                        child: Text('No upcoming event'),
                      );
                    }
                  },
                ),
              ],
            ),
          );
        }
      },
    );
  }
}
