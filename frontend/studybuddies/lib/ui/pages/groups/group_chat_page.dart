import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/models/user_model.dart';
import 'package:studybuddies/ui/appbars/simple_title_app_bar.dart';
import 'package:studybuddies/ui/pages/groups/group_member_profile_page.dart';
import 'package:uuid/uuid.dart';
import 'package:studybuddies/core/services/chat_service.dart';
import 'package:studybuddies/core/services/user_service.dart';

class GroupChatPage extends StatefulWidget {
  final GroupModel group;
  final UserModel myUser;

  const GroupChatPage({
    super.key,
    required this.group,
    required this.myUser,
  });

  @override
  _GroupChatPageState createState() => _GroupChatPageState();
}

class _GroupChatPageState extends State<GroupChatPage> {
  late ChatService _chatService = ChatService(widget.group);
  List<types.Message> _messages = [];
  Future<List<types.Message>>? _messagesFuture;
  UserModel? currentUser;
  types.User? _currentUser;
  bool isInitialized = false; // Indicateur pour vérifier l'initialisation

  @override
  void initState() {
    super.initState();
    _initializeChat();
  }

  Future<void> _initializeChat() async {
    // Récupérer l'utilisateur actuel et initialiser les données
    currentUser = await UserService().getUser();

    _currentUser = types.User(
      id: currentUser!.id.toString(),
      firstName: "You",
      role: types.Role.admin,
    );

    _messagesFuture = _chatService.getMessages(1, 20, widget.group.id!);

    // Écouter les messages entrants via WebSocket
    _chatService.messageStream.listen((message) {
      _handleReceivedMessage(message);
    });

    // Marquer l'initialisation comme terminée et rafraîchir l'interface
    setState(() {
      isInitialized = true;
    });
  }

  // Gestion des messages reçus, uniquement s'ils correspondent à l'ID du groupe actuel
  void _handleReceivedMessage(String message) {
    final data = json.decode(message);

    if (data['event'] == 'receiveMessage' &&
        data['roomId'] == widget.group.id.toString()) {
      final receivedMessage = types.TextMessage(
        author: types.User(id: data['senderId']),
        id: data['messageId'] ?? const Uuid().v4(),
        text: data['content'],
        createdAt: DateTime.now().millisecondsSinceEpoch,
      );

      setState(() {
        _messages.insert(0, receivedMessage);
      });
    }
  }

  void _onSendPressed(types.PartialText message) {
    final textMessage = types.TextMessage(
      author: _currentUser!,
      id: const Uuid().v4(),
      text: message.text,
      createdAt: DateTime.now().millisecondsSinceEpoch,
    );

    setState(() {
      _messages.insert(0, textMessage);
    });

    _chatService.sendMessage(
      message.text,
      _currentUser!.id,
      widget.group.id.toString(),
    );
  }

  UserModel? findUserById(String id) {
    final userId = int.tryParse(id);
    if (userId == null) return null;

    for (var user in widget.group.users) {
      if (user.id == userId) {
        return user;
      }
    }
    return null;
  }

  void _navigateToUserProfile(types.User user) {
    UserModel? member = findUserById(user.id);

    if (member != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => GroupMemberProfilePage(
            member: member,
            showEditRoleActions: widget.group.isOwner(widget.myUser.id),
            myUser: widget.myUser,
            groupId: widget.group.id!,
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('User not found!')),
      );
    }
  }

  @override
  void dispose() async {
    _chatService.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: SimpleTitleAppBar(title: widget.group.name),
      body: isInitialized == false
          ? const Center(
              child:
                  CircularProgressIndicator()) // Affichage de chargement initial
          : FutureBuilder<List<types.Message>>(
              future: _messagesFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                } else if (snapshot.hasData) {
                  _messages = snapshot.data!;

                  return Chat(
                    messages: _messages,
                    onSendPressed: _onSendPressed,
                    user: _currentUser!,
                    showUserNames: true,
                    showUserAvatars: true,
                    onAvatarTap: (user) {
                      _navigateToUserProfile(user);
                    },
                    theme: DefaultChatTheme(
                      primaryColor: Theme.of(context).colorScheme.secondary,
                      inputBackgroundColor: Colors.white,
                      inputContainerDecoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.5),
                            spreadRadius: 3,
                            blurRadius: 5,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      inputTextColor: Colors.black,
                      inputTextStyle: const TextStyle(fontSize: 16),
                    ),
                  );
                } else {
                  return const Center(child: Text('Aucun message à afficher.'));
                }
              },
            ),
    );
  }
}
