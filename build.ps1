# Build script: transforms FAQ Excel JSON into the embedded DB and writes index.html.
# Re-run after the Excel file is updated.

param(
    [string]$Root = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

$ErrorActionPreference = 'Stop'
$rawPath      = Join-Path $Root 'faq_raw.json'
$templatePath = Join-Path $Root 'template.html'
$outPath      = Join-Path $Root 'index.html'

if (-not (Test-Path $rawPath)) { throw "Missing $rawPath. Run parse_xlsx.ps1 first." }
if (-not (Test-Path $templatePath)) { throw "Missing $templatePath." }

$rawRoot = Get-Content -Raw -Path $rawPath -Encoding UTF8 | ConvertFrom-Json

# PowerShell wraps array values when emitted via ConvertTo-Json with -Compress; rows are PSCustomObjects with a 'value' property.
$rows = @()
foreach ($r in $rawRoot) {
    if ($r.value) { $rows += ,$r.value }
    else { $rows += ,$r }
}

# Helpers
function To-Half {
    param([string]$s)
    if ($null -eq $s) { return '' }
    $sb = [System.Text.StringBuilder]::new()
    foreach ($ch in $s.ToCharArray()) {
        $code = [int]$ch
        if ($code -ge 0xFF01 -and $code -le 0xFF5E) {
            [void]$sb.Append([char]($code - 0xFEE0))
        } elseif ($code -eq 0x3000) {
            [void]$sb.Append(' ')
        } else {
            [void]$sb.Append($ch)
        }
    }
    return $sb.ToString()
}

function Normalize-Text {
    param([string]$s)
    if ($null -eq $s) { return '' }
    $t = $s -replace "[\r\n]+", ' '
    $t = $t -replace '\s+', ' '
    return $t.Trim()
}

function Split-Answers {
    param([string]$raw)
    if ([string]::IsNullOrWhiteSpace($raw)) { return @() }
    # Bullet chars: U+25CF U+26AB U+30FB U+FF65 U+FEFF
    $bulletClass = ([char]0x25CF).ToString() + ([char]0x26AB) + ([char]0x30FB) + ([char]0xFF65) + ([char]0xFEFF)
    $bulletRegex = '^[' + [System.Text.RegularExpressions.Regex]::Escape($bulletClass) + ']'
    $stripRegex  = '^[\s' + [System.Text.RegularExpressions.Regex]::Escape($bulletClass) + ']+'
    $lines = $raw -split "[\r\n]+"
    $items = New-Object System.Collections.Generic.List[string]
    $current = $null
    foreach ($line in $lines) {
        $trim = $line.TrimStart()
        if ([System.Text.RegularExpressions.Regex]::IsMatch($trim, $bulletRegex)) {
            if ($current) { [void]$items.Add($current) }
            $current = ([System.Text.RegularExpressions.Regex]::Replace($trim, $stripRegex, '')).TrimEnd()
        } elseif ($current) {
            $cont = $trim.TrimEnd()
            if ($cont.Length -gt 0) { $current += $cont }
        }
    }
    if ($current) { [void]$items.Add($current) }
    $cleaned = New-Object System.Collections.Generic.List[string]
    foreach ($it in $items) {
        $c = ($it -replace '\s+', ' ').Trim()
        if ($c.Length -gt 0) { [void]$cleaned.Add($c) }
    }
    return $cleaned.ToArray()
}

function Extract-Keywords {
    param([string]$question, [string]$category)
    # Keywords are derived from the question + category only.
    # Including answer text would make every FAQ that merely *mentions* a term
    # tie on +10 keyword-exact matches, hurting rank quality.
    $combined = (To-Half $question)

    # Character ranges (build via [char][int] to be PS 5.1 safe)
    $kanji = '[' + [char]0x4E00 + '-' + [char]0x9FFF + ']{2,}'
    $kata  = '[' + [char]0x30A1 + '-' + [char]0x30FA + [char]0x30FC + ']{2,}' # katakana incl. prolonged sound mark
    $ascii = '[A-Za-z]{2,}[0-9]*|[A-Za-z]+[0-9]{2,}'
    $num   = '[0-9]{3,}'

    $kw = New-Object System.Collections.Specialized.OrderedDictionary

    foreach ($pat in @($kata, $kanji, $ascii, $num)) {
        $rxMatches = [System.Text.RegularExpressions.Regex]::Matches($combined, $pat)
        foreach ($m in $rxMatches) {
            $t = $m.Value
            if ([string]::IsNullOrWhiteSpace($t)) { continue }
            $t = $t.Trim()
            if ($t.Length -lt 2) { continue }
            if (-not $kw.Contains($t)) { $kw.Add($t, $true) }
        }
    }

    if ($category -and -not [string]::IsNullOrWhiteSpace($category)) {
        $c = $category.Trim()
        if ($c.Length -ge 2 -and -not $kw.Contains($c)) { $kw.Add($c, $true) }
    }
    # Limit count to keep JSON compact
    $arr = @($kw.Keys)
    if ($arr.Count -gt 20) { $arr = $arr[0..19] }
    return $arr
}

$db = New-Object System.Collections.Generic.List[object]
foreach ($row in $rows) {
    if ($null -eq $row) { continue }
    $no = $row[0]
    $category = $row[1]
    $question = $row[2]
    $answer = $row[3]

    if ([string]::IsNullOrWhiteSpace($no)) { continue }
    if ($no -notmatch '^\d+$') { continue }
    if ([string]::IsNullOrWhiteSpace($question)) { continue }

    $answersRaw = Split-Answers -raw $answer
    $answersList = New-Object System.Collections.Generic.List[string]
    $i = 0
    foreach ($a in $answersRaw) {
        if ($i -ge 3) { break }
        [void]$answersList.Add('● ' + $a.Trim())
        $i++
    }

    $kwArr = Extract-Keywords -question $question -category $category
    $kwList = New-Object System.Collections.Generic.List[string]
    foreach ($k in $kwArr) { [void]$kwList.Add([string]$k) }

    $tagList = New-Object System.Collections.Generic.List[string]
    if (-not [string]::IsNullOrWhiteSpace($category)) { [void]$tagList.Add([string]$category.Trim()) }

    $rec = [ordered]@{
        id = [int]$no
        question = (Normalize-Text $question)
        keywords = $kwList
        tags = $tagList
        answers = $answersList
    }
    [void]$db.Add($rec)
}

# ----- Merge in additional FAQs derived from the script Excel (extra_faq.json) -----
$extraPath = Join-Path $Root 'extra_faq.json'
if (Test-Path $extraPath) {
    $extraRaw = Get-Content -Raw -Path $extraPath -Encoding UTF8 | ConvertFrom-Json
    $nextId = ($db | ForEach-Object { $_['id'] } | Measure-Object -Maximum).Maximum + 1
    foreach ($e in $extraRaw) {
        if ([string]::IsNullOrWhiteSpace($e.question)) { continue }
        $ansList = New-Object System.Collections.Generic.List[string]
        $i = 0
        foreach ($a in $e.answers) {
            if ($i -ge 3) { break }
            if ([string]::IsNullOrWhiteSpace($a)) { continue }
            $clean = ([string]$a).Trim()
            if ($clean.StartsWith([char]0x25CF)) { $clean = $clean.TrimStart([char]0x25CF).Trim() }
            [void]$ansList.Add(([char]0x25CF).ToString() + ' ' + $clean)
            $i++
        }
        $kwArr = Extract-Keywords -question $e.question -category $e.category
        $kwList = New-Object System.Collections.Generic.List[string]
        foreach ($k in $kwArr) { [void]$kwList.Add([string]$k) }
        $tagList = New-Object System.Collections.Generic.List[string]
        if (-not [string]::IsNullOrWhiteSpace($e.category)) { [void]$tagList.Add([string]$e.category.Trim()) }

        $rec = [ordered]@{
            id = [int]$nextId
            question = (Normalize-Text $e.question)
            keywords = $kwList
            tags = $tagList
            answers = $ansList
        }
        [void]$db.Add($rec)
        $nextId++
    }
    Write-Host "Merged extras from extra_faq.json (now $($db.Count) records)"
}

Write-Host "Built $($db.Count) FAQ records"

# ----- Merge English translations from faq_en.json (id-keyed) -----
$enPath = Join-Path $Root 'faq_en.json'
if (Test-Path $enPath) {
    $enRaw = Get-Content -Raw -Path $enPath -Encoding UTF8 | ConvertFrom-Json
    $enMap = @{}
    foreach ($prop in $enRaw.PSObject.Properties) {
        $enMap[[int]$prop.Name] = $prop.Value
    }
    $merged = 0
    foreach ($rec in $db) {
        $en = $enMap[[int]$rec['id']]
        if ($null -eq $en) { continue }
        if ($en.question)   { $rec['question_en'] = [string]$en.question }
        if ($en.tags) {
            $tArr = New-Object System.Collections.Generic.List[string]
            foreach ($t in $en.tags) { [void]$tArr.Add([string]$t) }
            $rec['tags_en'] = $tArr
        }
        if ($en.answers) {
            $aArr = New-Object System.Collections.Generic.List[string]
            $i = 0
            foreach ($a in $en.answers) {
                if ($i -ge 3) { break }
                $clean = ([string]$a).Trim()
                if ($clean.StartsWith([char]0x25CF)) { $clean = $clean.TrimStart([char]0x25CF).Trim() }
                if ($clean.Length -gt 0) { [void]$aArr.Add(([char]0x25CF).ToString() + ' ' + $clean) }
                $i++
            }
            $rec['answers_en'] = $aArr
        }
        $merged++
    }
    Write-Host "Merged English translations: $merged / $($db.Count)"
}

# Manual JSON encoder — avoids the PS 5.1 single-element-array unwrap and the System.Web.UI loader bug.
function Json-EscapeString {
    param([string]$s)
    if ($null -eq $s) { return '""' }
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.Append('"')
    foreach ($ch in $s.ToCharArray()) {
        $code = [int]$ch
        switch ($code) {
            8  { [void]$sb.Append('\b'); continue }
            9  { [void]$sb.Append('\t'); continue }
            10 { [void]$sb.Append('\n'); continue }
            12 { [void]$sb.Append('\f'); continue }
            13 { [void]$sb.Append('\r'); continue }
            34 { [void]$sb.Append('\"'); continue }
            92 { [void]$sb.Append('\\'); continue }
            default {
                if ($code -lt 0x20) {
                    [void]$sb.AppendFormat('\u{0:x4}', $code)
                } else {
                    [void]$sb.Append($ch)
                }
            }
        }
    }
    [void]$sb.Append('"')
    return $sb.ToString()
}

function Json-StringArray {
    param($items)
    $parts = New-Object System.Collections.Generic.List[string]
    if ($items) {
        foreach ($it in $items) { [void]$parts.Add((Json-EscapeString ([string]$it))) }
    }
    return '[' + ($parts -join ',') + ']'
}

$recordJsonList = New-Object System.Collections.Generic.List[string]
foreach ($rec in $db) {
    $parts = New-Object System.Collections.Generic.List[string]
    [void]$parts.Add('"id":' + [int]$rec['id'])
    [void]$parts.Add('"question":' + (Json-EscapeString ([string]$rec['question'])))
    [void]$parts.Add('"keywords":' + (Json-StringArray $rec['keywords']))
    [void]$parts.Add('"tags":' + (Json-StringArray $rec['tags']))
    [void]$parts.Add('"answers":' + (Json-StringArray $rec['answers']))
    if ($rec.Contains('question_en') -and $rec['question_en']) {
        [void]$parts.Add('"question_en":' + (Json-EscapeString ([string]$rec['question_en'])))
    }
    if ($rec.Contains('tags_en') -and $rec['tags_en']) {
        [void]$parts.Add('"tags_en":' + (Json-StringArray $rec['tags_en']))
    }
    if ($rec.Contains('answers_en') -and $rec['answers_en']) {
        [void]$parts.Add('"answers_en":' + (Json-StringArray $rec['answers_en']))
    }
    [void]$recordJsonList.Add('{' + ($parts -join ',') + '}')
}
$json = '[' + ($recordJsonList -join ',') + ']'
# Ensure forward slashes inside <script> are safe
$json = $json -replace '</', '<\/'

$template = Get-Content -Raw -Path $templatePath -Encoding UTF8
$out = $template.Replace('/*__FAQ_DB__*/', $json)

Set-Content -Path $outPath -Value $out -Encoding UTF8
Write-Host "Wrote $outPath ($(([System.IO.FileInfo]$outPath).Length) bytes)"
