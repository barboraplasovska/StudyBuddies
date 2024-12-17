import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

enum TextFieldType { email, password, date, time, text }

class SBTextField extends StatefulWidget {
  final String hintText;
  final String? labelText;
  final TextEditingController controller;
  final TextFieldType type;
  final double? width;
  final void Function(String)? onChanged;
  final void Function()? onTap;
  final bool? disabled;
  final bool? multipleLines;

  SBTextField({
    required this.hintText,
    this.labelText,
    required this.controller,
    this.type = TextFieldType.text,
    this.width,
    this.onChanged,
    this.onTap,
    this.disabled,
    this.multipleLines,
  });

  @override
  _ThemedTextFieldState createState() => _ThemedTextFieldState();
}

class _ThemedTextFieldState extends State<SBTextField> {
  bool isFocused = false;
  late bool _obscureText;

  @override
  void initState() {
    super.initState();
    _obscureText = widget.type == TextFieldType.password;
  }

  void _togglePasswordVisibility() {
    setState(() {
      _obscureText = !_obscureText;
    });
  }

  Future<void> _selectTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (picked != null) {
      setState(() {
        widget.controller.text = picked.format(context);
      });
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
    );
    if (picked != null) {
      setState(() {
        widget.controller.text = DateFormat('dd/MM/yyyy').format(picked);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width:
          widget.type == TextFieldType.time || widget.type == TextFieldType.date
              ? 160
              : (widget.width ?? double.infinity),
      margin: const EdgeInsets.symmetric(vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.labelText != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: Text(
                widget.labelText ?? '',
                style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.black),
              ),
            ),
          TextField(
            controller: widget.controller,
            obscureText:
                widget.type == TextFieldType.password ? _obscureText : false,
            onChanged: widget.onChanged,
            keyboardType: widget.multipleLines == true
                ? TextInputType.multiline
                : TextInputType.text,
            minLines: widget.multipleLines == true ? 4 : null,
            maxLines: widget.multipleLines == true ? null : 1,
            onTap: () {
              setState(() {
                isFocused = true;
              });
              if (widget.type == TextFieldType.time) {
                _selectTime(context);
              } else if (widget.type == TextFieldType.date) {
                _selectDate(context);
              }
              widget.onTap?.call();
            },
            onEditingComplete: () {
              setState(() {
                isFocused = false;
              });
            },
            decoration: InputDecoration(
              hintText: widget.hintText,
              filled: true,
              fillColor: Theme.of(context).colorScheme.onPrimary,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide.none,
              ),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(
                  color: Theme.of(context).colorScheme.primary,
                  width: 2,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(
                  color: Theme.of(context).colorScheme.onSecondary,
                  width: 2,
                ),
              ),
              suffixIcon: widget.type == TextFieldType.password
                  ? IconButton(
                      icon: Icon(_obscureText
                          ? Icons.visibility_off
                          : Icons.visibility),
                      onPressed: _togglePasswordVisibility,
                    )
                  : widget.type == TextFieldType.time
                      ? const Icon(Icons.access_time)
                      : widget.type == TextFieldType.date
                          ? const Icon(Icons.calendar_today)
                          : null,
            ),
            readOnly: widget.disabled ?? false,
          ),
        ],
      ),
    );
  }
}
