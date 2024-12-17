import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/core/services/event_service.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/ui/components/list_items/sb_event_going_member_item.dart';
import 'package:studybuddies/ui/components/list_items/sb_group_member_item.dart';
import 'package:studybuddies/ui/components/list_items/sb_pending_member_list_item.dart';

class ManageRSVPPage extends StatefulWidget {
  final EventModel event;
  final UserModel myUser;

  const ManageRSVPPage({
    super.key,
    required this.event,
    required this.myUser,
  });

  @override
  State<ManageRSVPPage> createState() => _ManageRSVPPageState();
}

class _ManageRSVPPageState extends State<ManageRSVPPage> {
  final EventService eventService = EventService();
  final GroupService groupService = GroupService();
  late Future<List<UserModel>> pendingUsersFuture;
  late Future<GroupModel> groupFuture;
  late Future<List<UserModel>> goingUsersFuture;

  @override
  void initState() {
    super.initState();
    pendingUsersFuture = eventService.getEventWaitingList(widget.event.id!);
    groupFuture = groupService.getGroupById(widget.event.groupId);
    goingUsersFuture = eventService.getGoingUsers(widget.event.id!);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Manage RSVP',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: Theme.of(context).colorScheme.primary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: FutureBuilder<GroupModel?>(
        future: groupFuture,
        builder: (builder, groupSnapshot) {
          if (groupSnapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (groupSnapshot.hasError) {
            return const Center(child: Text('An error occurred'));
          }

          var group = groupSnapshot.data;

          if (!groupSnapshot.hasData || group == null) {
            return const Center(child: Text('No group found'));
          }

          var isUserGroupOwner = group.isOwner(widget.myUser.id);

          return FutureBuilder<List<UserModel>>(
            future: goingUsersFuture,
            builder: (context, goingSnapshot) {
              if (goingSnapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              if (goingSnapshot.hasError) {
                return const Center(child: Text('Error fetching going users'));
              }

              var goingUsers = goingSnapshot.data ?? [];

              return Padding(
                padding: const EdgeInsets.all(16.0),
                child: ListView(
                  children: [
                    const Text('Going',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    ListView.separated(
                      physics: const NeverScrollableScrollPhysics(),
                      shrinkWrap: true,
                      itemCount: goingUsers.length,
                      itemBuilder: (context, index) {
                        if (widget.myUser.id == goingUsers[index].id) {
                          return SBGroupMemberItem(
                            member: goingUsers[index],
                            showEditRoleActions: isUserGroupOwner,
                            myUser: widget.myUser,
                            groupId: widget.event.groupId,
                            forceUpdate: () {
                              setState(() {
                                goingUsersFuture = eventService
                                    .getGoingUsers(widget.event.id!);
                              });
                            },
                          );
                        }
                        return SBEventGoingMemberItem(
                          groupId: widget.event.groupId,
                          user: goingUsers[index],
                          showEditRoleActions: isUserGroupOwner,
                          myUser: widget.myUser,
                          onRemoveUserFromEvent: () {
                            setState(() {
                              goingUsers.removeAt(index);
                              goingUsersFuture =
                                  eventService.getGoingUsers(widget.event.id!);
                            });
                          },
                        );
                      },
                      separatorBuilder: (context, index) => Divider(
                        color: Theme.of(context)
                            .colorScheme
                            .onSecondary
                            .withAlpha(60),
                        indent: 20,
                        endIndent: 20,
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text('Requests',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    FutureBuilder<List<UserModel>>(
                      future: pendingUsersFuture,
                      builder: (context, snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return const Center(
                              child: CircularProgressIndicator());
                        } else if (snapshot.hasError) {
                          return const Center(
                              child: Text('Error fetching data'));
                        } else if (!snapshot.hasData ||
                            snapshot.data!.isEmpty) {
                          return const Center(
                              child: Text('No pending requests'));
                        } else {
                          var pendingUsers = snapshot.data!;
                          return ListView.builder(
                            physics: const NeverScrollableScrollPhysics(),
                            shrinkWrap: true,
                            itemCount: pendingUsers.length,
                            itemBuilder: (context, index) {
                              return SBPendingMemberListItem(
                                groupId: widget.event.groupId,
                                user: pendingUsers[index],
                                onAccept: () {
                                  setState(() {
                                    goingUsersFuture = eventService
                                        .getGoingUsers(widget.event.id!);
                                    pendingUsers.removeAt(index);
                                  });
                                },
                                onDecline: () {
                                  setState(() {
                                    pendingUsers.removeAt(index);
                                    eventService.declineUserFromEvent(
                                        widget.event.id!,
                                        pendingUsers[index].id);
                                  });
                                },
                                showEditRoleActions: isUserGroupOwner,
                                myUser: widget.myUser,
                              );
                            },
                          );
                        }
                      },
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
