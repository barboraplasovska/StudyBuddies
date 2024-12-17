import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/utils/utils.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/core/services/event_service.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:studybuddies/ui/pages/events/event_detail_page.dart';

class SBExploreEventCard extends StatefulWidget {
  final Function() forceUpdate;
  final EventModel event;
  final int myUserId;

  const SBExploreEventCard({
    super.key,
    required this.forceUpdate,
    required this.event,
    required this.myUserId,
  });

  @override
  _SBExploreEventCardState createState() => _SBExploreEventCardState();
}

class _SBExploreEventCardState extends State<SBExploreEventCard> {
  bool isSubscribed = true;
  bool isOnWaitingList = true;
  String? groupName;
  bool isLoading = true;
  final GroupService _groupService = GroupService();
  final EventService _eventService = EventService();

  @override
  void initState() {
    super.initState();
    _checkIfUserIsSubscribed();
    _loadGroup();
  }

  @override
  void didChangeDependencies() {
    // TODO: implement didChangeDependencies
    super.didChangeDependencies();
    _checkIfUserIsSubscribed();
    _loadGroup();
  }

  @override
  void didUpdateWidget(covariant SBExploreEventCard oldWidget) {
    // TODO: implement didUpdateWidget
    super.didUpdateWidget(oldWidget);
    _checkIfUserIsSubscribed();
    _loadGroup();
  }

  Future<void> _checkIfUserIsSubscribed() async {
    try {
      bool isGoing = await _eventService.isGoingToEvent(widget.event.id!);
      bool waiting = await _eventService.isOnWaitingList(widget.event.id!);
      setState(() {
        isSubscribed = isGoing;
        isOnWaitingList = waiting;
      });
    } catch (e) {
      print('Error checking if user is subscribed: $e');
    }
  }

  Future<void> _loadGroup() async {
    try {
      GroupModel group = await _groupService.getGroupById(widget.event.groupId);
      setState(() {
        groupName = group.name;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        groupName = 'Unknown Organizer';
        isLoading = false;
      });
    }
  }

  Future<void> _joinWaitingList() async {
    try {
      bool success = await _eventService.joinEventWaitingList(widget.event.id!);
      if (success) {
        setState(() {
          isSubscribed = true;
        });
      }
    } catch (e) {
      print('Failed to join waiting list: $e');
    } finally {}
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => EventDetailPage(
              event: widget.event,
              myUserId: widget.myUserId,
            ),
          ),
        ).then((value) {
          widget.forceUpdate();
        });
      },
      child: Card(
        color: Colors.white,
        margin: EdgeInsets.symmetric(vertical: 8.0),
        elevation: 0,
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.event.name,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18.0,
                ),
              ),
              const SizedBox(height: 4.0),
              Text(
                "${formatDateText(widget.event.date)} - ${widget.event.location}",
                style: TextStyle(
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 8.0),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        text: 'Organised by: ',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.tertiary,
                        ),
                        children: [
                          TextSpan(
                            text: isLoading ? 'Loading...' : groupName,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.tertiary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (!isSubscribed)
                    SBSmallButton(
                      title: isOnWaitingList ? 'Asked to join' : 'Subscribe',
                      onPressed: isOnWaitingList ? null : _joinWaitingList,
                      isDisabled: isOnWaitingList,
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
