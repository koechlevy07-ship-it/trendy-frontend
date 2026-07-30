with open('C:/temp/admin_live3.html', 'r', encoding='utf-8') as f:
    content = f.read()
with open('C:/temp/verify_result.txt', 'w') as f:
    f.write('productOriginalPrice: ' + ('FOUND' if 'productOriginalPrice' in content else 'MISSING') + '\n')
    f.write('productLimitedAvailable: ' + ('FOUND' if 'productLimitedAvailable' in content else 'MISSING') + '\n')
    f.write('Limited pieces available: ' + ('FOUND' if 'Limited pieces available' in content else 'MISSING') + '\n')
    f.write('Size: ' + str(len(content)) + '\n')
