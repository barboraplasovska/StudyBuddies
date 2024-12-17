import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/utils/utils.dart';
import 'package:studybuddies/ui/pages/events/event_detail_page.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

/// EventCard
///
/// Description: Event card for home view
///
/// @param event: EventModel
class SBEventCard extends StatefulWidget {
  final Function() forceUpdate;
  final EventModel event;
  final int myUserId;
  const SBEventCard({
    super.key,
    required this.forceUpdate,
    required this.event,
    required this.myUserId,
  });

  @override
  State<SBEventCard> createState() => _SBEventCardState();
}

class _SBEventCardState extends State<SBEventCard> {
  GroupService _groupService = GroupService();

  Future<GroupModel>? _groupFuture;
  LatLng? _eventLocation;

  // Fonction pour obtenir les coordonnées LatLng à partir d'une adresse
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

  // Future qui charge le groupe et la localisation ensemble
  Future<GroupModel> _loadEventDetails() async {
    // Charger le groupe
    final group = await _groupService.getGroupById(widget.event.groupId);

    // Charger l'emplacement si nécessaire
    if (widget.event.getType() != EventType.online &&
        widget.event.address != null) {
      _eventLocation = await getLatLngFromAddress(widget.event.address!);
    }

    return group; // Le groupe est retourné ici
  }

  @override
  void initState() {
    super.initState();
    _groupFuture =
        _loadEventDetails(); // Assurez-vous que _groupFuture retourne un Future<GroupModel>
  }

  @override
  Widget build(BuildContext context) {
    var locationText = formatLocationText(widget.event);
    var datetimeText = formatDateTimeText(widget.event.date);

    return FutureBuilder<GroupModel>(
      future: _groupFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        } else if (snapshot.hasError) {
          return Center(
            child: Text('Failed to load event details: ${snapshot.error}'),
          );
        }

        // Snapshot has the correct data type now (GroupModel)
        final group = snapshot.data!;

        return GestureDetector(
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
          child: Padding(
            padding: const EdgeInsets.only(left: 20, right: 20, bottom: 15),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                widget.event.getType() != EventType.online &&
                        _eventLocation != null
                    ? Container(
                        height: 200,
                        child: IgnorePointer(
                          child: FlutterMap(
                            options: MapOptions(
                                initialCenter: _eventLocation!,
                                initialZoom: 16.0,
                                interactionOptions:
                                    InteractionOptions() // TO FIX
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
                                    point: _eventLocation!,
                                    width: 80,
                                    height: 80,
                                    child: Icon(Icons.location_pin,
                                        color: Colors.red, size: 40),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      )
                    : Container(),
                widget.event.getType() == EventType.hybrid
                    ? Text.rich(
                        TextSpan(
                          children: [
                            TextSpan(
                              text: "$locationText | ",
                              style: TextStyle(
                                color:
                                    Theme.of(context).colorScheme.onSecondary,
                                fontSize: 14,
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                            TextSpan(
                              text: widget.event.link ?? "open link",
                              style: TextStyle(
                                color:
                                    Theme.of(context).colorScheme.onSecondary,
                                fontSize: 14,
                                fontWeight: FontWeight.w400,
                                decoration: TextDecoration.underline,
                              ),
                              recognizer: TapGestureRecognizer()
                                ..onTap = () {
                                  if (widget.event.link != null) {
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
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ),
                Text(
                  truncateText(widget.event.name, maxLength: 40),
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(datetimeText),
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      RichText(
                        text: TextSpan(
                          text: 'organised by: ',
                          style: const TextStyle(
                            color: Color(0xFF316778),
                            fontWeight: FontWeight.w600,
                          ),
                          children: <TextSpan>[
                            TextSpan(
                              text: truncateText(group.name, maxLength: 45),
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Divider(
                  color:
                      Theme.of(context).colorScheme.onSecondary.withAlpha(60),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
