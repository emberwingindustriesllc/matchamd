# Compiler
Generates Supabase-ready residency/fellowship datasets from public sources.

## Run
```bat
python store_assets\supabase_seeds\compiler.py
python store_assets\supabase_seeds\compiler.py --limit 50
python store_assets\supabase_seeds\compiler.py --skip-pdf
python store_assets\supabase_seeds\compiler.py --refresh
```

## Outputs
- `programs_compiled.csv`
- `programs_compiled.sql`
- `programs_manifest.json`
- `compiler_cache\`

## Notes
- NRMP/FREIDA/PF parsing depends on public page structure changing.
- If a source changes markup, compiler still runs and writes whatever it could extract.
- For 13,000+ coverage, run without `--skip-scrape` on stable network.
