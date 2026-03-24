import os
import re
import requests

base_dir = r"e:\ecommerce-template\ecommerce-template\Front End\public\images\about"
os.makedirs(base_dir, exist_ok=True)
url = 'https://hanleyhealthcare.com/pages/about'
text = requests.get(url).text

# Find all CDN urls
matches = re.findall(r'https://cdn\.shopify\.com/[^\s"\'<>]+?\.(?:jpg|png|webp)', text)

urls = list(set(matches))
count = 1
for u in urls:
    if 'logo' in u.lower() or 'icon' in u.lower():
        continue
    print("Fetching:", u)
    try:
        data = requests.get(u).content
        if len(data) > 20000: # at least 20KB
            p = os.path.join(base_dir, f"about_{count}.jpg")
            with open(p, 'wb') as f:
                f.write(data)
            print("Saved to", p)
            count += 1
            if count > 4:
                break
    except Exception as e:
        pass
