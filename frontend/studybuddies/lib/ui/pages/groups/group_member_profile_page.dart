import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/core/services/group_service.dart';

class GroupMemberProfilePage extends StatefulWidget {
  final int groupId;
  final UserModel member;
  final bool showEditRoleActions;
  final UserModel myUser;

  const GroupMemberProfilePage({
    super.key,
    required this.groupId,
    required this.member,
    required this.myUser,
    required this.showEditRoleActions,
  });

  @override
  State<GroupMemberProfilePage> createState() => _GroupMemberProfilePageState();
}

class _GroupMemberProfilePageState extends State<GroupMemberProfilePage> {
  final GroupService _groupService = GroupService();

  late String _role;
  late int _userRoleId;
  late int _myUserRoleId;

  @override
  void initState() {
    // TODO: implement initState

    super.initState();
    _role = widget.member.getGroupRole();
    _userRoleId = widget.member.groupRoleId!;
    _myUserRoleId = widget.myUser.groupRoleId!;
  }

  List<Widget> buildRoleOptions({
    required VoidCallback onPromote,
    required VoidCallback onDemote,
    required VoidCallback onMakeOwner,
    required VoidCallback onKickOut,
  }) {
    List<Widget> roleOptions = [];

    if (_myUserRoleId <= 2 && _userRoleId == 3) {
      // Owner can promote a member to admin
      roleOptions.add(
        ListTile(
          title: const Text('Promote to Admin',
              style: TextStyle(fontWeight: FontWeight.bold)),
          onTap: onPromote,
        ),
      );
    }

    if (_myUserRoleId == 1 && _userRoleId == 2) {
      // Owner can demote admin to member
      roleOptions.add(
        ListTile(
          title: const Text('Demote to Member',
              style: TextStyle(fontWeight: FontWeight.bold)),
          onTap: onDemote,
        ),
      );
    }

    if (_myUserRoleId == 1 && _userRoleId != 1) {
      // Owner can transfer ownership to another user
      roleOptions.add(
        ListTile(
          title: const Text('Make Owner',
              style: TextStyle(fontWeight: FontWeight.bold)),
          onTap: onMakeOwner,
        ),
      );
    }

    if (_myUserRoleId != _userRoleId && _userRoleId != 1) {
      roleOptions.add(
        ListTile(
          title: const Text('Kick out',
              style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          onTap: onKickOut,
        ),
      );
    }

    return roleOptions;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.primary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: const Text('Profile',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: <Widget>[
          const SizedBox(height: 20),
          CircleAvatar(
            radius: 60,
            backgroundImage: Image.network(
              widget.member.getPicture(),
              fit: BoxFit.cover,
            ).image,
          ),
          const SizedBox(height: 20),
          Text(
            widget.member.name,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Text(
              _role,
              style: const TextStyle(
                fontSize: 16,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Text(
              widget.member.description,
              style: const TextStyle(
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          Divider(
            indent: 20,
            endIndent: 20,
            color: Theme.of(context).colorScheme.onSecondary.withAlpha(60),
          ),
          if (widget.showEditRoleActions &&
              widget.myUser.id != widget.member.id)
            Column(
              children: buildRoleOptions(
                onPromote: () {
                  _groupService.promoteUser(widget.groupId, widget.member.id);
                  setState(() {
                    _role = 'Admin';
                    _userRoleId = 2;
                  });
                },
                onDemote: () {
                  _groupService.demoteUser(widget.groupId, widget.member.id);
                  setState(() {
                    _role = 'Member';
                    _userRoleId = 3;
                  });
                },
                onMakeOwner: () {
                  _groupService.changeGroupOwner(
                      widget.groupId, widget.member.id);
                  setState(() {
                    _role = 'Owner';
                    _userRoleId = 1;
                    _myUserRoleId = 2;
                  });
                },
                onKickOut: () {
                  // FIXME (backend): not done
                },
              ),
            ),
        ],
      ),
    );
  }
}
