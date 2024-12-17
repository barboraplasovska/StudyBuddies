import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/ui/components/buttons/sb_text_button.dart';
import 'package:studybuddies/ui/pages/groups/group_member_list_page.dart';

/// SB Group Members Widget
///
/// Description: Widget to display group members and a button to see the whole list
///
/// @param members: List<OldUserModel> - list of members in the group
class SBGroupMembersWidget extends StatelessWidget {
  final List<UserModel> members;
  final int groupId;
  final bool isUserGroupOwner;
  final UserModel myUser;

  const SBGroupMembersWidget({
    super.key,
    required this.members,
    required this.groupId,
    required this.isUserGroupOwner,
    required this.myUser,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          height: 40,
          width: members.length != 3 ? (members.length % 3) * 45 : 90,
          child: Stack(
            children: [
              for (int i = 0; i < members.length && i < 3; i++)
                Positioned(
                  left: i * 20.0, // Adjust the overlap here
                  child: CircleAvatar(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    radius: 18,
                    child: CircleAvatar(
                      backgroundImage: NetworkImage(
                        members[i].getPicture(),
                      ),
                      radius: 15,
                    ),
                  ),
                ),
            ],
          ),
        ),
        if (members.length > 3)
          Padding(
            padding: const EdgeInsets.only(right: 20),
            child: Text(
              "and ${members.length - 3} more",
              style: const TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        SBTextButton(
          title: "see members",
          color: Theme.of(context).colorScheme.primary,
          fontSize: 15,
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => GroupMembersPage(
                  groupId: groupId,
                  isUserGroupOwner: isUserGroupOwner,
                  myUser: myUser,
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}
