import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/ui/components/list_items/sb_group_member_item.dart';

class GroupMembersPage extends StatefulWidget {
  final int groupId;
  final bool isUserGroupOwner;
  final UserModel myUser;

  const GroupMembersPage({
    super.key,
    required this.groupId,
    required this.isUserGroupOwner,
    required this.myUser,
  });

  @override
  State<GroupMembersPage> createState() => _GroupMembersPageState();
}

class _GroupMembersPageState extends State<GroupMembersPage> {
  final GroupService _groupService = GroupService();

  late Future<GroupModel> groupFuture;

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    groupFuture = _groupService.getGroupById(widget.groupId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text(
            'Group members',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          backgroundColor: Theme.of(context).colorScheme.primary,
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        body: FutureBuilder<GroupModel>(
            future: groupFuture,
            builder: (builder, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              var group = snapshot.data;

              if (group == null) {
                return const Center(child: Text('No group found'));
              }

              return Padding(
                padding: const EdgeInsets.all(16),
                child: ListView.separated(
                  itemCount: group.users.length,
                  itemBuilder: (context, index) {
                    return SBGroupMemberItem(
                      member: group.users[index],
                      showEditRoleActions: widget.isUserGroupOwner,
                      myUser: widget.myUser,
                      groupId: widget.groupId,
                      forceUpdate: () {
                        setState(() {
                          groupFuture =
                              _groupService.getGroupById(widget.groupId);
                        });
                      },
                    );
                  },
                  separatorBuilder: (context, index) => Divider(
                    color:
                        Theme.of(context).colorScheme.onSecondary.withAlpha(60),
                    indent: 20,
                    endIndent: 20,
                  ),
                ),
              );
            }));
  }
}
