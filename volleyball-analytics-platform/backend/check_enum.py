with open('app/schemas/match.py', 'r') as f:
    content = f.read()
count = content.count('DOUBLE_CONTACT')
with open('debug_count.txt', 'w') as f:
    f.write(f'DOUBLE_CONTACT count: {count}\n')