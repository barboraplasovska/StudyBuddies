import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/ui/pages/groups/group_member_profile_page.dart';

class SBGroupMemberItem extends StatefulWidget {
  final int groupId;
  final UserModel member;
  final bool showEditRoleActions;
  final UserModel myUser;
  final VoidCallback forceUpdate;

  const SBGroupMemberItem({
    super.key,
    required this.groupId,
    required this.member,
    required this.myUser,
    required this.forceUpdate,
    this.showEditRoleActions = false,
  });

  @override
  State<SBGroupMemberItem> createState() => _SBGroupMemberItemState();
}

class _SBGroupMemberItemState extends State<SBGroupMemberItem> {
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
                    member: widget.member,
                    showEditRoleActions: widget.showEditRoleActions,
                    myUser: widget.myUser,
                    groupId: widget.groupId,
                  ),
                ),
              ).then(
                (value) {
                  widget.forceUpdate();
                },
              );
            },
            child: Row(
              children: [
                CircleAvatar(
                  backgroundImage: NetworkImage(
                    widget.member.getPicture(),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Text(widget.member.name),
                ),
              ],
            ),
          ),
          const Spacer(),
          if (widget.member.groupRoleId != null &&
              widget.member.groupRoleId! <= 2)
            Text(
              widget.member.getGroupRole(),
              style: const TextStyle(
                color: Colors.grey,
                fontStyle: FontStyle.italic,
              ),
            )
        ],
      ),
    );
  }
}
