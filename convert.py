import mido
import json

NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F',
              'F#', 'G', 'G#', 'A', 'A#', 'B'
            ]

def midi_to_note_name(midi_num):
    note = NOTE_NAMES[midi_num % 12]
    octave = (midi_num // 12) - 1
    return f"{note}{octave}"

def midi_to_json(midi_file, output_file):
    mid = mido.MidiFile(midi_file)

    notes_on = {}
    result = []

    current_time = 0  

    for msg in mid:
        current_time += msg.time

        if msg.type == 'note_on' and msg.velocity > 0:
            notes_on[msg.note] = current_time

        elif msg.type in ['note_off', 'note_on'] and msg.note in notes_on:
            start_time = notes_on.pop(msg.note)
            duration = current_time - start_time

            result.append({
                "note": midi_to_note_name(msg.note),
                "midi": msg.note,
                "start": round(start_time, 3),
                "duration": round(duration, 3)
            })

    result.sort(key=lambda x: x["start"])

    with open(output_file, "w") as f:
        json.dump(result, f, indent=4)

    print(f"Saved to {output_file}")


midi_to_json("your-file-name.mid", "WOLFMUSIC-CONVERTED.json")
