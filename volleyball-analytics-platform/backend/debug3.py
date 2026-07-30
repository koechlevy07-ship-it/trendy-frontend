with open('app/api/v1/endpoints/players.py', 'rb') as f:
    content = f.read()
idx = content.find(b'player_dict = {')
with open('debug3.txt', 'w') as f:
    if idx >= 0:
        start = max(0, idx - 50)
        end = min(len(content), idx + 4000)
        f.write(content[start:end].decode('utf-8', errors='replace'))
    else:
        f.write('Not found')