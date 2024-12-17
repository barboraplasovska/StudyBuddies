import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/event_model.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/services/event_service.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/core/utils/utils.dart';
import 'package:studybuddies/ui/appbars/form_app_bar.dart';
import 'package:studybuddies/ui/components/textfields/sb_selection_field.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:studybuddies/ui/components/textfields/sb_textfield.dart';
import 'package:studybuddies/ui/pages/splashscreen_page.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

class NewEventPage extends StatefulWidget {
  const NewEventPage({Key? key}) : super(key: key);

  @override
  State<NewEventPage> createState() => _NewEventPageState();
}

class _NewEventPageState extends State<NewEventPage> {
  final TextEditingController eventNameController = TextEditingController();
  final TextEditingController dateController = TextEditingController();
  final TextEditingController startTimeController = TextEditingController();
  final TextEditingController endTimeController = TextEditingController();
  final TextEditingController linkController = TextEditingController();
  final TextEditingController addressController = TextEditingController();
  final TextEditingController maxPeopleController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();

  bool isFormValid = false;
  bool _addressSelected = false;
  String _lastSelectedAddress = '';
  EventType selectedLocation = EventType.online;
  late Future<List<GroupModel>> _fetchGroupsFuture;
  GroupModel? _selectedGroup;
  final EventService eventService = EventService();

  List<dynamic> _suggestions = [];
  Timer? _debounce;

  // Fonction pour obtenir les suggestions d'adresses depuis Nominatim
  Future<void> _getSuggestions(String query) async {
    if (query.isEmpty) {
      setState(() {
        _suggestions = [];
      });
      return;
    }

    final url = Uri.parse(
        'https://nominatim.openstreetmap.org/search?q=$query&format=json&addressdetails=1&limit=5');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      print('Suggestions trouvées : $data');
      setState(() {
        _suggestions = data;
      });
    } else {
      print(
          'Erreur lors de la récupération des suggestions : ${response.body}');
      setState(() {
        _suggestions = [];
      });
    }
  }

  // Fonction pour gérer l'entrée utilisateur avec un délai (debounce)
  void _onAddressChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 200), () {
      _getSuggestions(query); // Appeler la fonction après 200 ms de pause
    });
    validateForm();
  }

  void _selectSuggestion(dynamic suggestion) {
    setState(() {
      _suggestions = []; // Clear the suggestions after selection
      _lastSelectedAddress =
          suggestion['display_name']; // Store the selected address
      addressController.text = _lastSelectedAddress; // Set the address text
      _addressSelected = true; // Mark the address as selected
    });
    validateForm();
  }

  @override
  void initState() {
    super.initState();
    eventNameController.addListener(validateForm);
    dateController.addListener(validateForm);
    startTimeController.addListener(validateForm);
    endTimeController.addListener(validateForm);
    linkController.addListener(validateForm);
    addressController.addListener(() {
      if (_lastSelectedAddress != addressController.text) {
        _addressSelected = false;
      }
      validateForm();
    });
    maxPeopleController.addListener(validateForm);
    descriptionController.addListener(validateForm);

    try {
      _fetchGroupsFuture = _fetchGroups();
    } catch (e) {
      if (e is Exception &&
          e.toString().contains('Invalid session information')) {
        Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => const SplashScreenPage()));
      }
    }
    validateForm();
  }

  Future<List<GroupModel>> _fetchGroups() async {
    return GroupService().getUserGroups();
  }

  @override
  void dispose() {
    eventNameController.dispose();
    dateController.dispose();
    startTimeController.dispose();
    endTimeController.dispose();
    linkController.dispose();
    addressController.dispose();
    maxPeopleController.dispose();
    descriptionController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void validateForm() {
    setState(() {
      // Check if event name is not empty
      if (eventNameController.text.isEmpty) {
        isFormValid = false;
        return;
      }

      // Check if a group is selected
      if (_selectedGroup == null) {
        isFormValid = false;
        return;
      }

      // Check if date is not empty
      if (dateController.text.isEmpty) {
        isFormValid = false;
        return;
      }

      // Check if start time is not empty
      if (startTimeController.text.isEmpty) {
        isFormValid = false;
        return;
      }

      // Check if end time is not empty
      if (endTimeController.text.isEmpty) {
        isFormValid = false;
        return;
      }

      // Check if max people is not empty
      if (maxPeopleController.text.isEmpty) {
        isFormValid = false;
        return;
      }

      // Check location type conditions
      if (selectedLocation == EventType.physical &&
          addressController.text.isEmpty) {
        isFormValid = false;
        return;
      }

      if (selectedLocation == EventType.physical ||
          selectedLocation == EventType.hybrid) {
        // Ensure the address is selected and not modified afterward
        if (addressController.text.isEmpty || !_addressSelected) {
          isFormValid = false;
          return;
        }
      }

      if (selectedLocation == EventType.online && linkController.text.isEmpty) {
        isFormValid = false;
        return;
      }

      if (selectedLocation == EventType.hybrid &&
          linkController.text.isEmpty &&
          addressController.text.isEmpty) {
        isFormValid = false;
        return;
      }

      // If all conditions are met, the form is valid
      isFormValid = true;
    });
  }

  void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error creating event'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void createEvent() async {
    if (isFormValid) {
      final event = EventModel(
        name: eventNameController.text,
        description: descriptionController.text,
        groupId: _selectedGroup!.id!,
        date: convertDateFormat(dateController.text, startTimeController.text),
        endtime: convertDateFormat(dateController.text, endTimeController.text),
        location: getEventTypeStringForBackend(selectedLocation),
        link: selectedLocation == EventType.online ||
                selectedLocation == EventType.hybrid
            ? linkController.text
            : null,
        address: selectedLocation == EventType.physical ||
                selectedLocation == EventType.hybrid
            ? addressController.text
            : null,
        maxPeople: int.parse(maxPeopleController.text),
      );

      try {
        await eventService.createEvent(event).then((createdEvent) {
          // Event created successfully
          // You can handle the response here if needed
          Navigator.pop(context);
        });
      } catch (error) {
        _showErrorDialog(context, error.toString());
      }
    }
  }

  String _truncateText(String text, {int maxLength = 45}) {
    if (text.length > maxLength) {
      return '${text.substring(0, maxLength)}...';
    }
    return text;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const FormAppBar(title: 'Add event'),
      body: FutureBuilder<List<GroupModel>>(
        future: _fetchGroupsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          } else if (snapshot.hasError) {
            return const Center(
              child: Text('Are you connected to the internet?'),
            );
          } else {
            final groups = snapshot.data!;
            if (groups.length == 1) {
              _selectedGroup = groups.first;
            }
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  SBTextField(
                    labelText: 'Event Name',
                    hintText: 'ex. Maths session',
                    controller: eventNameController,
                    onChanged: (val) {
                      validateForm();
                    },
                  ),
                  if (groups.length == 1)
                    SBTextField(
                      labelText: 'Group',
                      hintText: 'Select group',
                      controller:
                          TextEditingController(text: groups.first.name),
                      disabled: true,
                      onChanged: (val) {
                        validateForm();
                      },
                    )
                  else
                    SBSelectionField(
                      labelText: 'Group',
                      hintText: 'Select group',
                      options: groups.map((group) => group.name).toList(),
                      value: _selectedGroup?.name,
                      onChanged: (value) {
                        setState(() {
                          _selectedGroup =
                              groups.firstWhere((group) => group.name == value);
                        });
                        validateForm();
                      },
                    ),
                  SBTextField(
                    labelText: 'Date',
                    hintText: 'Select date',
                    controller: dateController,
                    type: TextFieldType.date,
                    onChanged: (val) {
                      validateForm();
                    },
                  ),
                  const Text(
                    'Time',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: SBTextField(
                          hintText: 'Start time',
                          controller: startTimeController,
                          type: TextFieldType.time,
                          onChanged: (val) {
                            validateForm();
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text('-'),
                      const SizedBox(width: 8),
                      Expanded(
                        child: SBTextField(
                          hintText: 'End time',
                          controller: endTimeController,
                          type: TextFieldType.time,
                          onChanged: (val) {
                            validateForm();
                          },
                        ),
                      ),
                    ],
                  ),
                  const Text(
                    'Location',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Radio<EventType>(
                            value: EventType.online,
                            groupValue: selectedLocation,
                            onChanged: (EventType? value) {
                              setState(() {
                                if (value != null) {
                                  selectedLocation = value;
                                }
                              });
                            },
                          ),
                          const Text('Virtual'),
                        ],
                      ),
                      Row(
                        children: [
                          Radio<EventType>(
                            value: EventType.physical,
                            groupValue: selectedLocation,
                            onChanged: (EventType? value) {
                              setState(() {
                                if (value != null) {
                                  selectedLocation = value;
                                }
                              });
                            },
                          ),
                          const Text('Physical'),
                        ],
                      ),
                      Row(
                        children: [
                          Radio<EventType>(
                            value: EventType.hybrid,
                            groupValue: selectedLocation,
                            onChanged: (EventType? value) {
                              setState(() {
                                if (value != null) {
                                  selectedLocation = value;
                                }
                              });
                            },
                          ),
                          const Text('Hybrid'),
                        ],
                      ),
                    ],
                  ),
                  if (selectedLocation == EventType.online) ...[
                    SBTextField(
                      labelText: 'Link',
                      hintText: 'Enter event link',
                      controller: linkController,
                      onChanged: (val) {
                        validateForm();
                      },
                    ),
                  ],
                  if (selectedLocation == EventType.physical) ...[
                    SBTextField(
                      labelText: 'Address',
                      hintText: 'Enter event address',
                      controller: addressController,
                      onChanged: _onAddressChanged,
                    ),
                    // Affichage des suggestions d'adresses en dessous du champ
                    if (_suggestions.isNotEmpty)
                      ListView.builder(
                        shrinkWrap: true,
                        itemCount: _suggestions.length > 5
                            ? 5
                            : _suggestions
                                .length, // Limite à 5 suggestions maximum
                        itemBuilder: (context, index) {
                          final suggestion = _suggestions[index];
                          return Column(
                            children: [
                              Container(
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.black),
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                                child: ListTile(
                                  title: Text(
                                    _truncateText(suggestion[
                                        'display_name']), // Appeler la fonction de troncature
                                    style: const TextStyle(
                                        fontWeight:
                                            FontWeight.bold), // Texte en gras
                                  ),
                                  onTap: () => _selectSuggestion(suggestion),
                                ),
                              ),
                            ],
                          );
                        },
                      )
                  ],
                  if (selectedLocation == EventType.hybrid) ...[
                    SBTextField(
                      labelText: 'Link',
                      hintText: 'Enter event link',
                      controller: linkController,
                      onChanged: (val) {
                        validateForm();
                      },
                    ),
                    SBTextField(
                      labelText: 'Address',
                      hintText: 'Enter event address',
                      controller: addressController,
                      onChanged: (val) {
                        validateForm();
                      },
                    ),
                    if (_suggestions.isNotEmpty)
                      ListView.builder(
                        shrinkWrap: true,
                        itemCount: _suggestions.length > 5
                            ? 5
                            : _suggestions
                                .length, // Limite à 5 suggestions maximum
                        itemBuilder: (context, index) {
                          final suggestion = _suggestions[index];
                          return Column(
                            children: [
                              Container(
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.black),
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                                child: ListTile(
                                  title: Text(
                                    _truncateText(suggestion[
                                        'display_name']), // Appeler la fonction de troncature
                                    style: const TextStyle(
                                        fontWeight:
                                            FontWeight.bold), // Texte en gras
                                  ),
                                  onTap: () => _selectSuggestion(suggestion),
                                ),
                              ),
                            ],
                          );
                        },
                      )
                  ],
                  SBTextField(
                    labelText: 'Maximum People',
                    hintText: 'ex. 20',
                    controller: maxPeopleController,
                    onChanged: (val) {
                      validateForm();
                    },
                  ),
                  SBTextField(
                    labelText: 'Description',
                    hintText: 'Enter event description',
                    controller: descriptionController,
                    multipleLines: true,
                    onChanged: (val) {
                      validateForm();
                    },
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      SBSmallButton(
                        title: "Create Event",
                        onPressed: isFormValid ? createEvent : null,
                      ),
                    ],
                  ),
                ],
              ),
            );
          }
        },
      ),
    );
  }
}
