# CyberShield

Cybersecurity data visualization dashboard by Divy Upadhyay, built with Lovable, TanStack Start, React, TypeScript, Tailwind CSS, and Recharts.

**Dashboard:** https://cybershield.run.place

## Dashboard

Security Overview, Attack Intelligence, Traffic Forensics, and About & Methodology show metrics computed from actual fetched UNSW-NB15 records. Shared filters cover label, attack category, protocol, service, and search; filtered records and category summaries can be exported as CSV. Failed loading shows unavailable data rather than invented values.

This is a college research project, not live network monitoring, Microsoft Power BI, or a native PBIX report.

## Public dataset and download

- [Dataset hosting repository](https://huggingface.co/datasets/Mouwiya/UNSW-NB15)
- [Source CSV: UNSW_NB15_training-set.csv](https://huggingface.co/datasets/Mouwiya/UNSW-NB15/resolve/main/UNSW_NB15_training-set.csv)
- [Download full Excel: 175,341 training records](https://cybershield.run.place/__l5e/assets-v1/db04b3be-2e55-4a93-a32c-c94f1b8c7198/cybershield_UNSW_NB15_175341.xlsx)

The dashboard and Excel retain these 13 columns in order:

`id, dur, proto, service, state, spkts, dpkts, sbytes, dbytes, rate, sttl, attack_cat, label`

CSV loads directly, with `/api/public/dataset` as fallback. Excel downloading is independent of CSV loading. No CSV or Excel binaries are included in the source tree. `src/assets/*.xlsx.asset.json` files are small public Lovable Assets pointers, not credentials or embedded datasets. Another host must serve these relative asset URLs or use the absolute public Excel link above.

Citation: Moustafa, N. & Slay, J. (2015). *UNSW-NB15: a comprehensive data set for network intrusion detection systems.* MilCIS 2015. Consult original dataset terms before redistributing data; public hosting does not imply an unrestricted data license.

## Development

Install Bun, then run from the repository directory:

```sh
bun install --frozen-lockfile
bun run dev
```

```sh
bun run test
bun run build
```

Preserve `package.json`, `bun.lock`, `bunfig.toml`, and the Vite/TypeScript configuration. The supplied build targets a Cloudflare-compatible runtime through the Lovable Vite configuration.

To verify Excel locally, install Python's `openpyxl`, download both data files outside the repository, and run:

```sh
EXCEL_FILE=/absolute/path/to/download.xlsx SOURCE_CSV=/absolute/path/to/source.csv python3 src/test/excel_download_test.py
```

## Safe GitHub publication

Target: a **new public** repository `divyupadhyay17-lang/cybershield-threat-analytics`. This README does not confirm publication.

1. Merge the entries in `PUBLIC_RELEASE_IGNORE.txt` into `.gitignore` before connecting. The platform protects `.gitignore` from agent edits; this checklist is not an active ignore file. Existing rules exclude dependencies, build output, logs, and `.dev.vars`.
2. In Lovable, open **Project settings → Git → GitHub**. A workspace owner/admin must first add and authorize the account connection if absent. Select `divyupadhyay17-lang` and connect. Lovable creates a **new private repository** and syncs source; it cannot attach to an existing repository.
3. Inspect the new private repository's files and history before making it public. Ignore rules do not remove previously committed files. Current source inspection found no credential files or dataset binaries; GitHub status and repository history were not verified.
4. In the newly created GitHub repository, open **Settings → General → Repository name** and rename it to `cybershield-threat-analytics`. If that name already exists, stop without overwriting, deleting, or modifying the existing repository.
5. Open that new repository's **Settings → General → Danger Zone → Change repository visibility**, choose **Public**, and complete GitHub's confirmation.

Sync continues after a GitHub repository rename. Authorization, connection, and sync-status checks require Lovable's UI; the chat agent cannot confirm them. If working in a draft, accept it into Main before syncing the complete current changes.

Do not publish credentials, private configuration, or generated datasets. Keep source, package manifests/lockfile, config, documentation, and public asset pointers.
