#!/usr/bin/env python3
import bibtexparser
import os
import copy
import json
import argparse


def resolve_bucket(s:str):
    s = s.lstrip("{ ")
    return s.rstrip(" }")

def bibentry_author_to_uranus_list(authors:str):
    results = []
    for author in authors.split(" and "):
        results.append({
            "name": author
        })
    return results

def get_paper_filepath(e):
    bib_id = e["ID"]
    return f"src/assets/pp/{bib_id}.pdf"

def get_slides_filepath(e):
    bib_id = e["ID"]
    return f"src/assets/pp/{bib_id}-slides.pdf"

def get_slides_url(e):
    bib_id = e["ID"]
    return f"/assets/pp/{bib_id}-slides.pdf"

def get_paper_url(e):
    bib_id = e["ID"]
    return f"/assets/pp/{bib_id}.pdf"

def bib_to_str(e):
    writer = bibtexparser.bwriter.BibTexWriter()
    db = bibtexparser.bibdatabase.BibDatabase()
    copy_e = copy.deepcopy(e)
    copy_e.pop('abstract', None)
    db.entries = [copy_e]
    return writer.write(db)

def bibentry_to_str(e):

    github_star = ""
    if "www-url" in e:
        url = e["www-url"]
        idx = url.find("https://github.com/")
        if idx != -1:
            name = url[len("https://github.com/"):]
            github_star = f"[![GitHub stars](https://img.shields.io/github/stars/{name}.svg?style=social&label=Star&maxAge=2592000)]({url})"



def try_get_bibentry_asset_url(filename:str, bibdb_assets_dir:str, bibdb_assets_url_prefix:str):
    filepath = os.path.join(bibdb_assets_dir, filename)
    if not os.path.exists(filepath):
        return None
    return f"{bibdb_assets_url_prefix}/{filename}"


def bibentry_to_uranus_dict(bibentry, bibdb_assets_dir, bibdb_assets_url_prefix):
    bibid = bibentry["ID"]
    uranus_paper = {}
    uranus_paper["name"] = resolve_bucket(bibentry["title"])
    uranus_paper["authors"] = bibentry_author_to_uranus_list(bibentry["author"])
    uranus_paper["authorExtra"] = ""
    uranus_paper["publicAt"] = bibentry["booktitle"]
    uranus_paper["abstract"] = bibentry["abstract"]
    paper_url = try_get_bibentry_asset_url(
        f"{bibid}.pdf",
        bibdb_assets_dir,
        bibdb_assets_url_prefix
    )
    if paper_url:
        uranus_paper["paperLink"] = paper_url
    uranus_paper["month"] =  bibentry["month"]
    uranus_paper["year"] = bibentry["year"]
    github_link = bibentry["www-url"]
    if github_link:
        uranus_paper["githubLink"] = github_link
        idx = github_link.find("https://github.com/")
        if idx != -1:
            repo_name = github_link[len("https://github.com/"):]
            github_start_svg_link = f"https://img.shields.io/github/stars/{repo_name}.svg?style=social&label=Star&maxAge=2592000"
        uranus_paper["githubStarsSvgLink"] = github_start_svg_link
    
    slides_link = try_get_bibentry_asset_url(
        f"{bibid}-slides.pdf",
        bibdb_assets_dir,
        bibdb_assets_url_prefix
    )
    if slides_link:
        uranus_paper["slideLink"] = slides_link
    uranus_paper["bibtex"] = bib_to_str(bibentry)
    return uranus_paper

def get_bibdb_from_file(tex_filepath: str):
    parser = bibtexparser.bparser.BibTexParser(common_strings=True)
    with open(tex_filepath) as f:
        db = bibtexparser.load(f, parser=parser)
    return db

def uranus_dicts_to_json_str(dicts) -> str:
    return json.dumps(dicts, indent=4)

def uranus_dicts_to_ts(dicts) -> str:
    json_str = json.dumps(dicts, indent=4)
    return f"""export default {json_str}"""

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("bib", type=str)
    parser.add_argument("out", type=str)
    parser.add_argument("--out-format", type=str, choices=["json", "ts"])
    parser.add_argument("--bib-assets-dir", type=str, help="Dir of extra resources for BibTex like slides, paper, etc.")
    parser.add_argument("--bib-assets-url-prefix", type=str, help="relative url prefix for the assets dir")
    

    args = parser.parse_args()

    bibdb_file = args.bib
    bibdb_assets_dir = args.bib_assets_dir
    bibdb_assets_url_prefix = args.bib_assets_url_prefix
    out = args.out
    out_fmt = args.out_format


    bibdb = get_bibdb_from_file(bibdb_file)
    uranus_dicts = []

    for e in bibdb.entries:
        uranus_dicts.append(
            bibentry_to_uranus_dict(
                e, 
                bibdb_assets_dir,
                bibdb_assets_url_prefix
            )
        )
    
    parent_dir = os.path.dirname(out)
    if not os.path.exists(parent_dir):
        os.makedirs(parent_dir)

    format_handlers = {
        "json": uranus_dicts_to_json_str,
        "ts": uranus_dicts_to_ts
    }
    with open(out, "w") as f:
        content = format_handlers[out_fmt](uranus_dicts)
        f.write(content)


if __name__ == "__main__":
    main()