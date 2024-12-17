class CredentialInfo {
  final String email;
  final String password;

  CredentialInfo({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
    };
  }
}
