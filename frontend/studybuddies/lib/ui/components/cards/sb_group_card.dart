import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/services/group_service.dart'; // Import the GroupService
import 'package:studybuddies/core/utils/utils.dart';
import 'package:studybuddies/ui/pages/groups/group_detail_page.dart';

class SBGroupCard extends StatefulWidget {
  final GroupModel group;
  final List<EventModel> events;
  final Function updateGroupCallback;
  final int myUserId;

  const SBGroupCard({
    super.key,
    required this.group,
    required this.events,
    required this.updateGroupCallback,
    required this.myUserId,
  });

  @override
  State<SBGroupCard> createState() => _SBGroupCardState();
}

class _SBGroupCardState extends State<SBGroupCard> {
  final GroupService groupService = GroupService();
  late Future<GroupModel?> _groupFuture;

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    _groupFuture = groupService.getGroupById(widget.group.id!);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<GroupModel?>(
        future: _groupFuture,
        builder: (builder, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return const Center(child: Text('An error occurred'));
          }

          var retrievedGroup = snapshot.data;

          if (!snapshot.hasData || retrievedGroup == null) {
            return const Center(child: Text('No group found'));
          }

          return Padding(
            padding: const EdgeInsets.only(left: 5, right: 5),
            child: SizedBox(
              width: 120,
              height: 160,
              child: InkWell(
                onTap: () async {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => GroupDetailPage(
                        group: retrievedGroup,
                        events: widget.events,
                        isMyGroup: true,
                        myUserId: widget.myUserId,
                      ),
                    ),
                  ).then((value) => widget.updateGroupCallback());
                },
                child: Stack(
                  children: [
                    SizedBox(
                      width: 120,
                      height: 160,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(5),
                        child: Image.network(
                          widget.group.getPicture(),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(5),
                      child: Container(
                        color: Colors.black.withAlpha(127),
                        width: 120,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(10, 10, 5, 5),
                              child: Text(
                                truncateText(widget.group.name, maxLength: 35),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        });
  }
}
