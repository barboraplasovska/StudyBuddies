import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/ui/components/lists/sb_profile_groups_list.dart';
import 'package:studybuddies/ui/pages/profile/edit_profile_page.dart';
import 'package:studybuddies/core/services/user_service.dart';
import 'package:studybuddies/ui/pages/splashscreen_page.dart';

class ProfileView extends StatefulWidget {
  const ProfileView({super.key});

  @override
  _ProfileViewState createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  final UserService _userService = UserService();
  final GroupService _groupService = GroupService();

  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey =
      GlobalKey<RefreshIndicatorState>();

  late Future<UserModel>? _userFuture;
  late Future<List<GroupModel>>? _waitingListGroupFuture;

  @override
  void initState() {
    super.initState();
    try {
      _userFuture = _userService.getUser();
      _waitingListGroupFuture = _groupService.getUserWaitingListGroups();
    } catch (e) {
      if (e is Exception &&
          e.toString().contains('Invalid session information')) {
        Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => SplashScreenPage()));
      }
    }
  }

  Future<void> _refreshUser() async {
    try {
      setState(() {
        _userFuture = _userService.getUser();
        _waitingListGroupFuture = _groupService.getUserWaitingListGroups();
      });
    } catch (e) {
      if (e is Exception &&
          e.toString().contains('Invalid session information')) {
        Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => SplashScreenPage()));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<UserModel>(
      future: _userFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        } else if (snapshot.hasError) {
          return Center(
            child: Text('Failed to load user data: ${snapshot.error}'),
          );
        } else {
          UserModel? user = snapshot.data;
          return RefreshIndicator(
            key: _refreshIndicatorKey,
            onRefresh: _refreshUser,
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 10, 10, 10),
                    child: Row(
                      children: [
                        ClipOval(
                          child: Image.network(
                            user!.getPicture(),
                            height: 80,
                            width: 80,
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(
                          width: 40,
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        user.name,
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      // Text( // FIXME: (backend): usermodel doesnt have school
                                      //   user!.school,
                                      //   style: TextStyle(
                                      //     fontSize: 14,
                                      //     fontWeight: FontWeight.w600,
                                      //     color: Colors.black.withOpacity(0.5),
                                      //   ),
                                      // ),
                                    ],
                                  ),
                                  const Spacer(),
                                  IconButton(
                                    onPressed: () async {
                                      await Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => EditProfilePage(
                                            user: user,
                                          ),
                                        ),
                                      );
                                      _refreshUser();
                                    },
                                    icon: Icon(
                                      Icons.edit,
                                      color: Colors.black.withOpacity(0.5),
                                    ),
                                  ),
                                ],
                              ),
                              Text(
                                user.description != ""
                                    ? user.description
                                    : "Add description...",
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.black.withOpacity(0.5),
                                ),
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                  Divider(
                    indent: 20,
                    endIndent: 20,
                    color:
                        Theme.of(context).colorScheme.onSecondary.withAlpha(60),
                  ),
                  SBProfileGroupsList(
                    title: "My Groups",
                    groups: user.groups,
                    userId: user.id,
                  ),
                  FutureBuilder<List<GroupModel>>(
                      future: _waitingListGroupFuture,
                      builder: (context, snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return const Center(
                            child: CircularProgressIndicator(),
                          );
                        } else if (snapshot.hasError) {
                          return Center(
                            child: Text(
                                'Failed to load groups: ${snapshot.error}'),
                          );
                        } else {
                          var waitingListGroups = snapshot.data ?? [];
                          return SBProfileGroupsList(
                            title: "Awaiting approval",
                            grayTitle: true,
                            groups: waitingListGroups,
                            userId: user.id,
                          );
                        }
                      }),
                ],
              ),
            ),
          );
        }
      },
    );
  }
}
