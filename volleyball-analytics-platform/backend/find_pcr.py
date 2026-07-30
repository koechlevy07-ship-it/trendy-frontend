with open('app/schemas/statistics.py', 'r') as f:
    content = f.read()
idx = content.find('class PlayerComparisonResponse')
if idx >= 0:
    with open('find_pcr.txt', 'w') as f:
        f.write(content[idx:idx+200])
    print('Found at', idx)
else:
    with open('find_pcr.txt', 'w') as f:
        f.write('Not found')