# PowerShell script to list all available fonts with full paths
# Based on forum discussion: https://forums.powershell.org/t/listing-font-details/9230/13
# Addresses the metadata extraction and comparison issues discussed in the thread

param(
    [string]$FontFolder = "C:\Windows\fonts\",
    [switch]$TTFOnly,
    [switch]$ExportToCsv,
    [string]$OutputPath = "font-list.csv",
    [switch]$ShowProgress,
    [switch]$ShowPathsByStyle,
    [switch]$CopyFonts,
    [string]$CopyDestination = ".\FontCopy",
    [string]$FamilyFilter = "",
    [string]$StyleFilter = ""
)

Write-Host "Listing fonts from: $FontFolder" -ForegroundColor Green

# Initialize COM objects as per forum example
$objShell = New-Object -ComObject Shell.Application
$fileList = @()
$attrList = @{}

# Define the font metadata attributes we want to extract
$details = @(
    "Title",
    "Font style", 
    "Show/hide",
    "Designed for",
    "Category",
    "Designer/foundry",
    "Font Embeddability", 
    "Font type",
    "Family",
    "Date created",
    "Date modified",
    "Collection",
    "Font file names",
    "Font version"
)

Write-Host "Discovering available font metadata attributes..." -ForegroundColor Yellow

# Figure out what the possible metadata is (addresses localization issues)
$objFolder = $objShell.namespace($FontFolder)
for ($attr = 0; $attr -le 500; $attr++) {
    $attrName = $objFolder.getDetailsOf($objFolder.items, $attr)
    if ($attrName -and (-not $attrList.Contains($attrName))) {
        $attrList.add($attrName, $attr)
    }
}

# For working on localized windows versions - use discovered attributes
# This addresses the localization issue mentioned in the forum
$discoveredDetails = $attrList.GetEnumerator() | Select-Object -ExpandProperty Name

Write-Host "Found $($attrList.Count) metadata attributes" -ForegroundColor Cyan

# Get all font files
$fontFiles = $objFolder.items()
$totalFiles = @($fontFiles).Count

if ($TTFOnly) {
    Write-Host "Filtering for TTF files only..." -ForegroundColor Yellow
}

Write-Host "Processing $totalFiles font files..." -ForegroundColor Green

$processedCount = 0

# Loop through all the fonts and process
foreach ($file in $fontFiles) {
    $processedCount++
    
    # Filter for TTF files if requested
    if ($TTFOnly -and $file.Path -notmatch '\.ttf$') {
        continue
    }
    
    if ($ShowProgress) {
        Write-Progress -Activity "Processing Fonts" -Status "Processing $($file.Name)" -PercentComplete (($processedCount / $totalFiles) * 100)
    }
    
    # Create a custom object with all the font details
    $fontObject = [PSCustomObject]@{
        FontName = $file.Name
        FullPath = $file.Path
        Size = $file.Size
        DateModified = $file.DateModified
    }
    
    # Add all available metadata attributes
    foreach ($attr in $discoveredDetails) {
        if ($attrList.ContainsKey($attr)) {
            $attrValue = $objFolder.getDetailsOf($file, $attrList[$attr])
            if ($attrValue) {
                # Clean the attribute name for property naming
                $cleanAttrName = $attr -replace '[^\w]', '_'
                Add-Member -InputObject $fontObject -MemberType NoteProperty -Name $cleanAttrName -Value $attrValue -Force
            }
        }
    }
    
    # Also try to get the specific details we're interested in
    foreach ($detail in $details) {
        if ($attrList.ContainsKey($detail)) {
            $attrValue = $objFolder.getDetailsOf($file, $attrList[$detail])
            if ($attrValue) {
                $cleanDetailName = $detail -replace '[^\w]', '_'
                Add-Member -InputObject $fontObject -MemberType NoteProperty -Name $cleanDetailName -Value $attrValue -Force
            }
        }
    }
    
    $fileList += $fontObject
}

if ($ShowProgress) {
    Write-Progress -Activity "Processing Fonts" -Completed
}

Write-Host "`nFound $($fileList.Count) fonts" -ForegroundColor Green

# Display results
Write-Host "`n=== FONT LIST ===" -ForegroundColor Magenta

# Show basic info for all fonts
$fileList | Select-Object FontName, FullPath, @{Name='FontStyle'; Expression={$_.'Font_style'}}, @{Name='FontFamily'; Expression={$_.'Family'}}, @{Name='FontType'; Expression={$_.'Font_type'}} | Format-Table -AutoSize

# Show font paths organized by style if requested
if ($ShowPathsByStyle) {
    Write-Host "`n=== FONT PATHS BY STYLE ===" -ForegroundColor Magenta
    
    # Get actual font files from the file system
    Write-Host "Scanning file system for individual font files..." -ForegroundColor Yellow
    $fontFileExtensions = @('*.ttf', '*.otf', '*.ttc', '*.woff', '*.woff2')
    $actualFontFiles = @()
    
    foreach ($ext in $fontFileExtensions) {
        $files = Get-ChildItem -Path $FontFolder -Filter $ext -ErrorAction SilentlyContinue
        $actualFontFiles += $files
    }
    
    Write-Host "Found $($actualFontFiles.Count) individual font files" -ForegroundColor Cyan
    
    # Create a mapping of font files to their metadata
    $fontFileMapping = @{}
    
    foreach ($actualFile in $actualFontFiles) {
        # Find corresponding metadata from our fileList
        $matchingFont = $fileList | Where-Object { 
            $_.FullPath -like "*$($actualFile.Name)*" -or 
            $_.FontName -like "*$($actualFile.BaseName)*" -or
            $actualFile.FullName -eq $_.FullPath
        }
        
        if ($matchingFont) {
            $fontFileMapping[$actualFile.FullName] = $matchingFont
        } else {
            # If no metadata found, create basic info
            $fontFileMapping[$actualFile.FullName] = [PSCustomObject]@{
                FontName = $actualFile.Name
                FullPath = $actualFile.FullName
                Family = $null
                Font_style = $null
            }
        }
    }
    
    # Group by family name extracted from file names or metadata
    $familyGroups = @{}
    
    foreach ($filePath in $fontFileMapping.Keys) {
        $fontInfo = $fontFileMapping[$filePath]
        $fileName = [System.IO.Path]::GetFileNameWithoutExtension($filePath)
        
        # Determine family name
        $familyName = if ($fontInfo.Family) { 
            $fontInfo.Family 
        } else {
            # Extract family from filename by removing common style suffixes
            $baseName = $fileName -replace '(?i)(bold|italic|light|regular|medium|thin|black|condensed|expanded|oblique|bd|bi|it|rg).*$', ''
            $baseName = $baseName -replace '\s+$', ''  # Remove trailing spaces
            if ([string]::IsNullOrEmpty($baseName)) { $fileName } else { $baseName }
        }
        
        # Determine style from filename and metadata
        $styleName = if ($fontInfo.Font_style) {
            $fontInfo.Font_style
        } else {
            # Extract style from filename
            switch -Regex ($fileName) {
                '(?i).*bold.*italic.*|.*bi\b' { 'Bold Italic' }
                '(?i).*italic.*bold.*|.*ib\b' { 'Bold Italic' }
                '(?i).*bold.*|.*bd\b' { 'Bold' }
                '(?i).*italic.*|.*it\b' { 'Italic' }
                '(?i).*light.*italic.*|.*li\b' { 'Light Italic' }
                '(?i).*light.*|.*lt\b' { 'Light' }
                '(?i).*thin.*' { 'Thin' }
                '(?i).*medium.*' { 'Medium' }
                '(?i).*black.*' { 'Black' }
                '(?i).*condensed.*' { 'Condensed' }
                '(?i).*expanded.*' { 'Expanded' }
                default { 'Regular' }
            }
        }
        
        if (-not $familyGroups.ContainsKey($familyName)) {
            $familyGroups[$familyName] = @{}
        }
        
        if (-not $familyGroups[$familyName].ContainsKey($styleName)) {
            $familyGroups[$familyName][$styleName] = @()
        }
        
        $familyGroups[$familyName][$styleName] += $filePath
    }
    
    # Display organized results
    foreach ($familyName in ($familyGroups.Keys | Sort-Object)) {
        Write-Host "`n$familyName Family:" -ForegroundColor Cyan
        
        foreach ($styleName in ($familyGroups[$familyName].Keys | Sort-Object)) {
            Write-Host "  Style: $styleName" -ForegroundColor Yellow
            
            foreach ($filePath in $familyGroups[$familyName][$styleName]) {
                Write-Host "    $filePath" -ForegroundColor White
            }
        }
    }
}

# Export to CSV if requested
if ($ExportToCsv) {
    Write-Host "`nExporting to $OutputPath..." -ForegroundColor Cyan
    $fileList | Export-Csv -Path $OutputPath -NoTypeInformation
    Write-Host "Font list exported to: $OutputPath" -ForegroundColor Green
    
    # Also create a simple path-only file
    $pathOnlyFile = $OutputPath -replace '\.csv$', '-paths-only.txt'
    $fileList | Select-Object -ExpandProperty FullPath | Out-File -FilePath $pathOnlyFile -Encoding UTF8
    Write-Host "Font paths exported to: $pathOnlyFile" -ForegroundColor Green
    
    # Create paths-by-style file if ShowPathsByStyle is enabled
    if ($ShowPathsByStyle) {
        $pathsByStyleFile = $OutputPath -replace '\.csv$', '-paths-by-style.txt'
        $styleOutput = @()
        
        # Get actual font files and organize them
        $fontFileExtensions = @('*.ttf', '*.otf', '*.ttc', '*.woff', '*.woff2')
        $actualFontFiles = @()
        
        foreach ($ext in $fontFileExtensions) {
            $files = Get-ChildItem -Path $FontFolder -Filter $ext -ErrorAction SilentlyContinue
            $actualFontFiles += $files
        }
        
        # Create a mapping and organize by family/style
        $fontFileMapping = @{}
        $familyGroups = @{}
        
        foreach ($actualFile in $actualFontFiles) {
            $fileName = [System.IO.Path]::GetFileNameWithoutExtension($actualFile.FullName)
            
            # Find corresponding metadata
            $matchingFont = $fileList | Where-Object { 
                $_.FullPath -like "*$($actualFile.Name)*" -or 
                $_.FontName -like "*$($fileName)*" -or
                $actualFile.FullName -eq $_.FullPath
            }
            
            # Determine family name
            $familyName = if ($matchingFont -and $matchingFont.Family) { 
                $matchingFont.Family 
            } else {
                $baseName = $fileName -replace '(?i)(bold|italic|light|regular|medium|thin|black|condensed|expanded|oblique|bd|bi|it|rg).*$', ''
                $baseName = $baseName -replace '\s+$', ''
                if ([string]::IsNullOrEmpty($baseName)) { $fileName } else { $baseName }
            }
            
            # Determine style
            $styleName = if ($matchingFont -and $matchingFont.Font_style) {
                $matchingFont.Font_style
            } else {
                switch -Regex ($fileName) {
                    '(?i).*bold.*italic.*|.*bi\b' { 'Bold Italic' }
                    '(?i).*italic.*bold.*|.*ib\b' { 'Bold Italic' }
                    '(?i).*bold.*|.*bd\b' { 'Bold' }
                    '(?i).*italic.*|.*it\b' { 'Italic' }
                    '(?i).*light.*italic.*|.*li\b' { 'Light Italic' }
                    '(?i).*light.*|.*lt\b' { 'Light' }
                    '(?i).*thin.*' { 'Thin' }
                    '(?i).*medium.*' { 'Medium' }
                    '(?i).*black.*' { 'Black' }
                    '(?i).*condensed.*' { 'Condensed' }
                    '(?i).*expanded.*' { 'Expanded' }
                    default { 'Regular' }
                }
            }
            
            if (-not $familyGroups.ContainsKey($familyName)) {
                $familyGroups[$familyName] = @{}
            }
            
            if (-not $familyGroups[$familyName].ContainsKey($styleName)) {
                $familyGroups[$familyName][$styleName] = @()
            }
            
            $familyGroups[$familyName][$styleName] += $actualFile.FullName
        }
        
        # Generate output
        foreach ($familyName in ($familyGroups.Keys | Sort-Object)) {
            $styleOutput += "`n$familyName Family:"
            
            foreach ($styleName in ($familyGroups[$familyName].Keys | Sort-Object)) {
                $styleOutput += "  Style: $styleName"
                
                foreach ($filePath in $familyGroups[$familyName][$styleName]) {
                    $styleOutput += "    $filePath"
                }
            }
        }
        
        $styleOutput | Out-File -FilePath $pathsByStyleFile -Encoding UTF8
        Write-Host "Font paths by style exported to: $pathsByStyleFile" -ForegroundColor Green
    }
}

# Show summary statistics
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total fonts found: $($fileList.Count)" -ForegroundColor White

# Group by font type if available
$fontTypes = $fileList | Where-Object { $_.'Font_type' } | Group-Object 'Font_type'
if ($fontTypes) {
    Write-Host "`nFonts by type:" -ForegroundColor Yellow
    $fontTypes | ForEach-Object { Write-Host "  $($_.Name): $($_.Count)" -ForegroundColor White }
}

# Group by font family if available  
$fontFamilies = $fileList | Where-Object { $_.Family } | Group-Object 'Family'
if ($fontFamilies) {
    $topFamilies = $fontFamilies | Sort-Object Count -Descending | Select-Object -First 10
    Write-Host "`nTop 10 font families:" -ForegroundColor Yellow
    $topFamilies | ForEach-Object { Write-Host "  $($_.Name): $($_.Count)" -ForegroundColor White }
}

Write-Host "`nScript complete!" -ForegroundColor Green

# Return the font list for pipeline usage
return $fileList
