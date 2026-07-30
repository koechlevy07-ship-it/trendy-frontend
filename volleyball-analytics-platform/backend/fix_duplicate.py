with open('app/schemas/match.py', 'r') as f:
    content = f.read()
idx = content.find('"""Match schemas."""')
if idx >= 0:
    idx2 = content.find('"""Match schemas."""', idx + 1)
    if idx2 > 0:
        with open('fix_report.txt', 'w') as f:
            f.write(f'First at {idx}, second at {idx2}\n')
        # Remove the duplicate
        new_content = content[:idx2]
        with open('app/schemas/match.py', 'w') as f:
            f.write(new_content)
        with open('fix_report.txt', 'a') as f:
            f.write('Fixed - removed duplicate\n')
    else:
        with open('fix_report.txt', 'w') as f:
            f.write('Only one occurrence\n')
else:
    with open('fix_report.txt', 'w') as f:
        f.write('Not found\n')