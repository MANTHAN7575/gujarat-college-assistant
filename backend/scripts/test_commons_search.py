import requests
import urllib.parse

queries = [
    ('PDEU', 'Pandit Deendayal Energy University'),
    ('DAIICT', 'DA-IICT'),
    ('Nirma', 'Nirma University'),
    ('LDCE', 'L.D. College of Engineering'),
    ('LDRP', 'LDRP'),
    ('MSU', 'Maharaja Sayajirao University of Baroda'),
    ('CHARUSAT', 'Charotar University'),
    ('GujaratUni', 'Gujarat University Tower'),
    ('BVM', 'Birla Vishvakarma'),
    ('IITGn', 'IIT Gandhinagar'),
    ('IIMA', 'Indian Institute of Management Ahmedabad'),
    ('CEPT', 'CEPT University')
]

headers = {'User-Agent': 'GujaratCollegeAssistantBot/1.0 (manthan7575@gmail.com)'}

for tag, q in queries:
    url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(q)}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url|size&format=json"
    try:
        r = requests.get(url, headers=headers, timeout=5)
        pages = r.json().get('query', {}).get('pages', {})
        print(f"=== {tag} ({q}) ===")
        for p in pages.values():
            info = p.get('imageinfo', [{}])[0]
            title = p.get('title', '')
            u = info.get('url', '')
            width = info.get('width', 0)
            if u and not any(bad in u.lower() for bad in ['.svg', 'logo', 'map', 'seal', 'icon', 'portrait']):
                print(f"  {title} ({width}px) => {u}")
    except Exception as e:
        print(f"Error {tag}: {e}")
