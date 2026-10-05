"""Diagnostic probe for the MatchaMD search stack.

Calls the live search_programs() RPC with representative UI payloads and
reports which combination fails. Safe to run: anon key only, read-only RPC.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_env():
    env = {}
    path = os.path.join(ROOT, ".env.production.local")
    if not os.path.exists(path):
        raise SystemExit("missing .env.production.local")
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


ENV = load_env()
BASE = ENV["VITE_SUPABASE_URL"].rstrip("/")
KEY = ENV["VITE_SUPABASE_ANON_KEY"]
HEADERS = {
    "apikey": KEY,
    "Authorization": "Bearer " + KEY,
    "Content-Type": "application/json",
}


def call(path, body=None, method="POST", extra=None):
    url = BASE + "/rest/v1/" + path
    data = json.dumps(body).encode() if body is not None else None
    h = dict(HEADERS)
    if extra:
        h.update(extra)
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:  # noqa: BLE001
        return 0, str(e)


def rpc(**kwargs):
    params = {
        "p_program_types": None,
        "p_specialties": [],
        "p_cities": [],
        "p_states": [],
        "p_acgme_accredited": None,
        "p_ecfmg_pathway": None,
        "p_j1_visa": None,
        "p_h1b_visa": None,
        "p_eras_participating": None,
        "p_nrmp_participating": None,
        "p_verified_only": None,
        "p_search": None,
        "p_limit": 5,
        "p_offset": 0,
    }
    params.update(kwargs)
    return call("rpc/search_programs", params)


def show(label, status, body):
    ok = status == 200
    n = ""
    if ok:
        try:
            n = " rows=%d" % len(json.loads(body))
        except Exception:  # noqa: BLE001
            n = " (unparsed)"
    print(("PASS " if ok else "FAIL ") + label + " -> HTTP " + str(status) + n)
    if not ok:
        print("      " + body.replace("\n", " ")[:400])
    return ok


def main():
    print("== search_locations / search_specialties views ==")
    show("search_locations", *call("search_locations?select=city,state&limit=3", method="GET"))
    show("search_specialties", *call("search_specialties?select=specialty&limit=3", method="GET"))
    show("specialty_aliases", *call("specialty_aliases?select=alias&limit=3", method="GET"))

    print("\n== programs table ==")
    show("programs head", *call("programs?select=id,name,city,state,specialty&limit=2", method="GET"))

    print("\n== RPC variants ==")
    show("baseline residency", *rpc(p_program_types=["residency"]))
    show("specialty=Internal Medicine", *rpc(p_program_types=["residency"], p_specialties=["Internal Medicine"]))
    show("specialty=Pediatrics", *rpc(p_program_types=["residency"], p_specialties=["Pediatrics"]))
    show("p_search=internal medicine", *rpc(p_program_types=["residency"], p_search="internal medicine"))
    show("p_cities=[Pittsburgh]", *rpc(p_program_types=["residency"], p_cities=["Pittsburgh"]))
    show("p_states=[WV,PA]", *rpc(p_program_types=["residency"], p_states=["WV", "PA"]))
    show("p_search + specialty", *rpc(p_program_types=["residency"], p_specialties=["Internal Medicine"], p_search="west"))
    show("with p_locations", *rpc(p_program_types=["residency"], p_locations=["Pittsburgh, PA"]))
    show("limit 200", *rpc(p_program_types=["residency", "fellowship", "observership", "research", "elective"], p_limit=200))


if __name__ == "__main__":
    sys.exit(main())