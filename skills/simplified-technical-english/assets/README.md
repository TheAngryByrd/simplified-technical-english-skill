# ASD-STE100 source PDF

This repository does not include the ASD-STE100 Issue 9 PDF.

1. Request a free official copy from the [Issue 9 request page](https://www.asd-ste100.org/STE_downloads.html#article02-2l).
2. Save your authorized copy in this folder as `ASD-STE100-ISSUE-9.pdf`.
3. Set `ASD_STE100_PDF` to the saved PDF path.

Run this command from the skill folder in a POSIX shell:

```sh
export ASD_STE100_PDF="$(pwd)/assets/ASD-STE100-ISSUE-9.pdf"
```

Run this command from the skill folder in Windows PowerShell:

```powershell
$env:ASD_STE100_PDF = (Resolve-Path .\assets\ASD-STE100-ISSUE-9.pdf).Path
```

Do not commit or redistribute the PDF unless you have permission from ASD.
