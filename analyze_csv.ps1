$csvPath = "c:\react-project\foody\my\cuisines.csv"
$outputPath = "c:\react-project\foody\my\analysis_results.txt"
$data = Import-Csv -Path $csvPath

$report = New-Object System.Collections.Generic.List[string]
$report.Add("CSV Analysis Report for cuisines.csv")
$report.Add("======================================")
$report.Add("Total Records (Rows): $($data.Count)")

# Check for missing values
$columns = "name", "image_url", "description", "cuisine", "course", "diet", "prep_time", "ingredients", "instructions"
$report.Add("`nMissing or Empty values per column:")
foreach ($col in $columns) {
    $missing = ($data | Where-Object { [string]::IsNullOrWhiteSpace($_.$col) }).Count
    $report.Add("$($col): $($missing)")
}

# Check for duplicates
$duplicateGroups = $data | Group-Object name | Where-Object { $_.Count -gt 1 }
$report.Add("`nDuplicate recipe names (count of distinct names that repeat): $($duplicateGroups.Count)")
if ($duplicateGroups.Count -gt 0) {
    $report.Add("Sample duplicates: " + ($duplicateGroups | Select-Object -First 5 | ForEach-Object { $_.Name }) -join ", ")
}

# Check for short ingredients/instructions
$shortIngredientsCount = ($data | Where-Object { [string]::IsNullOrEmpty($_.ingredients) -or $_.ingredients.Length -lt 100 }).Count
$shortInstructionsCount = ($data | Where-Object { [string]::IsNullOrEmpty($_.instructions) -or $_.instructions.Length -lt 100 }).Count

$report.Add("`nRecipes with short ingredients (<100 chars): $($shortIngredientsCount)")
$report.Add("Recipes with short instructions (<100 chars): $($shortInstructionsCount)")

# Improper check
$improper = $data | Where-Object { 
    [string]::IsNullOrWhiteSpace($_.name) -or 
    [string]::IsNullOrWhiteSpace($_.ingredients) -or 
    [string]::IsNullOrWhiteSpace($_.instructions) -or 
    $_.ingredients.Length -lt 100 -or 
    $_.instructions.Length -lt 100
}

$report.Add("`nTotal 'Improper' recipes: $($improper.Count)")
if ($improper.Count -gt 0) {
    $report.Add("Examples of Improper Recipes (Name | Cuisine):")
    foreach ($item in ($improper | Select-Object -First 10)) {
        $report.Add("- $($item.name) | $($item.cuisine)")
    }
}

# Cuisine Stats
$report.Add("`nTop 10 Cuisines:")
$cuisines = $data | Group-Object cuisine | Sort-Object Count -Descending | Select-Object -First 10
foreach ($c in $cuisines) {
    $report.Add("$($c.Name): $($c.Count)")
}

$report | Out-File -FilePath $outputPath -Encoding utf8
Write-Host "Analysis complete. Results written to $outputPath"
