import 'package:flutter/material.dart';

class SBSelectionField extends StatelessWidget {
  final String hintText;
  final String? labelText;
  final List<String> options;
  final String? value;
  final void Function(String?)? onChanged;
  final bool isEnabled;

  SBSelectionField({
    required this.hintText,
    this.labelText,
    required this.options,
    this.value,
    this.onChanged,
    this.isEnabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (labelText != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: Text(
                labelText!,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Colors.black,
                ),
              ),
            ),
          DropdownButtonFormField<String>(
            hint: Text(hintText),
            value: value,
            onChanged: isEnabled ? onChanged : null,
            items: options.map((option) {
              return DropdownMenuItem<String>(
                value: option,
                child: Text(option),
              );
            }).toList(),
            decoration: InputDecoration(
              filled: true,
              fillColor: isEnabled
                  ? Theme.of(context).colorScheme.onPrimary
                  : Colors.grey.shade300,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide.none,
              ),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(
                  color: isEnabled
                      ? Theme.of(context).colorScheme.primary
                      : Colors.grey,
                  width: 2,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(
                  color: isEnabled
                      ? Theme.of(context).colorScheme.onSecondary
                      : Colors.grey,
                  width: 2,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
