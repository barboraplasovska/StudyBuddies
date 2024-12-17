import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/ui/appbars/simple_title_app_bar.dart';
import 'package:studybuddies/ui/components/list_items/sb_pending_member_list_item.dart';

class MembershipRequestsPage extends StatefulWidget {
  final List<UserModel> membershipRequests;
  final int groupId;
  final UserModel myUser;

  const MembershipRequestsPage({
    super.key,
    required this.membershipRequests,
    required this.groupId,
    required this.myUser,
  });

  @override
  State<MembershipRequestsPage> createState() => _MembershipRequestsPageState();
}

class _MembershipRequestsPageState extends State<MembershipRequestsPage> {
  final GroupService _groupService = GroupService();
  late List<UserModel> users;

  @override
  void initState() {
    users = widget.membershipRequests;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const SimpleTitleAppBar(title: 'Membership requests'),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView.builder(
          itemCount: users.length,
          itemBuilder: (BuildContext context, int index) {
            return SBPendingMemberListItem(
              user: users[index],
              onAccept: () {
                setState(() {
                  _groupService.acceptUserIntoGroup(
                      widget.groupId, users[index].id);
                  users.remove(users[index]);
                });
              },
              onDecline: () {
                setState(() {
                  _groupService.declineUserFromGroup(
                      widget.groupId, users[index].id);
                  users.remove(users[index]);
                });
              },
              showEditRoleActions: false,
              myUser: widget.myUser,
              groupId: widget.groupId,
            );
          },
        ),
      ),
    );
  }
}
