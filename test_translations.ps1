$ErrorActionPreference = 'Stop'
$html = Get-Content (Join-Path $PSScriptRoot 'index.html') -Raw -Encoding UTF8
$match = [regex]::Match($html, 'const FAQ_DB = (\[.*?\]);', 'Singleline')
if (-not $match.Success) { throw 'Embedded FAQ database not found.' }
$db = $match.Groups[1].Value | ConvertFrom-Json
$translations = Get-Content (Join-Path $PSScriptRoot 'faq_en.json') -Raw -Encoding UTF8 | ConvertFrom-Json
foreach ($record in $db) {
    $en = $translations."$($record.id)"
    if (-not $en -or $en.source_question -cne $record.question) {
        throw "Source question mismatch: $($record.id)"
    }
    foreach ($field in @('question_en', 'answers_en', 'tags_en')) {
        $values = @($record.$field)
        if (-not $values.Count) { throw "Missing $field for $($record.id)" }
        foreach ($value in $values) {
            if ([string]::IsNullOrWhiteSpace($value)) { throw "Empty $field for $($record.id)" }
            if ($value -match '[\p{IsHiragana}\p{IsKatakana}\p{IsCJKUnifiedIdeographs}]') {
                throw "Untranslated text in $field for $($record.id)"
            }
        }
    }
    if (@($record.answers).Count -ne @($record.answers_en).Count) {
        throw "Answer count mismatch for $($record.id)"
    }
}
Write-Host "PASS: $($db.Count) records have matching sources and complete English questions, answers, and tags."
