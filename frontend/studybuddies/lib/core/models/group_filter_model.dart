class GroupFilterModel {
  String sortBy;
  int? schoolId;

  GroupFilterModel({
    this.sortBy = 'Alphabetically',
    this.schoolId = null,
  });

  void updateFilter({String? newSortBy, int? newSchoolId}) {
    if (newSortBy != null) sortBy = newSortBy;
    schoolId = newSchoolId;
  }

  Uri buildUrl(String baseUrl) {
    final queryParameters = <String, String>{};

    if (schoolId != null) {
      queryParameters['parentId'] = schoolId.toString();
    }

    var url = Uri.parse(baseUrl);
    if (queryParameters.isNotEmpty) {
      url = url.replace(queryParameters: queryParameters);
    }

    return url;
  }
}
