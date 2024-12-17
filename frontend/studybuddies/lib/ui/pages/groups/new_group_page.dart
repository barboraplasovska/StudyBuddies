import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/ui/appbars/form_app_bar.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:studybuddies/app_router.dart';
import 'package:http/http.dart' as http;
import 'package:studybuddies/ui/components/textfields/sb_selection_field.dart';
import 'package:studybuddies/ui/components/textfields/sb_textfield.dart';

class NewGroupPage extends StatefulWidget {
  const NewGroupPage({super.key});

  @override
  State<NewGroupPage> createState() => _NewGroupPageState();
}

class _NewGroupPageState extends State<NewGroupPage> {
  final TextEditingController groupName = TextEditingController();
  final TextEditingController school = TextEditingController();
  final TextEditingController description = TextEditingController();
  TextEditingController imageUrlController = TextEditingController();

  final GroupService _groupService = GroupService();

  late Future<List<GroupModel>> _fetchSchoolsFuture;
  GroupModel? _selectedSchool;

  bool isFormValid = false;

  late String profileImageUrl;
  final String placeholderImageUrl =
      "https://picsum.photos/200/300?random=${DateTime.now().millisecondsSinceEpoch}";

  @override
  void initState() {
    super.initState();
    groupName.addListener(validateForm);
    school.addListener(validateForm);
    description.addListener(validateForm);
    profileImageUrl = placeholderImageUrl;

    _fetchSchoolsFuture = _groupService.getMySchools();
  }

  Future<void> _validateAndSetImageUrl(String url) async {
    bool isValid = await _isImageAccessible(url);
    setState(() {
      profileImageUrl = isValid ? url : placeholderImageUrl;
    });
  }

  Future<bool> _isImageAccessible(String url) async {
    try {
      final response = await http.get(Uri.parse(url));
      return response.statusCode == 200;
    } catch (e) {
      print('Error accessing image: $e');
      return false;
    }
  }

  void _showImageUpdateDialog() {
    imageUrlController.text = profileImageUrl; // Pre-fill with current URL
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Update profile picture'),
          content: TextField(
            controller: imageUrlController,
            decoration: const InputDecoration(
              labelText: 'Image URL',
              hintText: 'Enter new image URL',
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close the dialog
              },
              child: const Text(
                'Cancel',
                style: TextStyle(
                  color: Colors.black,
                ),
              ),
            ),
            SBSmallButton(
              title: 'Apply',
              onPressed: () {
                String newUrl = imageUrlController.text;
                _validateAndSetImageUrl(
                    newUrl); // Validate and set the new image URL
                Navigator.of(context).pop(); // Close the dialog
              },
            ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    groupName.dispose();
    school.dispose();
    description.dispose();
    super.dispose();
  }

  void validateForm() {
    setState(() {
      isFormValid = groupName.text.isNotEmpty &&
          _selectedSchool != "" &&
          description.text.isNotEmpty;
    });
  }

  void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
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

  void createGroup(List<GroupModel> schools) async {
    if (isFormValid) {
      try {
        await _groupService.createGroup(
          GroupModel(
            name: groupName.text,
            description: description.text,
            picture: profileImageUrl,
            parentId: _selectedSchool?.id,
          ),
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => const AppRouter(),
          ),
        );
      } catch (e) {
        _showErrorDialog(context, e.toString());
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      appBar: const FormAppBar(
        title: "Create a group",
      ),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
        child: SingleChildScrollView(
          child: FutureBuilder(
            future: _fetchSchoolsFuture,
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              }

              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              var schools = snapshot.data as List<GroupModel>;
              if (schools.length == 1) _selectedSchool = schools.first;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  GestureDetector(
                    onTap: _showImageUpdateDialog, // Open dialog on image tap
                    child: Stack(
                      alignment:
                          Alignment.center, // Center the text in the overlay
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.network(
                            profileImageUrl,
                            height: 250,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            height: 250,
                            width: double.infinity,
                            color: Theme.of(context)
                                .colorScheme
                                .tertiary
                                .withOpacity(0.4),
                            child: const Center(
                              child: Text(
                                "Click to change image",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SBTextField(
                    labelText: 'Group name',
                    hintText: 'ex. Maths study group',
                    controller: groupName,
                  ),
                  if (schools.length == 1)
                    SBTextField(
                      labelText: 'School',
                      hintText: 'Select school',
                      controller:
                          TextEditingController(text: schools.first.name),
                      disabled: true,
                    )
                  else
                    SBSelectionField(
                      labelText: 'School',
                      hintText: 'Select school',
                      options: schools.map((group) => group.name).toList(),
                      value: _selectedSchool?.name,
                      onChanged: (value) {
                        setState(() {
                          _selectedSchool = schools
                              .firstWhere((group) => group.name == value);
                        });
                      },
                    ),
                  SBTextField(
                    labelText: 'Description',
                    hintText:
                        'ex. This group is for students who want to study maths together',
                    controller: description,
                    multipleLines: true,
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      SBSmallButton(
                        title: "Create",
                        onPressed:
                            isFormValid ? () => createGroup(schools) : null,
                      ),
                    ],
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
