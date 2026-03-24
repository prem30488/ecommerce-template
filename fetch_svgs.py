import os
import requests
from bs4 import BeautifulSoup
import re

url = 'https://hanleyhealthcare.com/pages/about'
text = requests.get(url).text
soup = BeautifulSoup(text, 'html.parser')

svgs = soup.find_all('svg')
for idx, svg in enumerate(svgs):
    # print snippet
    html = str(svg)
    if 'Improved Health and Vitality' in text or True:
        # just print all svgs that are likely icons
        if len(html) < 2000 and 'path' in html:
            print(f"--- SVG {idx} ---")
            print(html[:200])

