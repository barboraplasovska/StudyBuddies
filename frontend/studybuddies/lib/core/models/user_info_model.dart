class UserInfo {
  final String name;
  final String description;
  final String roleId;
  final String? banDate;
  final String? picture;

  UserInfo({
    required this.name,
    required this.description,
    required this.roleId,
    this.banDate,
    this.picture,
  });

  Map<String, dynamic> toJson() {
    Map<String, dynamic> res = {
      'name': name,
      'description': description,
      'roleId': roleId,
    };
    if (banDate != null) {
      res['banDate'] = banDate;
    }
    if (picture != null) {
      res['picture'] = picture;
    }
    return res;
  }
}
