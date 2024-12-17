import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/utils/utils.dart';

/// GroupRole
///
/// Description: Enum for group roles
enum SBGroupRole {
  owner,
  admin,
  member,
  askedToJoin,
}

extension SBGroupRoleExtension on SBGroupRole {
  String get stringValue {
    switch (this) {
      case SBGroupRole.owner:
        return 'Owner';
      case SBGroupRole.admin:
        return 'Administrator';
      case SBGroupRole.member:
        return 'Member';
      case SBGroupRole.askedToJoin:
        return 'Asked to join';
      default:
        return '';
    }
  }
}

/// GroupRoleWidget
///
/// Description: Group role widget used in profile view, shows the users role in a group
///
/// @param group: GroupModel
class SBGroupRoleWidget extends StatefulWidget {
  final GroupModel group;
  final int userId;

  const SBGroupRoleWidget({
    super.key,
    required this.group,
    required this.userId,
  });

  @override
  State<SBGroupRoleWidget> createState() => _SBGroupRoleWidgetState();
}

class _SBGroupRoleWidgetState extends State<SBGroupRoleWidget> {
  late SBGroupRole role;

  @override
  void initState() {
    role = _getRole(widget.userId);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 10, 10, 10),
      height: 110,
      child: Row(
        children: [
          Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: Image.network(
                  widget.group.getPicture(),
                  height: 90,
                  width: 130,
                  fit: BoxFit.cover,
                ),
              ),
              role == SBGroupRole.askedToJoin
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(5),
                      child: Container(
                        color: const Color(0xFF707070).withAlpha(130),
                        height: 90,
                        width: 130,
                      ),
                    )
                  : Container(),
            ],
          ),
          const SizedBox(
            width: 30,
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                truncateText(widget.group.name, maxLength: 23),
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: role == SBGroupRole.askedToJoin
                        ? const Color(0xFF9E9E9E)
                        : Colors.black),
              ),
              Text(
                "${widget.group.users.length} member${widget.group.users.length > 1 ? 's' : ''}",
                style: TextStyle(
                  color: Colors.black.withOpacity(0.7),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              Container(
                width: 140,
                height: 30,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary,
                  borderRadius: BorderRadius.circular(7),
                ),
                child: Center(
                  child: Text(
                    role.stringValue,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              )
            ],
          ),
        ],
      ),
    );
  }

  SBGroupRole _getRole(int userId) {
    for (var user in widget.group.users) {
      if (user.id == userId) {
        switch (user.groupRoleId) {
          case 1:
            return SBGroupRole.owner;
          case 2:
            return SBGroupRole.admin;
          default:
            return SBGroupRole.member;
        }
      }
    }
    return SBGroupRole.askedToJoin;
  }
}
