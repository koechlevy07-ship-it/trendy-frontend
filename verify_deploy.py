with open('C:/temp/admin_live.html', 'r', encoding='utf-8') as f:
    content = f.read()
print('productOriginalPrice: ' + ('FOUND' if 'productOriginalPrice' in content else 'MISSING'))
print('productLimitedAvailable: ' + ('FOUND' if 'productLimitedAvailable' in content else 'MISSING'))
print('Limited pieces available: ' + ('FOUND' if 'Limited pieces available' in content else 'MISSING'))
print('Original Price: ' + ('FOUND' if 'Original Price' in content else 'MISSING'))
print('Size: ' + str(len(content)))
