import json
import os

data = {}
current_if = None

file_path = 'Campus de todos os IF´S/campi_institutos_federais_completo.md'

with open(file_path, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line.startswith('### '):
            current_if = line.replace('### ', '').strip()
            data[current_if] = []
        elif line.startswith('*   **') and current_if:
            campus = line.replace('*   **', '').replace('**', '').strip()
            data[current_if].append(campus)

with open('src/data_instituicoes.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
