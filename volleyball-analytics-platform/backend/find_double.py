with open('app/schemas/match.py', 'r') as f:
    content = f.read()
print(f'Length: {len(content)}')
# Find all DOUBLE_CONTACT
positions = []
idx = 0
while True:
    idx = content.find('DOUBLE_CONTACT', idx)
    if idx == -1:
        break
    positions.append(idx)
    idx += 1

with open('find_report.txt', 'w') as f:
    f.write(f'Found at positions: {positions}\n')
    for pos in positions:
        start = max(0, pos - 30)
        end = min(len(content), pos + 30)
        f.write(f'  At {pos}: ...{content[start:end]}...\n')