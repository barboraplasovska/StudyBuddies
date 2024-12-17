import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/services/event_service.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:studybuddies/ui/pages/groups/group_detail_page.dart';

class SBExploreGroupCard extends StatefulWidget {
  final Function() forceUpdate;
  final GroupModel group;
  final int myUserId;
  const SBExploreGroupCard({
    super.key,
    required this.group,
    required this.myUserId,
    required this.forceUpdate,
  });

  @override
  State<SBExploreGroupCard> createState() => _SBExploreGroupCardState();
}

class _SBExploreGroupCardState extends State<SBExploreGroupCard> {
  late Future<List<EventModel>> _eventsFuture;
  EventService _eventService = EventService();
  GroupService _groupService = GroupService();

  late Future<int?> _groupRoleId;

  late Future<bool> _userInWaitingListFuture;

  bool isUserMember = true;

  @override
  void initState() {
    super.initState();
    _eventsFuture = _eventService.getEventsOfGroup(widget.group.id!);
    _groupRoleId = _groupService.getGroupRoleId(widget.group, widget.myUserId);

    _userInWaitingListFuture = _groupService.isUserInGroupWaitingList(
        widget.group.id!, widget.myUserId);

    isUserMember =
        widget.group.users.any((element) => element.id == widget.myUserId);
  }

  @override
  void didChangeDependencies() {
    // TODO: implement didChangeDependencies
    super.didChangeDependencies();
    _eventsFuture = _eventService.getEventsOfGroup(widget.group.id!);
    _groupRoleId = _groupService.getGroupRoleId(widget.group, widget.myUserId);
    _userInWaitingListFuture = _groupService.isUserInGroupWaitingList(
        widget.group.id!, widget.myUserId);
    isUserMember =
        widget.group.users.any((element) => element.id == widget.myUserId);
  }

  @override
  void didUpdateWidget(covariant SBExploreGroupCard oldWidget) {
    // TODO: implement didUpdateWidget
    super.didUpdateWidget(oldWidget);
    _eventsFuture = _eventService.getEventsOfGroup(widget.group.id!);
    _groupRoleId = _groupService.getGroupRoleId(widget.group, widget.myUserId);
    _userInWaitingListFuture = _groupService.isUserInGroupWaitingList(
        widget.group.id!, widget.myUserId);
    isUserMember =
        widget.group.users.any((element) => element.id == widget.myUserId);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _groupRoleId,
      builder: ((context, snapshot) {
        int roleId = snapshot.data ?? 3;
        return FutureBuilder(
          future: _eventsFuture,
          builder: (builder, snapshot) {
            List<EventModel> events = snapshot.data ?? [];
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => GroupDetailPage(
                      group: widget.group,
                      events: events,
                      isMyGroup: isUserMember,
                      myUserId: widget.myUserId,
                    ),
                  ),
                );
              },
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.group.name,
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                            ),
                            overflow: TextOverflow.ellipsis,
                            softWrap: true,
                          ),
                          Text(
                            '${widget.group.users.length} member${widget.group.users.length > 1 ? 's' : ''}',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onSecondary,
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (roleId == 4)
                      SBSmallButton(
                        title: "Asked to join",
                        onPressed: null,
                      ),
                    if (!isUserMember)
                      FutureBuilder(
                        future: _userInWaitingListFuture,
                        builder: (context, snapshot) {
                          if (snapshot.hasData && snapshot.data != null) {
                            bool userInWaitingList = snapshot.data!;
                            return SBSmallButton(
                              title: userInWaitingList
                                  ? "Asked to join"
                                  : "Ask to join",
                              color: userInWaitingList ? Colors.grey : null,
                              onPressed: userInWaitingList
                                  ? null
                                  : () {
                                      _groupService.joinGroupWaitingList(
                                          widget.group.id!);
                                      setState(() {
                                        _userInWaitingListFuture = _groupService
                                            .isUserInGroupWaitingList(
                                                widget.group.id!,
                                                widget.myUserId);
                                      });
                                      widget.forceUpdate();
                                    },
                            );
                          }
                          return Container();
                        },
                      ),
                  ],
                ),
              ),
            );
          },
        );
      }),
    );
  }
}
