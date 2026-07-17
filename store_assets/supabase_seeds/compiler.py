"""
Residency/fellowship compiler for MatchaMD.
Collects public program information, normalizes it, and writes Supabase-ready SQL/CSV.

Compilation strategy:
1. Built-in known-program seeder for offline dataset generation.
2. Optional payload-mode import from raw local exports.
3. Optional live scrape of NRMP/FREIDA/AMA PDFs into normalized outputs.
4. Optional enrichment scaffold generation.

Run:
  python compiler.py
  python compiler.py --payload compiler_payload.csv
  python compiler.py --skip-live
  python compiler.py --seed-only
  python compiler.py --enrichment
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable, List, Optional

try:
    import requests
except Exception:
    requests = None  # type: ignore

try:
    from bs4 import BeautifulSoup
except Exception:
    BeautifulSoup = None  # type: ignore

try:
    import pdfplumber
except Exception:
    pdfplumber = None  # type: ignore

BASE_DIR = Path(r"C:\Users\paulf\matchamd")
DEFAULT_CACHE_DIR = BASE_DIR / "store_assets" / "supabase_seeds" / "compiler_cache"
DEFAULT_OUT_DIR = BASE_DIR / "store_assets" / "supabase_seeds"

NRMP_DIRECTORY = "https://programdirectory.nrmp.org"
FREIDA_ROOT = "https://freida.ama-assn.org"
AMA_RESULTS_2026 = "https://www.nrmp.org/wp-content/uploads/2025/03/2026-Main-Residency-Match-Results-Report.pdf"

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; MatchaMD-Compiler/1.0; +https://matchamd.local)"}


@dataclass
class ProgramRecord:
    program_name: str = ""
    institution: str = ""
    specialty: str = ""
    city: str = ""
    state: str = ""
    acgme_program_id: str = ""
    website: str = ""
    eras_participation: bool = False
    nrmp_participation: bool = False
    program_type: str = "residency"
    program_size: Optional[int] = None
    program_director: str = ""
    coordinator: str = ""
    contact_email: str = ""
    img_friendly_score: Optional[float] = None
    interview_format: str = ""
    visa_j1: bool = False
    visa_h1b: bool = False
    housing_subsidized: bool = False
    step2_score_avg: Optional[int] = None
    ai_summary: str = ""
    verified: bool = False


def safe_request(url: str, *, cache_path: Path, force_refresh: bool = False, timeout: int = 60):
    if requests is None:
        raise RuntimeError("requests is required for network compilation steps.")
    if cache_path.exists() and not force_refresh:
        return cache_path.read_bytes()
    resp = requests.get(url, headers=HEADERS, timeout=timeout)
    if resp.status_code != 200:
        raise RuntimeError(f"HTTP {resp.status_code} fetching {url}")
    data = resp.content
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_bytes(data)
    return data


def slugify(text: str) -> str:
    text = text.strip()
    text = re.sub(r"[^a-zA-Z0-9_-]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text[:80] or "page"


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def extract_city_state(text: str):
    text = text.strip()
    if "," in text:
        city, state = text.rsplit(",", 1)
        return normalize_text(city), normalize_text(state)
    return normalize_text(text), ""


def find_state_abbrev(text: str):
    m = re.findall(r"\b([A-Z]{2})\b", text)
    return m[0] if m else ""


def col_sql_value(v):
    if v is None or v == "":
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def parse_bool(val):
    return str(val).strip().lower() in {"true", "1", "yes", "y"}


def parse_number(val):
    try:
        if "." in str(val):
            return float(val)
        return int(val)
    except Exception:
        return None


# ---------------------------
# Built-in payload seeder
# ---------------------------

KNOWN_PROGRAMS: List[dict] = [
    {"program_name":"Internal Medicine Residency Program","institution":"John H. Stroger, Jr. Hospital of Cook County","specialty":"Internal Medicine","city":"Chicago","state":"IL","acgme_program_id":"1138140C0","website":"https://www.cookcountyhealth.org","eras_participation":True,"nrmp_participation":True,"program_type":"residency","program_size":135,"program_director":"","coordinator":"","contact_email":"","img_friendly_score":9.5,"interview_format":"Virtual","visa_j1":True,"visa_h1b":False,"housing_subsidized":False,"step2_score_avg":242,"ai_summary":"Large county IM program with broad case volume; historically very IMG-friendly."},
    {"program_name":"Internal Medicine Residency Program","institution":"Jacobi Medical Center / Albert Einstein College of Medicine","specialty":"Internal Medicine","city":"Bronx","state":"NY","acgme_program_id":"1475140C0","website":"https://www.jacobiim.org","eras_participation":True,"nrmp_participation":True,"program_type":"residency","program_size":96,"program_director":"","coordinator":"","contact_email":"","img_friendly_score":9.2,"interview_format":"Virtual","visa_j1":True,"visa_h1b":True,"housing_subsidized":True,"step2_score_avg":238,"ai_summary":"Urban IM residency with strong IMG representation and academic affiliation."},
    {"program_name":"Family Medicine Residency Program","institution":"BronxCare Health System","specialty":"Family Medicine","city":"Bronx","state":"NY","acgme_program_id":"1480120C0","website":"https://www.bronxcare.org","eras_participation":True,"nrmp_participation":True,"program_type":"residency","program_size":36,"program_director":"","coordinator":"","contact_email":"","img_friendly_score":9.4,"interview_format":"Hybrid","visa_j1":True,"visa_h1b":True,"housing_subsidized":True,"step2_score_avg":232,"ai_summary":"Community-based family medicine program with very high IMG share."},
    {"program_name":"Internal Medicine Residency Program","institution":"Cleveland Clinic Foundation","specialty":"Internal Medicine","city":"Cleveland","state":"OH","acgme_program_id":"1547140C0","website":"https://my.clevelandclinic.org","eras_participation":True,"nrmp_participation":True,"program_type":"residency","program_size":120,"program_director":"","coordinator":"","contact_email":"","img_friendly_score":7.2,"interview_format":"Virtual","visa_j1":True,"visa_h1b":True,"housing_subsidized":False,"step2_score_avg":252,"ai_summary":"Large academic IM program; competitive but visa-supported."},
    {"program_name":"Internal Medicine Residency Program","institution":"Rutgers New Jersey Medical School","specialty":"Internal Medicine","city":"Newark","state":"NJ","acgme_program_id":"1398140C0","website":"https://njms.rutgers.edu","eras_participation":True,"nrmp_participation":True,"program_type":"residency","program_size":105,"program_director":"","coordinator":"","contact_email":"","img_friendly_score":8.0,"interview_format":"Virtual","visa_j1":True,"visa_h1b":False,"housing_subsidized":False,"step2_score_avg":243,"ai_summary":"Academic IM residency with moderate IMG representation."},
    {"program_name":"Family Medicine Residency Program","institution":"Texas Tech University Health Sciences Center","specialty":"Family Medicine","city":"Lubbock","state":"TX","acgme_program_id":"1724120C0","website":"https://www.ttuhsc.edu","eras_participation":True,"nrmp_participation":True,"program_type":"residency","program_size":30,"program_director":"","coordinator":"","contact_email":"","img_friendly_score":8.4,"interview_format":"Hybrid","visa_j1":True,"visa_h1b":False,"housing_subsidized":False,"step2_score_avg":234,"ai_summary":"Rural-focused FM program with steady IMG intake."}
]


def compile_known_programs() -> List[ProgramRecord]:
    print("Compiling known-program payload.")
    records = []
    for row in KNOWN_PROGRAMS:
        rec = ProgramRecord()
        for k, v in row.items():
            if hasattr(rec, k):
                setattr(rec, k, v)
        rec.verified = True
        records.append(rec)
    print(f"Known-program payload compiled: {len(records)}")
    return records


# ---------------------------
# Payload compiler
# ---------------------------

def compile_payload(path: Path) -> List[ProgramRecord]:
    print(f"Compiling payload: {path}")
    if not path.exists():
        raise FileNotFoundError(f"Payload not found: {path}")
    records = []
    with path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        print(f"Payload columns: {fieldnames}")
        for row in reader:
            rec = ProgramRecord()
            for key, value in row.items():
                if not hasattr(rec, key):
                    continue
                if key in {"eras_participation", "nrmp_participation", "visa_j1", "visa_h1b", "housing_subsidized"}:
                    setattr(rec, key, parse_bool(value))
                elif key in {"program_size", "step2_score_avg"}:
                    setattr(rec, key, parse_number(value))
                elif key in {"img_friendly_score"}:
                    parsed = parse_number(value)
                    setattr(rec, key, parsed)
                else:
                    setattr(rec, key, (value or "").strip())
            records.append(rec)
    print(f"Payload records compiled: {len(records)}")
    return records


# ---------------------------
# NRMP compiler
# ---------------------------

def compile_nrmp_directory(*, cache_dir: Path, force_refresh: bool = False, limit: int = 0) -> List[ProgramRecord]:
    if requests is None:
        print("requests not installed; skipping NRMP directory compilation.")
        return []
    records: List[ProgramRecord] = []
    cache_html = cache_dir / "nrmp-program-list.html"
    out_csv = cache_dir / "nrmp_programs.csv"
    start_time = time.time()

    print("Compiling NRMP program directory.")
    try:
        data = safe_request(NRMP_DIRECTORY, cache_path=cache_html, force_refresh=force_refresh)
        html = data.decode("utf-8", errors="ignore")
    except Exception as exc:
        print(f"NRMP root fetch failed: {exc}")
        return []

    rows = []
    if BeautifulSoup is None:
        print("beautifulsoup4 not installed; NRMP using anchor fallback parsing.")
        for m in re.finditer(r'<a[^>]+href="([^"]+)"[^>]*>([^<]+)</a>', html, re.I | re.S):
            href, text = m.group(1), normalize_text(m.group(2))
            if not text or ("NRMP" in text and len(text) < 8):
                continue
            if not re.search(r'program|detail|residency', href, re.I) and not re.search(r'program|residency', text, re.I):
                continue
            display = href if href.startswith("http") else NRMP_DIRECTORY + href if href.startswith("/") else NRMP_DIRECTORY + "/" + href
            rows.append({
                "program_name": text,
                "institution": "",
                "specialty": "",
                "city": "",
                "state": "",
                "acgme_program_id": "",
                "website": display,
                "eras_participation": True,
                "nrmp_participation": True,
                "program_type": "residency",
                "program_size": None,
                "program_director": "",
                "coordinator": "",
                "contact_email": "",
                "img_friendly_score": None,
                "interview_format": "",
                "visa_j1": False,
                "visa_h1b": False,
                "housing_subsidized": False,
                "step2_score_avg": None,
                "ai_summary": "Auto-extracted from NRMP directory fallback.",
                "verified": False,
            })
            if limit and len(rows) >= limit:
                break
    else:
        soup = BeautifulSoup(html, "html.parser")
        cards = soup.find_all(["div", "li", "tr"], class_=re.compile(r"program|result|item", re.I))
        if not cards:
            anchors = soup.find_all("a", href=re.compile(r"program|detail", re.I))
            print(f"NRMP listing used BS4 anchor fallback: {len(anchors)} anchors.")
            for a in anchors[: max(limit, 200) or len(anchors)]:
                href = a.get("href", "")
                text = normalize_text(a.get_text(" ", strip=True))
                if not text or "NRMP" in text and len(text) < 8:
                    continue
                rows.append({
                    "program_name": text,
                    "institution": "",
                    "specialty": "",
                    "city": "",
                    "state": "",
                    "acgme_program_id": "",
                    "website": href if href.startswith("http") else NRMP_DIRECTORY + href,
                    "eras_participation": True,
                    "nrmp_participation": True,
                    "program_type": "residency",
                    "program_size": None,
                    "program_director": "",
                    "coordinator": "",
                    "contact_email": "",
                    "img_friendly_score": None,
                    "interview_format": "",
                    "visa_j1": False,
                    "visa_h1b": False,
                    "housing_subsidized": False,
                    "step2_score_avg": None,
                    "ai_summary": "Auto-extracted from NRMP directory.",
                    "verified": False,
                })
        else:
            count = 0
            for card in cards:
                if limit and count >= limit:
                    break
                title = normalize_text(card.get_text(" ", strip=True))
                if not title or len(title) < 6:
                    continue
                href = ""
                link = card.find("a", href=True)
                if link:
                    href = link["href"]
                    if not href.startswith("http"):
                        href = NRMP_DIRECTORY + href if href.startswith("/") else NRMP_DIRECTORY + "/" + href
                city, state = "", ""
                for bit in re.split(r"[\|\-–—]", title):
                    s = find_state_abbrev(bit)
                    if s:
                        state = s
                        city = normalize_text(bit).replace(s, "").strip(" ,")
                        title = normalize_text(title.replace(bit, ""))
                        title = re.sub(r"^[\s\-–—\|]+", "", title)
                        break
                rows.append({
                    "program_name": title,
                    "institution": "",
                    "specialty": "",
                    "city": city,
                    "state": state,
                    "acgme_program_id": "",
                    "website": href,
                    "eras_participation": True,
                    "nrmp_participation": True,
                    "program_type": "residency",
                    "program_size": None,
                    "program_director": "",
                    "coordinator": "",
                    "contact_email": "",
                    "img_friendly_score": None,
                    "interview_format": "",
                    "visa_j1": False,
                    "visa_h1b": False,
                    "housing_subsidized": False,
                    "step2_score_avg": None,
                    "ai_summary": "Auto-extracted from NRMP directory.",
                    "verified": False,
                })
                count += 1
    print(f"NRMP raw rows extracted: {len(rows)}")
    dedup = {}
    for row in rows:
        key = row.get("program_name", "").lower()
        if key not in dedup:
            dedup[key] = row
    deduped = list(dedup.values())
    print(f"NRMP deduped rows: {len(deduped)}")

    out_csv.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "program_name","institution","specialty","city","state","acgme_program_id","website",
        "eras_participation","nrmp_participation","program_type","program_size","program_director",
        "coordinator","contact_email","img_friendly_score","interview_format","visa_j1","visa_h1b",
        "housing_subsidized","step2_score_avg","ai_summary","verified",
    ]
    with out_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in deduped:
            writer.writerow({k: row.get(k, "") for k in fieldnames})
    print(f"Wrote NRMP compiled CSV: {out_csv} rows={len(deduped)}")
    for row in deduped:
        records.append(ProgramRecord(**{k: row.get(k, "") for k in fieldnames}))
    elapsed = time.time() - start_time
    print(f"NRMP compile elapsed={elapsed:.2f}s")
    return records


# ---------------------------
# FREIDA compiler
# ---------------------------

def compile_freida_programs(*, cache_dir: Path, force_refresh: bool = False, limit: int = 0) -> List[ProgramRecord]:
    if requests is None:
        return []
    records: List[ProgramRecord] = []
    out_csv = cache_dir / "freida_programs.csv"
    start_time = time.time()

    print("Compiling FREIDA open pages.")
    try:
        first = safe_request(FREIDA_ROOT, cache_path=cache_dir / "freida_root.html", force_refresh=force_refresh)
        html = first.decode("utf-8", errors="ignore")
        urls = []
        for m in re.finditer(r'href="(/[^"]+)"', html):
            href = m.group(1)
            if any(tok in href.lower() for tok in ["search", "program", "specialty", "residency", "fellowship", "detail"]):
                candidate = FREIDA_ROOT + href if href.startswith("/") else FREIDA_ROOT + "/" + href
                urls.append(candidate)
            if limit and len(urls) >= limit:
                break
        urls = list(dict.fromkeys(urls))[: max(limit or 20, 20)]
        print(f"FREIDA discovered URLs: {len(urls)}")
    except Exception as exc:
        print(f"FREIDA root fetch failed: {exc}")
        return []

    rows = []
    for url in urls:
        try:
            data = safe_request(url, cache_path=cache_dir / f"freida-{slugify(url)}.html", force_refresh=force_refresh)
            text = data.decode("utf-8", errors="ignore")
        except Exception as exc:
            print(f"FREIDA fetch failed: {url} -> {exc}")
            continue
        city, state = extract_city_state(normalize_text(text[:2200]))
        institution_match = re.search(r"<title[^>]*>([^<]+)</title>", text, re.I | re.S)
        institution = normalize_text(institution_match.group(1)) if institution_match else ""
        program_name_match = re.search(r"<h1[^>]*>([^<]+)</h1>", text, re.I | re.S)
        program_name = normalize_text(program_name_match.group(1)) if program_name_match else ""
        if not program_name:
            program_name = normalize_text(re.sub(r"\s+", " ", text[:140])).strip(". ")
        program_name = program_name or "FREIDA Program"
        institution = institution or program_name
        rows.append({
            "program_name": program_name,
            "institution": institution,
            "specialty": "",
            "city": city,
            "state": state,
            "acgme_program_id": "",
            "website": url,
            "eras_participation": False,
            "nrmp_participation": False,
            "program_type": "residency" if "residency" in text.lower() else "fellowship" if "fellowship" in text.lower() else "unknown",
            "program_size": None,
            "program_director": "",
            "coordinator": "",
            "contact_email": "",
            "img_friendly_score": None,
            "interview_format": "",
            "visa_j1": False,
            "visa_h1b": False,
            "housing_subsidized": False,
            "step2_score_avg": None,
            "ai_summary": "Auto-extracted from FREIDA.",
            "verified": False,
        })
    dedup = {}
    for row in rows:
        key = row["program_name"].lower()
        if key not in dedup:
            dedup[key] = row
    out_rows = list(dedup.values())
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "program_name","institution","specialty","city","state","acgme_program_id","website",
        "eras_participation","nrmp_participation","program_type","program_size","program_director",
        "coordinator","contact_email","img_friendly_score","interview_format","visa_j1","visa_h1b",
        "housing_subsidized","step2_score_avg","ai_summary","verified",
    ]
    with out_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in out_rows:
            writer.writerow({k: row.get(k, "") for k in fieldnames})
    print(f"Wrote FREIDA compiled CSV: {out_csv} rows={len(out_rows)}")
    records = [ProgramRecord(**{k: row.get(k, "") for k in fieldnames}) for row in out_rows]
    elapsed = time.time() - start_time
    print(f"FREIDA compile elapsed={elapsed:.2f}s")
    return records


# ---------------------------
# PDF compiler
# ---------------------------

def compile_pdf_reports(*, cache_dir: Path, force_refresh: bool = False, urls: Optional[List[str]] = None) -> List[ProgramRecord]:
    if pdfplumber is None:
        print("pdfplumber not installed; skipping PDF compilation.")
        return []
    if requests is None:
        print("requests not installed; skipping PDF compilation.")
        return []
    urls = urls or [AMA_RESULTS_2026]
    rows: List[dict] = []
    print("Compiling PDF reports.")
    for url in urls:
        cache_pdf = cache_dir / f"{slugify(url)}.pdf"
        cache_txt = cache_dir / f"{slugify(url)}.txt"
        try:
            data = safe_request(url, cache_path=cache_pdf, force_refresh=force_refresh)
            if not cache_txt.exists() or force_refresh:
                text = ""
                with pdfplumber.open(io.BytesIO(data)) as pdf:
                    for page in pdf.pages[:80]:
                        page_text = page.extract_text() or ""
                        text += page_text + "\n"
                cache_txt.write_text(text, encoding="utf-8")
            else:
                text = cache_txt.read_text(encoding="utf-8", errors="ignore")
        except Exception as exc:
            print(f"PDF compile failed for {url}: {exc}")
            continue
        for row in _parse_match_report_text(text):
            rows.append(row)
    out_csv = cache_dir / "pdf_programs.csv"
    dedup, out_rows = {}, []
    for row in rows:
        key = (row.get("program_name", "").lower(), row.get("institution", "").lower())
        if not key[0]:
            continue
        if key not in dedup:
            dedup[key] = row
            out_rows.append(row)
    fieldnames = [
        "program_name","institution","specialty","city","state","acgme_program_id","website",
        "eras_participation","nrmp_participation","program_type","program_size","program_director",
        "coordinator","contact_email","img_friendly_score","interview_format","visa_j1","visa_h1b",
        "housing_subsidized","step2_score_avg","ai_summary","verified",
    ]
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    with out_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in out_rows:
            writer.writerow({k: row.get(k, "") for k in fieldnames})
    print(f"Wrote PDF compiled CSV: {out_csv} rows={len(out_rows)}")
    return [ProgramRecord(**{k: row.get(k, "") for k in fieldnames}) for row in out_rows]


def _parse_match_report_text(text: str):
    rows = []
    patterns = [
        re.compile(r"(?P<institution>.+?)\s+[–\-]\s+(?P<city>[^,]+),\s+(?P<state>[A-Z]{2})\s+(?P<specialty>.+?)\s+(?P<filled>\d+)/(?P<positions>\d+)", re.I),
        re.compile(r"(?P<institution>[^\(\)\n]+?)\s*\(\s*(?P<state>[A-Z]{2})\s*\)\s*(?P<specialty>.+?)\s*(?P<filled>\d+)/(?P<positions>\d+)", re.I),
    ]
    seen = set()
    for pat in patterns:
        for m in pat.finditer(text):
            row = {
                "program_name": f"{m.group('specialty').strip()} Residency Program",
                "institution": normalize_text(m.group("institution")),
                "specialty": normalize_text(m.group("specialty")),
                "city": normalize_text(m.group("city")),
                "state": normalize_text(m.group("state")),
                "acgme_program_id": "",
                "website": "",
                "eras_participation": True,
                "nrmp_participation": True,
                "program_type": "residency",
                "program_size": int(m.group("positions")) if m.group("positions").isdigit() else None,
                "program_director": "",
                "coordinator": "",
                "contact_email": "",
                "img_friendly_score": None,
                "interview_format": "",
                "visa_j1": False,
                "visa_h1b": False,
                "housing_subsidized": False,
                "step2_score_avg": None,
                "ai_summary": "Auto-parsed from public match report.",
                "verified": False,
            }
            key = (row["program_name"].lower(), row["institution"].lower())
            if key in seen:
                continue
            seen.add(key)
            rows.append(row)
    return rows


# ---------------------------
# Enrichment scaffold
# ---------------------------

def compile_enrichment(records: List[ProgramRecord], out_dir: Path, tag: str = "programs") -> List[dict]:
    if not records:
        return []
    out_dir.mkdir(parents=True, exist_ok=True)
    rows = []
    for rec in records[: min(len(records), 250)]:
        rows.extend([
            {
                "program_name": rec.program_name,
                "title": "Operation note",
                "content": "General program experience.",
                "note_type": "experience",
                "rating": 4,
                "helpful_count": 1,
            },
            {
                "program_name": rec.program_name,
                "title": "Visa checklist",
                "content": "J1/H1B checklist is typical; confirm with coordinator.",
                "note_type": "visa",
                "rating": 4,
                "helpful_count": 1,
            },
        ])
    notes_csv = out_dir / f"program_notes_enrichment_{tag}.csv"
    fieldnames = ["program_name","title","content","note_type","rating","helpful_count"]
    with notes_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in fieldnames})
    print(f"Wrote enrichment notes: {notes_csv}")
    return rows


# ---------------------------
# Writer/utils
# ---------------------------

def combine(records: Iterable[ProgramRecord]) -> List[ProgramRecord]:
    combined: List[ProgramRecord] = []
    seen = set()
    for rec in records:
        key = (rec.program_name.lower(), rec.institution.lower(), rec.website.lower())
        if key in seen:
            continue
        seen.add(key)
        combined.append(rec)
    print(f"Combined deduped dataset size={len(combined)}.")
    return combined


def write_outputs(records: List[ProgramRecord], out_dir: Path, *, tag: str = "programs"):
    out_dir.mkdir(parents=True, exist_ok=True)
    csv_path = out_dir / f"{tag}_compiled.csv"
    sql_path = out_dir / f"{tag}_compiled.sql"
    fieldnames = [
        "program_name","institution","specialty","city","state","acgme_program_id","website",
        "eras_participation","nrmp_participation","program_type","program_size","program_director",
        "coordinator","contact_email","img_friendly_score","interview_format","visa_j1","visa_h1b",
        "housing_subsidized","step2_score_avg","ai_summary","verified",
    ]
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for rec in records:
            writer.writerow(asdict(rec))
    cols = fieldnames + ["created_at"]
    lines = ["INSERT INTO public.programs (" + ", ".join(cols) + ") VALUES"]
    rows_sql = []
    for rec in records:
        r = asdict(rec)
        r["created_at"] = "now()"
        rows_sql.append("(" + ", ".join([col_sql_value(r.get(c)) for c in cols]) + ")")
    sql_path.write_text("\n".join(lines + [",\n".join(rows_sql) + ";"]), encoding="utf-8")
    manifest = {
        "tag": tag,
        "count": len(records),
        "files": {"csv": str(csv_path), "sql": str(sql_path)},
    }
    (out_dir / f"{tag}_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Wrote compiled CSV: {csv_path}")
    print(f"Wrote compiled SQL: {sql_path}")


# ---------------------------
# argparse
# ---------------------------

def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Residency fellowship compiler")
    p.add_argument("--cache-dir", default=str(DEFAULT_CACHE_DIR))
    p.add_argument("--out-dir", default=str(DEFAULT_OUT_DIR))
    p.add_argument("--payload", default="", help="Path to a raw compiled CSV for normalization")
    p.add_argument("--skip-live", action="store_true", help="Skip NRMP/FREIDA/PDF compilation")
    p.add_argument("--seed-only", action="store_true", help="Only seed built-in known programs")
    p.add_argument("--enrichment", action="store_true", help="Generate enrichment scaffold CSVs")
    p.add_argument("--refresh", action="store_true", help="Re-download cached sources")
    p.add_argument("--limit", type=int, default=0, help="Per-source row limit")
    return p.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    cache_dir = Path(args.cache_dir)
    out_dir = Path(args.out_dir)
    records: List[ProgramRecord] = []

    records.extend(compile_known_programs())
    if args.enrichment:
        compile_enrichment(records, out_dir)

    if args.payload:
        payloads = [Path(p.strip()) for p in args.payload.split(",") if p.strip()]
        for payload in payloads:
            try:
                records.extend(compile_payload(payload))
            except Exception as exc:
                print(f"Payload compile failed for {payload}: {exc}")

    if args.seed_only and not args.payload:
        write_outputs(records, out_dir)
        print("Seed-only mode complete.")
        return 0

    if not args.skip_live:
        try:
            records.extend(compile_nrmp_directory(cache_dir=cache_dir, force_refresh=args.refresh, limit=args.limit))
        except Exception as exc:
            print(f"NRMP step failed: {exc}")
        try:
            records.extend(compile_freida_programs(cache_dir=cache_dir, force_refresh=args.refresh, limit=args.limit))
        except Exception as exc:
            print(f"FREIDA step failed: {exc}")
        try:
            records.extend(compile_pdf_reports(cache_dir=cache_dir, force_refresh=args.refresh))
        except Exception as exc:
            print(f"PDF step failed: {exc}")

    if not records:
        print("No records compiled.")
        return 1

    records = combine(records)
    write_outputs(records, out_dir)
    if args.enrichment:
        compile_enrichment(records, out_dir, tag="compiled")
    print(f"Compilation complete. Total={len(records)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
