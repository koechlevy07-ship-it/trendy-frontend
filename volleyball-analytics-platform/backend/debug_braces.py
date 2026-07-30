with open('app/api/v1/endpoints/players.py', 'rb') as f:
    content = f.read()
idx = content.find(b'player_dict = {')
with open('debug.txt', 'w') as f:
    f.write(f'Found at index: {idx}\n')
    if idx >= 0:
        brace_count = 0
        for i in range(idx, len(content)):
            if content[i:i+1] == b'{':
                brace_count += 1
            elif content[i:i+1] == b'}':
                brace_count -= 1
                if brace_count == 0:
                    f.write(f'Found matching }} at index {i}\n')
                    break
        else:
            f.write('No matching } found\n')
    else:
        f.write('Not found\n')