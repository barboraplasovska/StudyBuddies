import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:studybuddies/ui/pages/groups/group_member_profile_page.dart';

class SBEventGoingMemberItem extends StatefulWidget {
  final int groupId;
  final UserModel user;
  final VoidCallback onRemoveUserFromEvent;
  final bool showEditRoleActions;
  final UserModel myUser;

  const SBEventGoingMemberItem({
    super.key,
    required this.groupId,
    required this.user,
    required this.onRemoveUserFromEvent,
    required this.showEditRoleActions,
    required this.myUser,
  });

  @override
  State<SBEventGoingMemberItem> createState() => _SBEventGoingMemberItemState();
}

class _SBEventGoingMemberItemState extends State<SBEventGoingMemberItem> {
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
          SBSmallButton(
            title: "Remove",
            color: Theme.of(context).colorScheme.secondary,
            onPressed: widget.onRemoveUserFromEvent,
          ),
        ],
      ),
    );
  }
}
