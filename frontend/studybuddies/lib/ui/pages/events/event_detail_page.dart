import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/services/event_service.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/core/utils/utils.dart';
import 'package:studybuddies/ui/appbars/event_detail_app_bar.dart';
import 'package:studybuddies/ui/components/buttons/sb_text_button.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:studybuddies/ui/components/textfields/sb_textfield.dart';
import 'package:studybuddies/ui/pages/events/manage_rsvp_page.dart';
import 'package:http/http.dart' as http;

class EventDetailPage extends StatefulWidget {
  final EventModel event;
  final int myUserId;

  EventDetailPage({
    required this.event,
    required this.myUserId,
  });

  @override
  _EventDetailPageState createState() => _EventDetailPageState();
}

class _EventDetailPageState extends State<EventDetailPage> {
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  EventService eventService = EventService();
  GroupService groupService = GroupService();
  late EventModel event;
  late Future<GroupModel> groupFuture;
  late Future<bool?> isOnWaitingListFuture;

  final TextEditingController emailController = TextEditingController();

  bool showEmailTextField = false;

  Future<LatLng?> getLatLngFromAddress(String address) async {
    final url = Uri.parse(
        'https://nominatim.openstreetmap.org/search?q=$address&format=json&addressdetails=1&limit=1');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data.isNotEmpty) {
        final lat = double.parse(data[0]['lat']);
        final lon = double.parse(data[0]['lon']);
        return LatLng(lat, lon);
      }
    } else {
      print('Erreur lors de la requête: ${response.body}');
    }
    return null;
  }

  @override
  void initState() {
    event = widget.event;
    super.initState();
    groupFuture = groupService.getGroupById(event.groupId);
    isOnWaitingListFuture = eventService.isOnWaitingList(event.id!);
  }

  @override
  void didChangeDependencies() {
    // TODO: implement didChangeDependencies
    super.didChangeDependencies();
    groupFuture = groupService.getGroupById(event.groupId);
    isOnWaitingListFuture = eventService.isOnWaitingList(event.id!);
  }

  @override
  void didUpdateWidget(covariant EventDetailPage oldWidget) {
    // TODO: implement didUpdateWidget
    super.didUpdateWidget(oldWidget);
    groupFuture = groupService.getGroupById(event.groupId);
    isOnWaitingListFuture = eventService.isOnWaitingList(event.id!);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: EventDetailAppBar(
        event: event,
        onEditEvent: () async {
          EventModel newEvent = await eventService.getEventById(event.id!);
          setState(() {
            event = newEvent;
          });
        },
        onExportEvent: () async {
          try {
            await eventService.exportEvent(event.id!);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Exported event send to your email!'),
              ),
            );
          } catch (e) {
            final errorMessage = e.toString().replaceFirst('Exception: ', '');
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(errorMessage),
              ),
            );
          }
        },
      ),
      body: FutureBuilder(
        future: groupFuture,
        builder: (builder, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const CircularProgressIndicator();
          }
          if (snapshot.hasError) {
            return const Text('Error loading group data');
          }
          final group = snapshot.data as GroupModel;

          final groupUser = group.users.firstWhere(
            (user) => user.id == widget.myUserId,
          );

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      truncateText(event.name),
                      style: const TextStyle(
                          fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.calendar_today),
                      title: Text(
                        formatDateText(event.date),
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                          "${event.getStartTime()} - ${event.getEndTime()}"),
                    ),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.location_on),
                      title: Text(
                        getEnumValue(event.getType()),
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      subtitle: event.getType() == EventType.online
                          ? InkWell(
                              onTap: () => launchURL(event.link ?? ''),
                              child: Text(
                                event.link ?? '',
                                style: const TextStyle(
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            )
                          : event.getType() == EventType.hybrid
                              ? Row(
                                  children: [
                                    Flexible(
                                      child: Text("${event.address ?? ''} | "),
                                    ),
                                    InkWell(
                                      onTap: () => launchURL(event.link ?? ''),
                                      child: Text(
                                        event.link ?? '',
                                        style: const TextStyle(
                                          decoration: TextDecoration.underline,
                                        ),
                                      ),
                                    ),
                                  ],
                                )
                              : Text(event.address ?? ''),
                    ),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.people),
                      title: Text(
                        'Hosted by ${group.name}',
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          '${event.users?.length ?? 0} ${event.users?.length == 1 ? 'person is' : 'people are'} going',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.tertiary,
                          ),
                        ),
                        const SizedBox(width: 10),
                        if (event.isCreator(widget.myUserId))
                          SBTextButton(
                            title: "manage RSVPs",
                            color: Theme.of(context).colorScheme.primary,
                            fontSize: 16,
                            onPressed: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => ManageRSVPPage(
                                  event: event,
                                  myUser: groupUser,
                                ),
                              ),
                            ).then(
                              (value) {
                                setState(() {
                                  groupFuture =
                                      groupService.getGroupById(event.groupId);
                                  isOnWaitingListFuture =
                                      eventService.isOnWaitingList(event.id!);
                                });
                              },
                            ),
                          ),
                      ],
                    ),
                    if (event.description!.isNotEmpty)
                      const SizedBox(height: 20),
                    Text(
                      event.description ?? '',
                      style: const TextStyle(fontSize: 16),
                    ),
                    //   const SizedBox(height: 30),
                    if (event.getType() != EventType.online)
                      FutureBuilder<LatLng?>(
                        future: getLatLngFromAddress(event.address ?? ''),
                        builder: (context, snapshot) {
                          if (snapshot.connectionState ==
                              ConnectionState.waiting) {
                            return const Center(
                              child:
                                  CircularProgressIndicator(), // Display loading spinner
                            );
                          } else if (snapshot.hasError) {
                            return Center(
                              child: Text(
                                  'Failed to load location: ${snapshot.error}'),
                            );
                          } else if (!snapshot.hasData ||
                              snapshot.data == null) {
                            return const Center(
                              child: Text('No location available'),
                            );
                          }

                          LatLng eventLocation = snapshot.data!;
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 18),
                            child: SizedBox(
                              height: 250,
                              child: FlutterMap(
                                options: MapOptions(
                                  initialCenter: eventLocation,
                                  initialZoom: 14.0,
                                ),
                                children: [
                                  TileLayer(
                                    urlTemplate:
                                        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                                    userAgentPackageName: 'com.example.app',
                                  ),
                                  MarkerLayer(
                                    markers: [
                                      Marker(
                                        point: eventLocation,
                                        width: 80,
                                        height: 80,
                                        child: const Icon(
                                          Icons.location_pin,
                                          color: Colors.red,
                                          size: 40,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      )
                  ],
                ),
              ),
              const Spacer(),
              Container(
                constraints: const BoxConstraints(minHeight: 100),
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
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          FutureBuilder<bool?>(
                            future: isOnWaitingListFuture,
                            builder: (context, snapshot) {
                              if (snapshot.connectionState ==
                                  ConnectionState.waiting) {
                                return const CircularProgressIndicator();
                              }
                              if (snapshot.hasError) {
                                return const Text('Error loading user data');
                              }
                              final isOnWaitingList = snapshot.data ?? false;
                              if (isOnWaitingList) {
                                return Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      "You're on the waiting list",
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    SBTextButton(
                                      title: "Remove request",
                                      color: Theme.of(context)
                                          .colorScheme
                                          .tertiary,
                                      fontSize: 16,
                                      onPressed: () {
                                        eventService
                                            .leaveEventWaitingList(event.id!);
                                        setState(() {
                                          isOnWaitingListFuture = eventService
                                              .isOnWaitingList(event.id!);
                                        });
                                      },
                                    ),
                                  ],
                                );
                              } else if (!event.isGoing(widget.myUserId)) {
                                return Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      "You're not going",
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    SBTextButton(
                                      title: "Join Event",
                                      color: Theme.of(context)
                                          .colorScheme
                                          .tertiary,
                                      fontSize: 16,
                                      onPressed: () {
                                        eventService
                                            .joinEventWaitingList(event.id!);
                                        setState(() {
                                          isOnWaitingListFuture = eventService
                                              .isOnWaitingList(event.id!);
                                        });
                                      },
                                    ),
                                  ],
                                );
                              } else if (event.isCreator(widget.myUserId)) {
                                return const Column(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      "You're the organisator",
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                );
                              } else {
                                return Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      "You're already going",
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    SBTextButton(
                                      title: "Edit RSVP",
                                      color: Theme.of(context)
                                          .colorScheme
                                          .tertiary,
                                      fontSize: 16,
                                      onPressed: () {
                                        // FIXME: TO FIX
                                      },
                                    ),
                                  ],
                                );
                              }
                            },
                          ),
                          SBSmallButton(
                            title: "Share Event",
                            color: Theme.of(context).colorScheme.primary,
                            onPressed: () {
                              setState(() {
                                showEmailTextField = true;
                              });
                            },
                          ),
                        ],
                      ),
                      if (showEmailTextField)
                        Row(
                          children: [
                            SBTextField(
                              hintText: "Enter email",
                              controller: emailController,
                              width: 240,
                            ),
                            IconButton(
                              padding: const EdgeInsets.all(0),
                              icon: const Icon(
                                Icons.send,
                                color: Colors.green,
                              ),
                              onPressed: () async {
                                String email = emailController.text;
                                setState(() {
                                  emailController.clear();
                                  showEmailTextField = false;
                                });
                                try {
                                  await eventService.shareEvent(
                                      event.id!, email);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Event shared!'),
                                    ),
                                  );
                                } catch (e) {
                                  final errorMessage = e
                                      .toString()
                                      .replaceFirst('Exception: ', '');
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(errorMessage),
                                    ),
                                  );
                                }
                              },
                            ),
                            IconButton(
                              padding: const EdgeInsets.all(0),
                              icon: const Icon(
                                Icons.cancel,
                                color: Colors.red,
                              ),
                              onPressed: () {
                                setState(() {
                                  showEmailTextField = false;
                                });
                              },
                            ),
                          ],
                        )
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
