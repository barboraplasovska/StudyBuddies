import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/services/group_service.dart';
import 'package:studybuddies/ui/appbars/simple_title_app_bar.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:studybuddies/ui/components/textfields/sb_textfield.dart';
import 'package:http/http.dart' as http;

class EditGroupPage extends StatefulWidget {
  final GroupModel group;
  const EditGroupPage({
    super.key,
    required this.group,
  });

  @override
  State<EditGroupPage> createState() => _EditGroupPageState();
}

class _EditGroupPageState extends State<EditGroupPage> {
  GroupService groupService = GroupService();

  TextEditingController nameController = TextEditingController();
  TextEditingController schoolController = TextEditingController();
  TextEditingController descriptionController = TextEditingController();
  TextEditingController imageUrlController = TextEditingController();

  late String profileImageUrl;

  @override
  void initState() {
    super.initState();
    nameController.text = widget.group.name;
    schoolController.text = "";
    descriptionController.text = widget.group.description;
    profileImageUrl = widget.group.getPicture();
    _validateAndSetImageUrl(profileImageUrl); // Validate image on init
  }

  void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Error In Response'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _validateAndSetImageUrl(String url) async {
    bool isValid = await _isImageAccessible(url);
    setState(() {
      profileImageUrl = isValid ? url : widget.group.getPicture();
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

  Future<void> _updateGroup() async {
    final updateData = {
      'name': nameController.text,
      'description': descriptionController.text,
      'picture': profileImageUrl,
    };

    try {
      await groupService.updateGroup(
        widget.group.id!,
        updateData,
      );
      Navigator.pop(context);
    } catch (e) {
      _showErrorDialog(context, e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: SimpleTitleAppBar(
        title: "Edit group",
        actionTitle: "Apply",
        action: _updateGroup,
      ),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
        child: Column(
          children: [
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
              labelText: "Group name",
              hintText: "ex. Maths study group",
              controller: nameController,
            ),
            SBTextField(
              labelText: "School",
              hintText: "ex. EPITA",
              controller: schoolController,
            ),
            SBTextField(
              labelText: "Description",
              hintText: "ex. We study maths every day at 5pm",
              controller: descriptionController,
              multipleLines: true,
            ),
          ],
        ),
      ),
    );
  }
}
