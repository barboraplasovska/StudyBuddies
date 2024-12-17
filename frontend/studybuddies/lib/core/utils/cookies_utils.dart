Map<String, String> parseCookies(String setCookie) {
  final cookies = <String, String>{};
  for (var cookie in setCookie.split(',')) {
    final parts = cookie.split(';')[0].split('=');
    if (parts.length == 2) {
      cookies[parts[0].trim()] = parts[1].trim();
    }
  }
  return cookies;
}
