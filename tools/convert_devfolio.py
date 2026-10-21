"""
Devfolio Registrations Converter for NEXWIN Builder Pass Studio.
Sourced from Phase 8 specification (docs/specs/phase-08.md).

Converts a Devfolio CSV/JSON export into data/registrations.real.json
which is ignored by Git and ready for single-file data swap.

Expected Devfolio Columns:
- Email / User Email -> email
- Name / Full Name -> name
- Team Name -> team
- Team Code / Team ID -> teamId (if absent, reports to operator)
- Track Name -> track (mapped to 0..4 index)
- Team Role / Leader -> role ("Team Leader" or "Member")
- Team Members Count -> members (1-3)
- Project Idea / Title -> idea
"""

import sys
import os
import json
import csv

TRACK_MAPPINGS = {
    "event & workshop management": 0,
    "events & workshops": 0,
    "track 01": 0,
    "learning, resources & skill development": 1,
    "learning & skills": 1,
    "track 02": 1,
    "club governance & operations": 2,
    "governance & ops": 2,
    "track 03": 2,
    "member experience & community": 3,
    "member experience": 3,
    "track 04": 3,
    "public relations & digital presence": 4,
    "pr & digital": 4,
    "track 05": 4,
}

def convert_devfolio_export(input_file: str, output_file: str = "data/registrations.real.json"):
    if not os.path.exists(input_file):
        print(f"Error: input file {input_file} not found.")
        return False

    records = []
    has_team_id_col = False

    if input_file.endswith(".csv"):
        with open(input_file, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            fieldnames = [k.strip().lower() for k in (reader.fieldnames or [])]
            print(f"Detected columns: {reader.fieldnames}")
            
            # Check for team ID
            team_id_key = None
            for key in reader.fieldnames or []:
                if "team id" in key.lower() or "team code" in key.lower():
                    team_id_key = key
                    has_team_id_col = True
                    break

            for row in reader:
                # Find matching fields
                email = (row.get("Email") or row.get("email") or "").strip().lower()
                name = (row.get("Name") or row.get("Full Name") or row.get("name") or "").strip()
                team = (row.get("Team Name") or row.get("Team") or row.get("team") or "").strip()
                team_id = (row.get(team_id_key) or "").strip() if team_id_key else ""
                
                track_raw = (row.get("Track") or row.get("Track Name") or "").strip().lower()
                track_idx = TRACK_MAPPINGS.get(track_raw, 0)

                role_raw = (row.get("Role") or row.get("Team Role") or "").strip().lower()
                role = "Team Leader" if "lead" in role_raw else "Member"

                try:
                    members = int(row.get("Members") or row.get("Team Size") or 1)
                except ValueError:
                    members = 1

                idea = (row.get("Idea") or row.get("Project Name") or row.get("Idea Title") or "").strip()

                if email and name:
                    record = {
                        "email": email,
                        "name": name,
                        "team": team,
                        "teamId": team_id,
                        "track": track_idx,
                        "role": role,
                        "members": min(3, max(1, members)),
                    }
                    if idea:
                        record["idea"] = idea[:60]
                    records.append(record)

    elif input_file.endswith(".json"):
        with open(input_file, mode="r", encoding="utf-8") as f:
            raw_data = json.load(f)
            # Process JSON list
            for item in raw_data:
                email = item.get("email", "").strip().lower()
                name = item.get("name", "").strip()
                team = item.get("team", "").strip()
                team_id = item.get("teamId", "").strip()
                track = item.get("track", 0)
                role = item.get("role", "Member")
                members = item.get("members", 1)
                idea = item.get("idea", "").strip()
                if email and name:
                    rec = {
                        "email": email,
                        "name": name,
                        "team": team,
                        "teamId": team_id,
                        "track": track,
                        "role": role,
                        "members": min(3, max(1, members)),
                    }
                    if idea:
                        rec["idea"] = idea[:60]
                    records.append(rec)

    print(f"Converted {len(records)} participants.")
    if not has_team_id_col:
        print("Note: The export has no explicit team ID column. Team IDs will be left blank unless operator specifies a format.")

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, mode="w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    print(f"Output saved to {output_file} (Git-ignored).")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        convert_devfolio_export(sys.argv[1])
    else:
        print("Usage: python tools/convert_devfolio.py <path_to_export.csv_or_json>")
