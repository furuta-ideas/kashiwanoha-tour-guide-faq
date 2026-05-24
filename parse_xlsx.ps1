param(
    [Parameter(Mandatory=$true)][string]$ExtractDir,
    [Parameter(Mandatory=$true)][string]$OutJson
)

# Load shared strings
[xml]$ssXml = Get-Content -Raw -Path (Join-Path $ExtractDir 'xl\sharedStrings.xml') -Encoding UTF8
$ns = @{ x = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main' }

$sharedStrings = @()
foreach ($si in $ssXml.sst.si) {
    if ($si.t -ne $null -and $si.t -isnot [string]) {
        # rich text — concatenate runs
        $text = ''
        foreach ($child in $si.ChildNodes) {
            if ($child.LocalName -eq 't') {
                $text += $child.InnerText
            } elseif ($child.LocalName -eq 'r') {
                foreach ($rc in $child.ChildNodes) {
                    if ($rc.LocalName -eq 't') { $text += $rc.InnerText }
                }
            }
        }
        $sharedStrings += $text
    } elseif ($si.t -is [string]) {
        $sharedStrings += $si.t
    } else {
        # has child elements (r/t)
        $text = ''
        foreach ($child in $si.ChildNodes) {
            if ($child.LocalName -eq 't') {
                $text += $child.InnerText
            } elseif ($child.LocalName -eq 'r') {
                foreach ($rc in $child.ChildNodes) {
                    if ($rc.LocalName -eq 't') { $text += $rc.InnerText }
                }
            }
        }
        $sharedStrings += $text
    }
}

Write-Host "Loaded $($sharedStrings.Count) shared strings"

# Load sheet
[xml]$sheetXml = Get-Content -Raw -Path (Join-Path $ExtractDir 'xl\worksheets\sheet1.xml') -Encoding UTF8

function Get-ColIndex {
    param([string]$cellRef)
    $col = ($cellRef -replace '\d','')
    $idx = 0
    foreach ($c in $col.ToCharArray()) {
        $idx = $idx * 26 + ([int][char]$c - [int][char]'A' + 1)
    }
    return $idx - 1  # zero-based
}

$rows = @()
foreach ($row in $sheetXml.worksheet.sheetData.row) {
    $rowIdx = [int]$row.r
    $cells = @{}
    if ($row.c) {
        foreach ($c in $row.c) {
            $colIdx = Get-ColIndex $c.r
            $value = $null
            if ($c.t -eq 's') {
                $sIdx = [int]$c.v
                $value = $sharedStrings[$sIdx]
            } elseif ($c.t -eq 'inlineStr') {
                $value = $c.is.t
            } else {
                if ($c.v) { $value = $c.v }
            }
            $cells[$colIdx] = $value
        }
    }
    $rows += @{ row = $rowIdx; cells = $cells }
}

# Convert to array-of-arrays
$maxCol = 0
foreach ($r in $rows) { foreach ($k in $r.cells.Keys) { if ($k -gt $maxCol) { $maxCol = $k } } }
$maxRow = 0
foreach ($r in $rows) { if ($r.row -gt $maxRow) { $maxRow = $r.row } }

$grid = @()
for ($i = 1; $i -le $maxRow; $i++) {
    $rowArr = @()
    for ($j = 0; $j -le $maxCol; $j++) { $rowArr += $null }
    $grid += ,$rowArr
}
foreach ($r in $rows) {
    foreach ($k in $r.cells.Keys) {
        $grid[$r.row - 1][$k] = $r.cells[$k]
    }
}

$json = $grid | ConvertTo-Json -Depth 5 -Compress
Set-Content -Path $OutJson -Value $json -Encoding UTF8
Write-Host "Wrote $OutJson"
