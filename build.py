import json, html
from pathlib import Path
ROOT=Path(__file__).parent
data=json.loads((ROOT/'content.json').read_text(encoding='utf-8'))
out=ROOT/'blog'; out.mkdir(exist_ok=True)
for post in data.get('blogs',[]):
    slug=post.get('slug','post').strip('/')
    folder=out/slug; folder.mkdir(parents=True,exist_ok=True)
    title=post.get('metaTitle') or post.get('title','Article')
    desc=post.get('metaDescription') or post.get('excerpt','')
    canonical=f'https://YOUR-DOMAIN.example/blog/{slug}/'
    paras=''.join('<p>'+html.escape(p).replace('\n','<br>')+'</p>' for p in post.get('body','').split('\n\n') if p.strip())
    img=post.get('image','')
    if img and not img.startswith(('http://','https://','/')):
        img='../../'+img
    image_html=f'<img class="article-cover" src="{html.escape(img,quote=True)}" alt="{html.escape(post.get("title",""))}">' if img else ''
    schema={"@context":"https://schema.org","@type":"BlogPosting","headline":post.get('title',''),"description":desc,"datePublished":post.get('date',''),"author":{"@type":"Organization","name":data.get('brand','AD 0RBITX')},"mainEntityOfPage":canonical}
    page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title><meta name="description" content="{html.escape(desc,quote=True)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{canonical}"><meta property="og:type" content="article"><meta property="og:title" content="{html.escape(title,quote=True)}"><meta property="og:description" content="{html.escape(desc,quote=True)}"><meta property="og:site_name" content="AD 0RBITX"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="../../style.css"><script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script></head><body><header><nav class="nav container"><a class="brand" href="../../index.html"><span class="brand-mark">A</span><span>AD 0RBITX | ADS & AI MARKETING</span></a><div class="nav-links"><a href="../../index.html">Home</a><a href="../../services.html">Services</a><a href="../../projects.html">Projects</a><a href="../../blog.html">Blog</a><a class="nav-cta" href="../../index.html#contact">Let's talk</a></div></nav></header><main class="page-content"><div class="container"><article class="article"><div class="article-meta">{html.escape(post.get('category','BLOG'))} · {html.escape(post.get('date',''))}</div><h1>{html.escape(post.get('title',''))}</h1>{image_html}<div class="article-body">{paras}</div><a class="link" href="../../blog.html">Back to all articles</a></article></div></main><footer class="footer"><div class="container"><p>© AD 0RBITX | ADS & AI MARKETING</p><a href="../../index.html">Home</a> · <a href="../../blog.html">Blog</a></div></footer></body></html>'''
    (folder/'index.html').write_text(page,encoding='utf-8')
urls=['https://YOUR-DOMAIN.example/','https://YOUR-DOMAIN.example/services.html','https://YOUR-DOMAIN.example/pricing.html','https://YOUR-DOMAIN.example/projects.html','https://YOUR-DOMAIN.example/blog.html']
urls += [f"https://YOUR-DOMAIN.example/blog/{p.get('slug','').strip('/')}/" for p in data.get('blogs',[])]
sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'<url><loc>{u}</loc></url>\n' for u in urls)+'</urlset>\n'
(ROOT/'sitemap.xml').write_text(sitemap,encoding='utf-8')
