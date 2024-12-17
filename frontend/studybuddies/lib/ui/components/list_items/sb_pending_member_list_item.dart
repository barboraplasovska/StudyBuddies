import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:studybuddies/ui/pages/groups/group_member_profile_page.dart';

/// Membership request list item
///
/// Description: This widget is a list item for the list of membership requests.
class SBPendingMemberListItem extends StatefulWidget {
  final int groupId;
  final UserModel user;
  final VoidCallback onAccept;
  final VoidCallback onDecline;
  final bool showEditRoleActions;
  final UserModel myUser;

  const SBPendingMemberListItem({
    super.key,
    required this.groupId,
    required this.user,
    required this.onAccept,
    required this.onDecline,
    required this.showEditRoleActions,
    required this.myUser,
  });

  @override
  State<SBPendingMemberListItem> createState() =>
      _SBPendingMemberListItemState();
}

class _SBPendingMemberListItemState extends State<SBPendingMemberListItem> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
      child: Row(
        children: [
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => GroupMemberProfilePage(
                    member: widget.user,
                    showEditRoleActions: widget.showEditRoleActions,
                    myUser: widget.myUser,
                    groupId: widget.groupId,
                  ),
                ),
              );
            },
            child: Row(
              children: [
                CircleAvatar(
                  backgroundImage: NetworkImage(
                    widget.user.getPicture(),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Text(widget.user.name),
                ),
              ],
            ),
          ),
          Spacer(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: SBSmallButton(
              title: "Confirm",
              onPressed: widget.onAccept,
            ),
          ),
          SBSmallButton(
            title: "Decline",
            color: Theme.of(context).colorScheme.secondary,
            onPressed: widget.onDecline,
          ),
        ],
      ),
    );
  }
}
