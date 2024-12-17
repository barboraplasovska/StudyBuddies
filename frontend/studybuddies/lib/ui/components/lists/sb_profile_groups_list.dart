import 'package:flutter/material.dart';
import 'package:studybuddies/core/models/group_model.dart';
import 'package:studybuddies/ui/components/widgets/sb_group_role_widget.dart';

/// ProfileGroupsList
///
/// Description: List of groups the user is part of, expandable
///
/// @param title: String
/// @param grayTitle: bool
/// @param groups: List<GroupModel>
/// @param userId: int
class SBProfileGroupsList extends StatefulWidget {
  final String title;
  final bool? grayTitle;
  final List<GroupModel> groups;
  final int userId;

  const SBProfileGroupsList({
    super.key,
    required this.title,
    this.grayTitle,
    required this.groups,
    required this.userId,
  });
  @override
  State<SBProfileGroupsList> createState() => _SBProfileGroupsListState();
}

class _SBProfileGroupsListState extends State<SBProfileGroupsList> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    bool grayTitle = widget.grayTitle ?? false;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 10, 10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Text(
                widget.title,
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 20,
                  color:
                      grayTitle ? Colors.black.withOpacity(0.5) : Colors.black,
                ),
              ),
              const SizedBox(
                width: 20,
              ),
              Text(
                "${widget.groups.length} group${widget.groups.length > 1 || widget.groups.isEmpty ? 's' : ''}",
                style: TextStyle(
                  color: Colors.black.withOpacity(0.5),
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _expanded
              ? widget.groups.length + 1 // Add 1 for the divider
              : (widget.groups.length > 2 ? 3 : widget.groups.length),
          itemBuilder: (BuildContext context, int index) {
            if (!_expanded && index == 2 && widget.groups.length > 2) {
              return IntrinsicWidth(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 1,
                          color: const Color(0xFFECE7E3),
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _expanded = true;
                          });
                        },
                        child: const Text(
                          'Expand to see all',
                          style: TextStyle(
                            color: const Color(0xFF5F9DB4),
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Container(
                          height: 1,
                          color: const Color(0xFFECE7E3),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            } else if (_expanded && index == widget.groups.length) {
              return IntrinsicWidth(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 1,
                          color: const Color(0xFFECE7E3),
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _expanded = false;
                          });
                        },
                        child: const Text(
                          'Close',
                          style: TextStyle(
                            color: const Color(0xFF5F9DB4),
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Container(
                          height: 1,
                          color: const Color(0xFFECE7E3),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            } else {
              int actualIndex = _expanded ? index : index;
              return SBGroupRoleWidget(
                group: widget.groups[actualIndex],
                userId: widget.userId,
              );
            }
          },
        ),
      ],
    );
  }
}
