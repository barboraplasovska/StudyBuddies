import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:studybuddies/ui/components/buttons/sb_button_tab.dart';
import 'package:studybuddies/ui/utils/data_tab.dart';

/// Switch
///
/// @param labels: List<String> - list of labels
/// @param selectedIndex: int - index of the selected label
/// @param selectedLabelIndex: Function(int) - action to be performed when label is selected
/// @param width: double? - width of the switch
class SBSwitch extends StatefulWidget {
  const SBSwitch({
    super.key,
    required this.labels,
    required this.selectedLabelIndex,
    required this.selectedIndex,
    this.width,
  });

  final List<String> labels;
  final int selectedIndex;
  final Function(int) selectedLabelIndex;
  final double? width;

  @override
  _SBSwitchState createState() => _SBSwitchState();
}

class _SBSwitchState extends State<SBSwitch> {
  final ValueNotifier<List<DataTab>> _labelsNotifier = ValueNotifier([]);

  void _setDefaultSelected() {
    for (int x = 0; x < widget.labels.length; x++) {
      _labelsNotifier.value
          .add(DataTab(title: widget.labels[x], isSelected: false));
    }
  }

  @override
  void initState() {
    super.initState();

    _setDefaultSelected();
    _updateSelected();

    _labelsNotifier.addListener(() {
      _updateSelected();
    });
  }

  void _updateSelected() {
    for (final item in _labelsNotifier.value) {
      item.isSelected = false;
    }

    _labelsNotifier.value[widget.selectedIndex].isSelected = true;
  }

  @override
  void dispose() {
    _labelsNotifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double _width = widget.width ?? 360;

    _updateSelected();

    return Container(
      width: _width,
      height: 40,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(15),
        color: Theme.of(context).colorScheme.secondary.withAlpha(200),
      ),
      child: ValueListenableBuilder(
        valueListenable: _labelsNotifier,
        builder: (context, labels, _) {
          return ListView.builder(
            itemCount: labels.length,
            scrollDirection: Axis.horizontal,
            itemBuilder: (context, index) {
              final label = labels[index];
              return SBButtonsTab(
                width: _width / widget.labels.length,
                title: label.title,
                isSelected: label.isSelected,
                onPressed: () {
                  try {
                    for (int x = 0; x < labels.length; x++) {
                      if (labels[index] == labels[x]) {
                        labels[x].isSelected = true;

                        widget.selectedLabelIndex(index);
                      } else {
                        labels[x].isSelected = false;
                      }
                    }
                  } catch (e) {
                    if (kDebugMode) {
                      print("err : $e");
                    }
                  }
                },
              );
            },
          );
        },
      ),
    );
  }
}
