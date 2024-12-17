import 'dart:async';
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:logger/logger.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:http/http.dart' as http;
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/core/models/user_model.dart';

class ChatService {
  final String url = dotenv.env['API_TCHAT_URL']!;
  late IO.Socket _socket;
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  bool isManuallyDisconnected = false;

  final StreamController<String> _messageController =
      StreamController<String>.broadcast();

  Stream<String> get messageStream => _messageController.stream;

  List<types.User> userList = [];
  late int groupId;

  ChatService(GroupModel groupModel) {
    groupId = groupModel.id!;
    _createUserList(groupModel.users);
    _connect();
  }

  void _createUserList(List<UserModel> users) {
    users.forEach((user) {
      userList.add(types.User(id: user.id.toString(), firstName: user.name, imageUrl: user.picture));
    });
  }

  types.User getUserById(String id) {
    return userList.firstWhere((user) => user.id == id);
  }

  Future<Map<String, String>> _getHeaders() async {
    final sessionId = await storage.read(key: 'sessionId');
    final jwt = await storage.read(key: 'jwt');

    if (sessionId == null) {
      throw Exception('Session ID not found. User might not be logged in.');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $jwt',
      'sessionId': sessionId,
      'groupId': groupId.toString(),
    };
  }

  Future<List<types.Message>> getMessages(
      int page, int limit, int groupId) async {
    final _url =
        Uri.parse('$url/messages?page=$page&limit=$limit&roomId=$groupId');

    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    final response = await http.get(
      _url,
      headers: headers,
    );

    if (response.statusCode == 200) {
      final dynamic messagesJson = jsonDecode(response.body);
      return convertToMessage(messagesJson);
    } else {
      throw Exception('Failed to get events: ${response.statusCode}');
    }
  }

  List<types.Message> convertToMessage(List<dynamic> _messages) {
    List<types.Message> messages = [];
    List<Map<String, dynamic>> body =
        _messages.map((json) => Map<String, dynamic>.from(json)).toList();
    body.forEach((message) {
      messages.add(types.TextMessage(
        author: getUserById(message['senderId']),
        id: message['_id'],
        text: message['content'],
        createdAt: DateTime.parse(message['createdAt']).millisecondsSinceEpoch,
      ));
    });
    return messages;
  }

  // Méthode pour se connecter au WebSocket avec socket_io_client
  void _connect() async {
    Map<String, String> headers;
    try {
      headers = await _getHeaders();
    } catch (e) {
      throw Exception('Invalid session information');
    }

    _socket = IO.io(
      url,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setReconnectionDelay(2000)
          .setExtraHeaders(headers)
          .build(),
    );

    // Écouter les événements de connexion et de déconnexion
    _socket.on('connect', (_) {
      Logger().i('Connecté au serveur WebSocket');
    });

    _socket.on('disconnect', (_) {
      Logger().i('Déconnecté du serveur WebSocket');
      _reconnect();
    });

    _socket.on('error', (error) {
      Logger().i('Erreur WebSocket: $error');
      _reconnect();
    });

    // Écouter l'événement de réception de message
    _socket.on('receiveMessage', (data) {
      _handleReceiveMessage(data);
    });
  }

  // Méthode de reconnexion manuelle
  void _reconnect() async {
    if (isManuallyDisconnected) {
      Logger().i('Reconnexion annulée - Déconnexion manuelle active');
      return;
    }

    if (!_socket.connected) {
      Logger().i('Tentative de reconnexion au serveur...');
      _socket.connect();
    }
  }

  // Gestion des messages entrants
  void _handleReceiveMessage(dynamic data) async {
    final message = data is Map<String, dynamic> ? data : json.decode(data);
    if (message['event'] == 'receiveMessage') {
      Logger().i('Message reçu: ${message['content']}');
      Logger().i('ID utilisateur: ${message['senderId']}');
      Logger().i('ID groupe: ${message['roomId']}');
      _messageController.add(message);
    }
  }

  // Envoyer un message
  void sendMessage(String message, String userId, String groupId) async {
    final data = {
      'senderId': userId,
      'roomId': groupId,
      'content': message,
    };
    Logger().i(data);
    _socket.emit('sendMessage', data);
  }

  // Fermer la connexion WebSocket
  void disconnect() async {
    isManuallyDisconnected = true;
    _socket.disconnect();
    Logger().i('Déconnecté MANUELLEMENT du serveur WebSocket');
  }
}
