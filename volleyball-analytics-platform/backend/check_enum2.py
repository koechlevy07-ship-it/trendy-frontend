with open('app/schemas/match.py', 'r') as f:
    content = f.read()
# Find all positions of DOUBLE_CONTACT
positions = []
idx = 0
while True:
    idx = content.find('DOUBLE_CONTACT', idx)
    if idx == -1:
        break
    positions.append(idx)
    idx += 1

with open('debug_positions.txt', 'w') as f:
    for pos in positions:
        # Show context
        start = max(0, idx - 50)
        end = min(len(content), idx + 50)
        f.write(f'Position {pos}: ...{content[start:end]}...\n')
    f.write(f'Total: {len(positions)}\n')