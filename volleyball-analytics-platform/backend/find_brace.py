with open('app/api/v1/endpoints/analytics.py', 'r') as f:
    content = f.read()
idx = content.find('}    ]')
if idx >= 0:
    print(f'Found at index {idx}')
    print(repr(content[idx-20:idx+20]))
else:
    print('Not found with } ]')
    # Search for patterns
    for pattern in ['}    ]', '} ]', '}\n    ]']:
        idx = content.find(pattern)
        if idx >= 0:
            print(f'Found {repr(pattern)} at {idx}')
            break