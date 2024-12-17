import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/ui/components/dropdowns/sb_dropdown_menu.dart';
import 'package:badges/badges.dart' as badges;
import 'package:studybuddies/ui/pages/groups/group_chat_page.dart';

class GroupDetailAppBar extends StatelessWidget implements PreferredSizeWidget {
  final Function leaveGroup;
  final Function() onClickMembershipReq;
  final int nbMembershipReq;
  final GroupModel group;
  final UserModel myUser;

  const GroupDetailAppBar({
    super.key,
    required this.leaveGroup,
    required this.onClickMembershipReq,
    required this.nbMembershipReq,
    required this.group,
    required this.myUser,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Theme.of(context).colorScheme.primary,
      foregroundColor: Colors.white,
      actions: [
        badges.Badge(
          badgeStyle: badges.BadgeStyle(
            badgeColor: Theme.of(context).colorScheme.secondary,
          ),
          showBadge: nbMembershipReq != 0,
          badgeContent: Text(
            nbMembershipReq.toString(),
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w500,
            ),
          ),
          position: badges.BadgePosition.topEnd(top: 0, end: -5),
          child: IconButton(
            onPressed: onClickMembershipReq,
            icon: const Icon(Icons.person_add_rounded),
          ),
        ),
        IconButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => GroupChatPage(
                  group: group,
                  myUser: myUser,
                ),
              ),
            );
          },
          icon: const Icon(Icons.chat),
        ),
        SBDropdownMenu(
          items: {
            'Leave group': () {
              leaveGroup();
            },
            'Report group': () {
              // FIXME: Handle report group action
              print("Report group");
            },
          },
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
