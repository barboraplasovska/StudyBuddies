class ExamModel {
  final int? id;
  final String name;
  final String description;
  int? userId;
  final String date;
  final String endtime;

  ExamModel({
    this.id,
    required this.name,
    required this.description,
    this.userId,
    required this.date,
    required this.endtime,
  });

  // Factory constructor to create an Exam from a JSON object
  factory ExamModel.fromJson(Map<String, dynamic> json) {
    return ExamModel(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      userId: json['userId'],
      date: json['date'],
      endtime: json['endtime'],
    );
  }

  // Method to convert an Exam instance to a JSON object
  Map<String, dynamic> toJson() {
    Map<String, dynamic> res = {
      'name': name,
      'description': description,
      'date': DateTime.parse(date).toIso8601String(),
      'endtime': DateTime.parse(endtime).toIso8601String(),
    };

    if (id != null) {
      res['id'] = id;
    }

    if (userId != null) {
      res['userId'] = userId;
    }

    return res;
  }

  String getTime() {
    DateTime dateTime = DateTime.parse(date);
    String formattedTime =
        "${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}";
    return formattedTime;
  }

  String getEndTime() {
    DateTime dateTime = DateTime.parse(endtime);
    String formattedTime =
        "${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}";
    return formattedTime;
  }
}
