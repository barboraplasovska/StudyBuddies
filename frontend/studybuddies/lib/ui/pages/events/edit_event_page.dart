import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
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

class EditEventPage extends StatefulWidget {
  final EventModel event;

  EditEventPage({required this.event});

  @override
  State<EditEventPage> createState() => _EditEventPageState();
}

class _EditEventPageState extends State<EditEventPage> {
  final TextEditingController eventNameController = TextEditingController();
  final TextEditingController dateController = TextEditingController();
  final TextEditingController startTimeController = TextEditingController();
  final TextEditingController endTimeController = TextEditingController();
  final TextEditingController linkController = TextEditingController();
  final TextEditingController addressController = TextEditingController();
  final TextEditingController maxPeopleController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();

  bool isFormValid = false;
  late EventType selectedLocation;
  late Future<GroupModel> _selectedGroup;
  GroupModel? _group;
  final EventService eventService = EventService();

  @override
  void initState() {
    super.initState();
    eventNameController.text = widget.event.name;
    eventNameController.addListener(validateForm);
    dateController.text =
        DateFormat('dd/MM/yyyy').format(DateTime.parse(widget.event.date));
    dateController.addListener(validateForm);
    startTimeController.text = widget.event.getStartTime();
    startTimeController.addListener(validateForm);
    endTimeController.text = widget.event.getEndTime();
    endTimeController.addListener(validateForm);
    linkController.text = widget.event.link ?? '';
    linkController.addListener(validateForm);
    addressController.text = widget.event.address ?? '';
    addressController.addListener(validateForm);
    maxPeopleController.text = widget.event.maxPeople.toString();
    maxPeopleController.addListener(validateForm);
    descriptionController.text = widget.event.description ?? '';
    descriptionController.addListener(validateForm);

    selectedLocation = widget.event.getType();

    try {
      _selectedGroup = _fetchGroupById(widget.event.groupId);
    } catch (e) {
      if (e is Exception &&
          e.toString().contains('Invalid session information')) {
        Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => SplashScreenPage()));
      }
    }
  }

  Future<GroupModel> _fetchGroupById(int id) async {
    return GroupService().getGroupById(id);
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
    super.dispose();
  }

  void validateForm() {
    setState(() {
      // Check if event name is not empty
      if (eventNameController.text.isEmpty) {
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
        title: const Text('Error editing event'),
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

  void editEvent() async {
    if (isFormValid) {
      final updateData = {
        'name': eventNameController.text,
        'description': descriptionController.text,
        'date':
            convertDateFormat(dateController.text, startTimeController.text),
        'endtime':
            convertDateFormat(dateController.text, endTimeController.text),
        'location': getEventTypeStringForBackend(selectedLocation),
        'link': selectedLocation == EventType.online ||
                selectedLocation == EventType.hybrid
            ? linkController.text
            : null,
        'address': selectedLocation == EventType.physical ||
                selectedLocation == EventType.hybrid
            ? addressController.text
            : null,
        'maxPeople': int.parse(maxPeopleController.text),
      };

      try {
        await eventService.updateEvent(widget.event.id!, updateData).then((_) {
          // Event editeded successfully
          // You can handle the response here if needed
          Navigator.pop(context);
        });
      } catch (error) {
        _showErrorDialog(context, error.toString());
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const FormAppBar(title: 'Edit event'),
      body: FutureBuilder<GroupModel>(
        future: _selectedGroup,
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
            _group = snapshot.data!;
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  SBTextField(
                    labelText: 'Event Name',
                    hintText: 'ex. Maths session',
                    controller: eventNameController,
                  ),
                  SBSelectionField(
                      labelText: 'Group',
                      hintText: 'Select group',
                      options: [snapshot.data!.name],
                      value: _group!.name,
                      isEnabled: false,
                    ),
                  SBTextField(
                    labelText: 'Date',
                    hintText: 'Select date',
                    controller: dateController,
                    type: TextFieldType.date,
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
                    ),
                  ],
                  if (selectedLocation == EventType.physical) ...[
                    SBTextField(
                      labelText: 'Address',
                      hintText: 'Enter event address',
                      controller: addressController,
                    ),
                  ],
                  if (selectedLocation == EventType.hybrid) ...[
                    SBTextField(
                      labelText: 'Link',
                      hintText: 'Enter event link',
                      controller: linkController,
                    ),
                    SBTextField(
                      labelText: 'Address',
                      hintText: 'Enter event address',
                      controller: addressController,
                    ),
                  ],
                  SBTextField(
                    labelText: 'Maximum People',
                    hintText: 'ex. 20',
                    controller: maxPeopleController,
                  ),
                  SBTextField(
                    labelText: 'Description',
                    hintText: 'Enter event description',
                    controller: descriptionController,
                    multipleLines: true,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      SBSmallButton(
                        title: "Edit Event",
                        onPressed: isFormValid ? editEvent : null,
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
