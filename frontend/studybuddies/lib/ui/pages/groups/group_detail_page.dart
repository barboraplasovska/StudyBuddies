import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/core/services/event_service.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/core/utils/utils.dart';
import 'package:studybuddies/ui/appbars/group_detail_app_bar.dart';
import 'package:studybuddies/ui/appbars/simple_back_arrow_app_bar.dart';
import 'package:studybuddies/ui/components/cards/sb_group_event_card.dart';
import 'package:studybuddies/ui/components/widgets/sb_group_members_widget.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:studybuddies/ui/pages/groups/edit_group_page.dart';
import 'package:studybuddies/ui/pages/groups/membership_requests_page.dart';
import 'package:studybuddies/ui/pages/splashscreen_page.dart';

import '../../../core/models/event_model.dart';
import '../../../core/models/group_model.dart';

class GroupDetailPage extends StatefulWidget {
  final GroupModel group;
  final List<EventModel> events;
  final bool isMyGroup;
  final int myUserId;

  const GroupDetailPage({
    super.key,
    required this.group,
    required this.events,
    required this.isMyGroup,
    required this.myUserId,
  });

  @override
  State<GroupDetailPage> createState() => _GroupDetailPageState();
}

class _GroupDetailPageState extends State<GroupDetailPage> {
  final GroupService _groupService = GroupService();
  final EventService _eventService = EventService();

  late Future<List<UserModel>> membershipRequestsFuture;
  late Future<List<bool>> isOnWaitingListsFuture;
  late Future<GroupModel?> schoolFuture;
  late GroupModel group;
  late List<EventModel> events;

  @override
  void initState() {
    membershipRequestsFuture =
        _groupService.getGroupWaitingList(widget.group.id!);
    isOnWaitingListsFuture = _eventService
        .isOnWaitingLists(widget.events.map((event) => event.id!).toList());

    schoolFuture = _groupService.getSchoolById(widget.group.parentId);
    group = widget.group;
    events = [];
    for (var event in widget.events) {
      if (event.groupId == widget.group.id) {
        events.add(event);
      }
    }
    super.initState();
  }

  void updateFutures() {
    setState(() {
      membershipRequestsFuture =
          _groupService.getGroupWaitingList(widget.group.id!);
      isOnWaitingListsFuture = _eventService
          .isOnWaitingLists(widget.events.map((event) => event.id!).toList());
      schoolFuture = _groupService.getSchoolById(widget.group.parentId);
    });
  }

  Widget _myGroupWidget() {
    return FutureBuilder(
      future: membershipRequestsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }
        List<UserModel> membershipRequests = snapshot.data as List<UserModel>;
        UserModel myUser = widget.group.users.firstWhere(
          (user) => user.id == widget.myUserId,
        );

        return Scaffold(
          appBar: GroupDetailAppBar(
            myUser: myUser,
            nbMembershipReq: membershipRequests.length,
            onClickMembershipReq: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => MembershipRequestsPage(
                    membershipRequests: membershipRequests,
                    groupId: group.id!,
                    myUser: myUser,
                  ),
                ),
              ).then((_) async {
                // Refresh membership requests
                try {
                  GroupModel newGroup =
                      await _groupService.getGroupById(group.id!);
                  setState(() {
                    membershipRequestsFuture =
                        _groupService.getGroupWaitingList(group.id!);
                    group = newGroup;
                  });
                } catch (e) {
                  if (e is Exception &&
                      e.toString().contains('Invalid session information')) {
                    Navigator.of(context).pushReplacement(MaterialPageRoute(
                        builder: (context) => SplashScreenPage()));
                  }
                }
              });
            },
            leaveGroup: () {
              _groupService.leaveGroup(widget.group.id!).then((value) {
                if (value) {
                  Navigator.pop(context);
                }
              });
            },
            group: group,
          ),
          body: ListView(
            children: <Widget>[
              SizedBox(
                height: 230,
                width: MediaQuery.of(context).size.width,
                child: Image.network(
                  group.getPicture(),
                  fit: BoxFit.cover,
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(left: 20),
                        child: Text(
                          truncateText(group.name, maxLength: 25),
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 22,
                          ),
                        ),
                      ),
                      IconButton(
                        padding: const EdgeInsets.only(right: 10),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => EditGroupPage(group: group),
                            ),
                          ).then((value) async {
                            GroupModel newGroup =
                                await _groupService.getGroupById(group.id!);
                            setState(() {
                              group = newGroup;
                            });
                          });
                        },
                        icon: const Icon(Icons.edit),
                      ),
                    ],
                  ),
                  FutureBuilder<GroupModel?>(
                    future: schoolFuture,
                    builder: (builder, snapshot) {
                      var school = snapshot.data;
                      if (school != null) {
                        return Padding(
                          padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                          child: Text(
                            school.name,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                        );
                      }
                      return const SizedBox();
                    },
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          group.description,
                          textAlign: TextAlign.justify,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.tertiary,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        if (group.users.length > 1)
                          SBGroupMembersWidget(
                            members: group.users,
                            groupId: group.id!,
                            isUserGroupOwner: group.isOwner(widget.myUserId),
                            myUser: group.users.firstWhere(
                              (user) => user.id == widget.myUserId,
                            ),
                          ),
                        Divider(
                          color: Theme.of(context)
                              .colorScheme
                              .onSecondary
                              .withAlpha(60),
                        ),
                        const Padding(
                          padding: EdgeInsets.only(bottom: 10),
                          child: Text(
                            "Events",
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 18,
                            ),
                          ),
                        ),
                        FutureBuilder<List<bool>>(
                            future: isOnWaitingListsFuture,
                            builder: (builder, snapshot) {
                              if (snapshot.connectionState ==
                                  ConnectionState.waiting) {
                                return const Center(
                                    child: CircularProgressIndicator());
                              }

                              var isOnWaitingList = snapshot.data ??
                                  events.map((event) => false).toList();
                              return ListView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: events.length,
                                itemBuilder: (BuildContext context, int index) {
                                  return SBGroupEventCard(
                                    event: events[index],
                                    groupName: group.name,
                                    isOnWaitingList: isOnWaitingList[index],
                                    going: events[index].users?.any(
                                              (user) =>
                                                  user.id == widget.myUserId,
                                            ) ??
                                        false,
                                    isMyGroupEvent:
                                        group.id == events[index].groupId,
                                    myUserId: widget.myUserId,
                                    forceUpdate: () {
                                      updateFutures();
                                    },
                                  );
                                },
                              );
                            })
                      ],
                    ),
                  )
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _notMyGroupWidget() {
    return Scaffold(
      appBar: SimpleBackArrowAppBar(),
      body: Column(
        children: [
          SizedBox(
            height: 230,
            width: MediaQuery.of(context).size.width,
            child: Image.network(
              group.getPicture(),
              fit: BoxFit.cover,
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
              child: Stack(
                children: [
                  ListView(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                group.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 22,
                                ),
                              ),
                              // Text(
                              //   widget.group.school,
                              //   style: const TextStyle(
                              //     fontWeight: FontWeight.w600,
                              //     fontSize: 14,
                              //   ),
                              // ), // FIXME: (backend): school is not in the group model
                            ],
                          ),
                          Text(
                            group.description,
                            textAlign: TextAlign.justify,
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.tertiary,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          if (group.users.length > 1)
                            Padding(
                              padding: const EdgeInsets.only(right: 20),
                              child: Text(
                                "${group.users.length} members",
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          Divider(
                            color: Theme.of(context)
                                .colorScheme
                                .onSecondary
                                .withAlpha(60),
                          ),
                          const Padding(
                            padding: EdgeInsets.only(bottom: 10),
                            child: Text(
                              "Events",
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 18,
                              ),
                            ),
                          ),
                          FutureBuilder<List<bool>>(
                              future: isOnWaitingListsFuture,
                              builder: (builder, snapshot) {
                                if (snapshot.connectionState ==
                                    ConnectionState.waiting) {
                                  return const Center(
                                      child: CircularProgressIndicator());
                                }

                                var isOnWaitingList = snapshot.data ??
                                    events.map((event) => false).toList();
                                return ListView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: events.length,
                                  itemBuilder:
                                      (BuildContext context, int index) {
                                    return SBGroupEventCard(
                                      event: events[index],
                                      groupName: group.name,
                                      isOnWaitingList: isOnWaitingList[index],
                                      going: false,
                                      isMyGroupEvent: false,
                                      myUserId: widget.myUserId,
                                      forceUpdate: () {
                                        updateFutures();
                                      },
                                    );
                                  },
                                );
                              })
                        ],
                      ),
                    ],
                  ),
                  Positioned(
                    bottom: 20,
                    right: 5,
                    child: SBSmallButton(
                      title: "Ask to join",
                      onPressed: () {
                        _groupService.joinGroupWaitingList(widget.group.id!);
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isMyGroup) {
      return _myGroupWidget();
    }
    return _notMyGroupWidget();
  }
}
