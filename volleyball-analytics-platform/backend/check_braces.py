with open('app/api/v1/endpoints/players.py', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('player_dict = {')
if idx >= 0:
    brace_count = 0
    for i in range(idx, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                print(f'Found matching }} at index {i} (line {content[:i].count(chr(10)) + 1})')
                break
    else:
        print('No matching } found')
else:
    print('player_dict not found')