import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/services/event_service.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:studybuddies/ui/pages/events/event_detail_page.dart';
import 'package:studybuddies/core/utils/utils.dart';

/// GroupEventCard
///
/// Description: Event card for group view
class SBGroupEventCard extends StatefulWidget {
  final Function() forceUpdate;
  final int myUserId;
  final String groupName;
  final EventModel event;
  final bool going;
  final bool isOnWaitingList;
  final bool isMyGroupEvent;
  const SBGroupEventCard({
    super.key,
    required this.forceUpdate,
    required this.myUserId,
    required this.event,
    required this.groupName,
    required this.going,
    required this.isOnWaitingList,
    required this.isMyGroupEvent,
  });

  @override
  State<SBGroupEventCard> createState() => _SBGroupEventCardState();
}

class _SBGroupEventCardState extends State<SBGroupEventCard> {
  EventService _eventService = EventService();

  void onSubscribeClick() {
    if (widget.isOnWaitingList) {
      _eventService.leaveEventWaitingList(widget.event.id!);
    } else {
      _eventService.joinEventWaitingList(widget.event.id!);
    }
    widget.forceUpdate();
  }

  @override
  Widget build(BuildContext context) {
    var locationText = formatLocationText(widget.event);
    var datetimeText = formatDateTimeText(widget.event.date);
    var dateText = formatDateText(widget.event.date);

    return GestureDetector(
      onTap: () {
        if (widget.isMyGroupEvent) {
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
        }
      },
      child: Padding(
        padding: const EdgeInsets.only(bottom: 15),
        child: Container(
          constraints: const BoxConstraints(minHeight: 70),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.3),
                spreadRadius: 0.5,
                blurRadius: 4,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.event.name,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
              widget.isMyGroupEvent
                  ? widget.event.getType() == EventType.hybrid
                      ? Text.rich(
                          TextSpan(
                            children: [
                              TextSpan(
                                text:
                                    "${truncateText(locationText, maxLength: 20)} | ",
                                style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.onSecondary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              TextSpan(
                                text: widget.event.link ?? "open link",
                                style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.onSecondary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w400,
                                  decoration: TextDecoration.underline,
                                ),
                                recognizer: TapGestureRecognizer()
                                  ..onTap = () {
                                    if (widget.event.link != null &&
                                        widget.isMyGroupEvent) {
                                      setState(() {});
                                    }
                                  },
                              ),
                            ],
                          ),
                        )
                      : Padding(
                          padding: const EdgeInsets.only(top: 10),
                          child: Text(
                            truncateText(locationText, maxLength: 50),
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onSecondary,
                              fontSize: 12,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        )
                  : Container(),
              widget.isMyGroupEvent
                  ? Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          datetimeText,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            widget.going
                                ? Row(
                                    children: [
                                      Container(
                                        decoration: const BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: Colors.green,
                                        ),
                                        width: 15,
                                        height: 15,
                                        child: const Icon(
                                          Icons.check,
                                          color: Colors.white,
                                          size: 13,
                                        ),
                                      ),
                                      const SizedBox(width: 5),
                                      const Text(
                                        'Going',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  )
                                : SBSmallButton(
                                    isDisabled: !widget.isMyGroupEvent ||
                                        widget.isOnWaitingList,
                                    title: widget.isOnWaitingList
                                        ? "Asked to join"
                                        : "Subscribe",
                                    onPressed: onSubscribeClick,
                                  )
                          ],
                        ),
                      ],
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          dateText,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            SBSmallButton(
                              isDisabled: !widget.isMyGroupEvent ||
                                  widget.isOnWaitingList,
                              title: widget.isOnWaitingList
                                  ? "Asked to join"
                                  : "Subscribe",
                              onPressed: onSubscribeClick,
                            )
                          ],
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
