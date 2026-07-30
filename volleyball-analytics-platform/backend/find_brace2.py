with open('app/api/v1/endpoints/analytics.py', 'r') as f:
    content = f.read()
for i, line in enumerate(content.split('\n')):
    if ']' in line and '}' not in line:
        print(f'Line {i+1}: {repr(line)}')