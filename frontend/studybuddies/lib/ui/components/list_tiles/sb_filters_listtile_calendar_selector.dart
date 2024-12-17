import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class SBFiltersListTileCalendarSelector extends StatefulWidget {
  final bool selectDate;
  final DateTime? value;
  final void Function(DateTime?)? onChanged;

  const SBFiltersListTileCalendarSelector({
    super.key,
    required this.selectDate,
    this.value,
    this.onChanged,
  });

  @override
  _SBFiltersListTileCalendarSelectorState createState() =>
      _SBFiltersListTileCalendarSelectorState();
}

class _SBFiltersListTileCalendarSelectorState
    extends State<SBFiltersListTileCalendarSelector> {
  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(
        widget.selectDate ? Icons.calendar_today : Icons.access_time,
        size: 28,
      ),
      title: Text(
        _getTitle(),
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 16,
        ),
      ),
      trailing: widget.value != null
          ? IconButton(
              icon: const Icon(Icons.close),
              color: Colors.red,
              onPressed: () {
                if (widget.onChanged != null) {
                  widget.onChanged!(null);
                }
              },
            )
          : null,
      onTap: () {
        _selectDateTime(context);
      },
    );
  }

  String _getTitle() {
    if (widget.value != null) {
      return widget.selectDate
          ? DateFormat.yMMMd().format(widget.value!)
          : DateFormat.Hm().format(widget.value!);
    } else {
      return widget.selectDate ? 'Any day' : 'Any time';
    }
  }

  Future<void> _selectDateTime(BuildContext context) async {
    if (widget.selectDate) {
      final DateTime? pickedDate = await showDatePicker(
        context: context,
        initialDate: widget.value ?? DateTime.now(),
        firstDate: DateTime(2000),
        lastDate: DateTime(2100),
      );
      if (pickedDate != null) {
        if (widget.onChanged != null) {
          widget.onChanged!(pickedDate);
        }
      }
    } else {
      final TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: widget.value != null
            ? TimeOfDay.fromDateTime(widget.value!)
            : TimeOfDay.now(),
      );
      if (pickedTime != null) {
        if (widget.onChanged != null) {
          widget.onChanged!(
            DateTime(
              DateTime.now().year,
              DateTime.now().month,
              DateTime.now().day,
              pickedTime.hour,
              pickedTime.minute,
            ),
          );
        }
      }
    }
  }
}
