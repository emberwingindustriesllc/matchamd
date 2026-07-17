import csv, sys, pathlib

REQUIRED = [
    "program_name","institution","specialty","city","state","acgme_program_id","website",
    "eras_participation","nrmp_participation","program_type","program_size",
    "program_director","coordinator","contact_email","img_friendly_score",
    "interview_format","visa_j1","visa_h1b","housing_subsidized","step2_score_avg","ai_summary"
]

BOOL_FIELDS = {"eras_participation","nrmp_participation","visa_j1","visa_h1b","housing_subsidized"}
NUMERIC_FIELDS = {"program_size","img_friendly_score","step2_score_avg"}

def parse_bool(v):
    s = str(v).strip().lower()
    if s in {"true","1","yes","y"}:
        return True
    if s in {"false","0","no","n",""}:
        return False
    return None

def normalize(row):
    out = {}
    for key in REQUIRED:
        val = row.get(key, "")
        if key in BOOL_FIELDS:
            out[key] = parse_bool(val)
        elif key in NUMERIC_FIELDS:
            try:
                out[key] = float(val) if "." in str(val) else int(val)
            except Exception:
                out[key] = None
        else:
            out[key] = (val or "").strip()
    out.setdefault("verified", True)
    out.setdefault("created_at", "now()")
    return out

def csv_to_sql(records, path, table="public.programs"):
    cols = REQUIRED + ["verified", "created_at"]
    rows = []
    def fmt(v):
        if v is None or v == "":
            return "NULL"
        if isinstance(v, bool):
            return "TRUE" if v else "FALSE"
        if isinstance(v, (int, float)):
            return str(v)
        return "'" + str(v).replace("'", "''") + "'"
    path.write_text(
        "INSERT INTO " + table + " (" + ", ".join(cols) + ") VALUES\n" +
        ",\n".join("(" + ", ".join(fmt(r.get(c)) for c in cols) + ")" for r in records) +
        ";\n",
        encoding="utf-8"
    )

def csv_to_clean_csv(records, path):
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=REQUIRED)
        w.writeheader()
        for r in records:
            w.writerow({k: r.get(k, "") for k in REQUIRED})

if __name__ == "__main__":
    src = pathlib.Path(sys.argv[1])
    out = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix("")
    mode = sys.argv[3] if len(sys.argv) > 3 else "both"
    with src.open("r", encoding="utf-8") as f:
        rows = [normalize(r) for r in csv.DictReader(f)]
    print("normalized", len(rows), "rows")
    if mode in ("sql","both"):
        csv_to_sql(rows, out.with_suffix(".seed.sql"))
    if mode in ("csv","both"):
        csv_to_clean_csv(rows, out.with_suffix(".seed.csv"))
