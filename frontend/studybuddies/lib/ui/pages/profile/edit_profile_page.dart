import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/ui/appbars/simple_title_app_bar.dart';
import 'package:studybuddies/ui/components/buttons/sb_small_button.dart';
import 'package:studybuddies/ui/components/textfields/sb_textfield.dart';
import 'package:studybuddies/core/services/user_service.dart';
import 'package:http/http.dart' as http;

/// EditProfilePage
///
/// Description: This widget is a page where the user can edit their profile.
///
/// @param: user: UserModel - the user that is editing their profile
class EditProfilePage extends StatefulWidget {
  final UserModel user;
  const EditProfilePage({
    super.key,
    required this.user,
  });

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final UserService _userService = UserService();
  TextEditingController nameController = TextEditingController();
  TextEditingController schoolController = TextEditingController();
  TextEditingController descriptionController = TextEditingController();
  TextEditingController imageUrlController = TextEditingController();

  late String profileImageUrl;

  @override
  void initState() {
    super.initState();
    nameController.text = widget.user.name;
    schoolController.text =
        "EPITA"; // FIXME: (backend): user has no school: widget.user.school;
    descriptionController.text = widget.user.description;
    profileImageUrl = widget.user.getPicture();
    _validateAndSetImageUrl(profileImageUrl); // Validate image on init
  }

  Future<void> _updateUser() async {
    try {
      UserModel? _ = await _userService.updateUser(
        name: nameController.text,
        description: descriptionController.text,
        picture: profileImageUrl, // Send the updated image URL
      );
      Navigator.pop(context);
    } catch (e) {
      print('Failed to update user: $e');
      // Optionally show an error message to the user
    }
  }

  Future<void> _validateAndSetImageUrl(String url) async {
    bool isValid = await _isImageAccessible(url);
    setState(() {
      profileImageUrl = isValid ? url : widget.user.getPicture();
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
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: SimpleTitleAppBar(
        title: "Edit profile",
        actionTitle: "Apply",
        action: _updateUser,
      ),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(20, 30, 10, 10),
        child: Column(
          children: [
            GestureDetector(
              onTap: _showImageUpdateDialog,
              child: ClipOval(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Image.network(
                      profileImageUrl,
                      height: 150,
                      width: 150,
                      fit: BoxFit.cover,
                    ),
                    Container(
                      height: 150,
                      width: 150,
                      color: Theme.of(context)
                          .colorScheme
                          .tertiary
                          .withOpacity(0.4),
                      alignment: Alignment.center,
                      child: const Text(
                        "Click to change image",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(
              height: 20,
            ),
            SBTextField(
              labelText: 'Name',
              hintText: 'Enter your name',
              controller: nameController,
            ),
            SBTextField(
              labelText: 'School',
              hintText: '',
              disabled: true,
              controller: schoolController,
            ),
            SBTextField(
              labelText: 'Description',
              hintText: 'Enter your profile description',
              controller: descriptionController,
              multipleLines: true,
            ),
          ],
        ),
      ),
    );
  }
}
