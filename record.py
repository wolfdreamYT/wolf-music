import mido
import time
import json

NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F',
              'F#', 'G', 'G#', 'A', 'A#', 'B']

def midi_to_note_name(midi_num):
    note = NOTE_NAMES[midi_num % 12]
    octave = (midi_num // 12) - 1
    return f"{note}{octave}"

print("Available MIDI inputs:")
inputs = mido.get_input_names()
for i, name in enumerate(inputs):
    print(f"{i}: {name}")

port_index = int(input("Select MIDI input index: "))
port_name = inputs[port_index]

print(f"\nConnecting to {port_name}...\n")

notes_on = {}
recorded_notes = []

start_time = time.time()

with mido.open_input(port_name) as port:
    print("Recording... Press CTRL+C to stop.\n")

    try:
        for msg in port:
            current_time = time.time() - start_time

            if msg.type == 'note_on' and msg.velocity > 0:
                notes_on[msg.note] = current_time

            elif msg.type in ['note_off', 'note_on'] and msg.note in notes_on:
                note_start = notes_on.pop(msg.note)
                duration = current_time - note_start

                recorded_notes.append({
                    "note": midi_to_note_name(msg.note),
                    "midi": msg.note,
                    "start": round(note_start, 3),
                    "duration": round(duration, 3)
                })

    except KeyboardInterrupt:
        print("\nStopped recording.")

with open("WOLFMUSIC - USER MIDI RECORDING.json", "w") as f:
    json.dump(recorded_notes, f, indent=4)

print("\nSaved in a JSON file. Hasta La Vista!")