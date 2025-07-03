# PowerShell script to copy all font faces for font families starting with a specified name
# Builds upon the font discovery logic to provide flexible font family copying
# Supports multiple font source folders including system and user AppData locations
# Copies all available font faces for families that start with the specified name

param(
    [string[]]$FontFolders = @(),
    [string]$DestinationFolder = ".\FontCopy",
    [string]$FamilyNameStartsWith = "",
    [string]$FamilyNameExact = "",
    [string]$FaceNameExact = "",
    [switch]$CreateFamilyFolders,
    [switch]$CreateFaceSubfolders,
    [switch]$ShowProgress,
    [switch]$DryRun,
    [switch]$Verbose,
    [string]$LogFile = "",
    [switch]$OverwriteExisting,
    [string[]]$FileExtensions = @('*.ttf', '*.otf', '*.ttc', '*.woff', '*.woff2', '*.fon', '*.fnt'),
    [switch]$IncludeSystemFonts,
    [switch]$IncludeUserFonts
)

# Validation
if ([string]::IsNullOrEmpty($FamilyNameStartsWith) -and [string]::IsNullOrEmpty($FamilyNameExact)) {
    Write-Host "Error: You must specify either -FamilyNameStartsWith or -FamilyNameExact" -ForegroundColor Red
    Write-Host ""    
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\copy-fonts-by-family-style.ps1 -FamilyNameStartsWith 'Arial'" -ForegroundColor Cyan
    Write-Host "  .\copy-fonts-by-family-style.ps1 -FamilyNameExact 'Arial' -FaceNameExact 'Bold'" -ForegroundColor Cyan
    Write-Host ""    
    Write-Host "Note: Use -FamilyNameStartsWith for prefix copy, or -FamilyNameExact with -FaceNameExact for a single font" -ForegroundColor Yellow
    exit 1
}

# Build font folders list if not specified
if ($FontFolders.Count -eq 0) {
    Write-Host "No font folders specified, building default list..." -ForegroundColor Yellow
    
    $defaultFolders = @()
    
    # Always include system fonts if IncludeSystemFonts is specified or no specific include flags are set
    if ($IncludeSystemFonts -or (-not $IncludeSystemFonts -and -not $IncludeUserFonts)) {
        $systemFontFolder = "C:\Windows\Fonts"
        if (Test-Path $systemFontFolder) {
            $defaultFolders += $systemFontFolder
        }
    }
    
    # Include user fonts if IncludeUserFonts is specified or no specific include flags are set
    if ($IncludeUserFonts -or (-not $IncludeSystemFonts -and -not $IncludeUserFonts)) {
        # Current user's local fonts
        $userLocalFonts = "$env:LOCALAPPDATA\Microsoft\Windows\Fonts"
        if (Test-Path $userLocalFonts) {
            $defaultFolders += $userLocalFonts
        }
        
        # Current user's roaming fonts
        $userRoamingFonts = "$env:APPDATA\Microsoft\Windows\Fonts"
        if (Test-Path $userRoamingFonts) {
            $defaultFolders += $userRoamingFonts
        }
        
        # Adobe fonts if available
        $adobeFonts = "$env:LOCALAPPDATA\Adobe\CoreSync\plugins\livetype\r"
        if (Test-Path $adobeFonts) {
            $defaultFolders += $adobeFonts
        }
        
        # Office fonts
        $officeFonts = "$env:PROGRAMFILES\Microsoft Office\root\VFS\Fonts\private"
        if (Test-Path $officeFonts) {
            $defaultFolders += $officeFonts
        }
        
        # Common third-party font locations
        $commonLocations = @(
            "$env:PROGRAMFILES\Common Files\Microsoft Shared\Fonts",
            "$env:PROGRAMFILES(X86)\Common Files\Microsoft Shared\Fonts",
            "$env:USERPROFILE\AppData\Local\Microsoft\Windows\Fonts",
            "$env:USERPROFILE\Documents\My Fonts"
        )
        
        foreach ($location in $commonLocations) {
            if (Test-Path $location) {
                $defaultFolders += $location
            }
        }
    }
    
    $FontFolders = $defaultFolders
    
    if ($FontFolders.Count -eq 0) {
        Write-Host "Error: No valid font folders found" -ForegroundColor Red
        exit 1
    }
}

# Initialize logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "WARN" { Write-Host $logMessage -ForegroundColor Yellow }
        "INFO" { Write-Host $logMessage -ForegroundColor Green }
        "DEBUG" { if ($Verbose) { Write-Host $logMessage -ForegroundColor Cyan } }
    }
    
    if ($LogFile) {
        Add-Content -Path $LogFile -Value $logMessage
    }
}

Write-Log "Starting font copy operation - searching for families starting with pattern"
Write-Log "Source folders: $($FontFolders -join ', ')"
Write-Log "Destination folder: $DestinationFolder"

Write-Log "Target family pattern (starts with): $FamilyNameStartsWith"
Write-Log "Will copy all available font faces for families matching this pattern"

if ($DryRun) {
    Write-Log "DRY RUN MODE - No files will be copied" "WARN"
}

# Initialize COM objects for font metadata
$objShell = $null
$attrList = @{}
$metadataFonts = @()

try {
    $objShell = New-Object -ComObject Shell.Application
    Write-Log "COM Shell object initialized successfully" "DEBUG"
} catch {
    Write-Log "Failed to initialize COM Shell object: $($_.Exception.Message)" "WARN"
    Write-Log "Will continue with filename-based detection only" "WARN"
}

# Process each font folder
foreach ($fontFolder in $FontFolders) {
    Write-Log "Processing font folder: $fontFolder" "INFO"
    
    if (-not (Test-Path $fontFolder)) {
        Write-Log "Font folder does not exist: $fontFolder" "WARN"
        continue
    }
    
    # Try to get metadata if COM objects are available
    if ($objShell) {
        try {
            $objFolder = $objShell.namespace($fontFolder)
            
            if ($objFolder) {
                # Discover metadata attributes for this folder (they might differ)
                if ($attrList.Count -eq 0) {
                    Write-Log "Discovering font metadata attributes..." "DEBUG"
                    for ($attr = 0; $attr -le 500; $attr++) {
                        $attrName = $objFolder.getDetailsOf($objFolder.items, $attr)
                        if ($attrName -and (-not $attrList.Contains($attrName))) {
                            $attrList.add($attrName, $attr)
                        }
                    }
                    Write-Log "Found $($attrList.Count) metadata attributes" "DEBUG"
                }
                
                # Get font files with metadata from this folder
                Write-Log "Reading font metadata from: $fontFolder" "DEBUG"
                $fontFiles = $objFolder.items()
                
                foreach ($file in $fontFiles) {
                    $fontObject = [PSCustomObject]@{
                        FontName = $file.Name
                        FullPath = $file.Path
                        Family = $null
                        Face = $null
                        SourceFolder = $fontFolder
                    }
                    
                    # Extract family and face from metadata
                    if ($attrList.ContainsKey("Family")) {
                        $fontObject.Family = $objFolder.getDetailsOf($file, $attrList["Family"])
                    }
                    if ($attrList.ContainsKey("Font style")) {
                        $fontObject.Face = $objFolder.getDetailsOf($file, $attrList["Font style"])
                    }
                    
                    $metadataFonts += $fontObject
                }
                
                Write-Log "Found $($fontFiles.Count) fonts with metadata in: $fontFolder" "DEBUG"
            } else {
                Write-Log "Could not access folder via COM: $fontFolder" "WARN"
            }
        } catch {
            Write-Log "Error accessing metadata for folder $fontFolder`: $($_.Exception.Message)" "WARN"
        }
    }
}

# Get actual font files from file system
Write-Log "Scanning file system for font files in all specified folders..."
$actualFontFiles = @()

foreach ($fontFolder in $FontFolders) {
    if (-not (Test-Path $fontFolder)) {
        Write-Log "Skipping non-existent folder: $fontFolder" "WARN"
        continue
    }
    
    Write-Log "Scanning folder: $fontFolder" "DEBUG"
    
    foreach ($ext in $FileExtensions) {
        try {
            $files = Get-ChildItem -Path $fontFolder -Filter $ext -ErrorAction SilentlyContinue
            foreach ($file in $files) {
                # Add source folder information to each file
                Add-Member -InputObject $file -MemberType NoteProperty -Name "SourceFolder" -Value $fontFolder -Force
                $actualFontFiles += $file
            }
            Write-Log "Found $($files.Count) files with extension $ext in $fontFolder" "DEBUG"
        } catch {
            Write-Log "Error scanning for $ext files in $fontFolder`: $($_.Exception.Message)" "WARN"
        }
    }
}

Write-Log "Found $($actualFontFiles.Count) total font files in file system"

# Function to extract family name from filename
function Get-FamilyFromFilename {
    param([string]$FileName)
    
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
    # Remove common style suffixes to get family name
    $familyName = $baseName -replace '(?i)(bold|italic|light|regular|medium|thin|black|condensed|expanded|oblique|bd|bi|it|rg).*$', ''
    $familyName = $familyName -replace '\s+$', ''  # Remove trailing spaces
    
    if ([string]::IsNullOrEmpty($familyName)) { 
        return $baseName 
    } else { 
        return $familyName 
    }
}

# Function to extract style from filename
function Get-FaceFromFilename {
    param([string]$FileName)
    
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
    
    switch -Regex ($baseName) {
        '(?i).*bold.*italic.*|.*bi\b' { return 'Bold Italic' }
        '(?i).*italic.*bold.*|.*ib\b' { return 'Bold Italic' }
        '(?i).*bold.*|.*bd\b' { return 'Bold' }
        '(?i).*italic.*|.*it\b' { return 'Italic' }
        '(?i).*light.*italic.*|.*li\b' { return 'Light Italic' }
        '(?i).*light.*|.*lt\b' { return 'Light' }
        '(?i).*thin.*' { return 'Thin' }
        '(?i).*medium.*' { return 'Medium' }
        '(?i).*black.*' { return 'Black' }
        '(?i).*condensed.*' { return 'Condensed' }
        '(?i).*expanded.*' { return 'Expanded' }
        default { return 'Regular' }
    }
}

# Create enhanced font file list with family and face information
Write-Log "Building enhanced font file list with family and face information..."
$enhancedFontList = @()

foreach ($actualFile in $actualFontFiles) {
    # Find corresponding metadata
    $matchingMetadata = $metadataFonts | Where-Object { 
        $_.FullPath -like "*$($actualFile.Name)*" -or 
        $_.FontName -like "*$($actualFile.BaseName)*" -or
        $actualFile.FullName -eq $_.FullPath
    } | Select-Object -First 1
    
    # Determine family and face
    $family = if ($matchingMetadata -and $matchingMetadata.Family) {
        $matchingMetadata.Family
    } else {
        Get-FamilyFromFilename -FileName $actualFile.Name
    }
    
    $face = if ($matchingMetadata -and $matchingMetadata.Face) {
        $matchingMetadata.Face
    } else {
        Get-FaceFromFilename -FileName $actualFile.Name
    }
    
    $enhancedFont = [PSCustomObject]@{
        FileName = $actualFile.Name
        FullPath = $actualFile.FullName
        Family = $family
        Face = $face
        Size = $actualFile.Length
        SourceFolder = if ($actualFile.SourceFolder) { $actualFile.SourceFolder } else { Split-Path $actualFile.FullName -Parent }
    }
    
    $enhancedFontList += $enhancedFont
    
    Write-Log "Processed: $($actualFile.Name) -> Family: $family, Face: $face" "DEBUG"
}

Write-Log "Enhanced font list created with $($enhancedFontList.Count) entries"

# Determine fonts to process based on parameters
if ([string]::IsNullOrEmpty($FamilyNameExact)) {
    # Prefix-based matching
    Write-Log "Searching for font families starting with: '$FamilyNameStartsWith'"
    $familyMatches = @()
    $matchingFamilies = @{}
    foreach ($font in $enhancedFontList) {
        if ($font.Family.StartsWith($FamilyNameStartsWith, [System.StringComparison]::OrdinalIgnoreCase)) {
            $familyMatches += $font
            if (-not $matchingFamilies.ContainsKey($font.Family)) { $matchingFamilies[$font.Family] = 0 }
            $matchingFamilies[$font.Family]++
            Write-Log "Found family match: $($font.FileName) (Family: $($font.Family), Face: $($font.Face))" "DEBUG"
        }
    }
    Write-Log "Found $($familyMatches.Count) fonts across $($matchingFamilies.Count) families starting with '$FamilyNameStartsWith'"
    if ($familyMatches.Count -eq 0) {
        Write-Log "No fonts found for families starting with '$FamilyNameStartsWith'" "WARN"
        Write-Log "Available font families:" "INFO"
        ($enhancedFontList | Select-Object -ExpandProperty Family -Unique | Sort-Object) | ForEach-Object { Write-Log "  - '$_'" "INFO" }
        exit 0
    }
    $fontsToProcess = $familyMatches
} else {
    # Exact family and face matching
    Write-Log "Filtering for exact family: '$FamilyNameExact' and face: '$FaceNameExact'"
    $fontsToProcess = $enhancedFontList | Where-Object { $_.Family -ieq $FamilyNameExact -and $_.Face -ieq $FaceNameExact }
    $matchingFamilies = @{}
    foreach ($f in $fontsToProcess) {
        if (-not $matchingFamilies.ContainsKey($f.Family)) { $matchingFamilies[$f.Family] = 0 }
        $matchingFamilies[$f.Family]++
    }
    Write-Log "Found $($fontsToProcess.Count) font(s) for '$FamilyNameExact' face '$FaceNameExact'"
    if ($fontsToProcess.Count -eq 0) {
        Write-Log "No fonts found matching exact criteria" "WARN"
        exit 0
    }
}

# Show matching families and their font counts
Write-Log "Matching font families:" "INFO"
$matchingFamilies.GetEnumerator() | Sort-Object Name | ForEach-Object {
    Write-Log "  Family: '$($_.Name)' ($($_.Value) font$(if($_.Value -ne 1){'s'}))" "INFO"
}

# Group by family and face to show what will be copied
$familyGroups = $familyMatches | Group-Object Family
Write-Log "Font breakdown by family and face:" "INFO"
$familyGroups | ForEach-Object {
    Write-Log "  Family: '$($_.Name)'" "INFO"
    $faceGroups = $_.Group | Group-Object Face
    $faceGroups | ForEach-Object {
        Write-Log "    Face: '$($_.Name)' ($($_.Count) file$(if($_.Count -ne 1){'s'}))" "INFO"
    }
}

$fontsToProcess = $familyMatches

# Display fonts to be copied
Write-Host "`n=== FONTS TO BE COPIED ===" -ForegroundColor Magenta
Write-Host "Pattern: Families starting with '$FamilyNameStartsWith'" -ForegroundColor Cyan
Write-Host "Matching families: $($matchingFamilies.Count)" -ForegroundColor White
Write-Host "Total fonts: $($fontsToProcess.Count)" -ForegroundColor White

$fontsToProcess | Group-Object Family | ForEach-Object {
    Write-Host "`nFamily: $($_.Name)" -ForegroundColor Cyan
    $_.Group | Group-Object Face | ForEach-Object {
        Write-Host "  Face: $($_.Name)" -ForegroundColor Yellow
        $_.Group | ForEach-Object {
            $sizeKB = [math]::Round($_.Size / 1KB, 2)
            $sourceFolder = Split-Path $_.SourceFolder -Leaf
            Write-Host "    $($_.FileName) ($sizeKB KB) [$sourceFolder]" -ForegroundColor White
        }
    }
}

# Create destination folder structure
if (-not $DryRun) {
    try {
        if (-not (Test-Path $DestinationFolder)) {
            New-Item -ItemType Directory -Path $DestinationFolder -Force | Out-Null
            Write-Log "Created destination folder: $DestinationFolder"
        }
    } catch {
        Write-Log "Failed to create destination folder: $($_.Exception.Message)" "ERROR"
        exit 1
    }
}

# Copy fonts
Write-Log "`nStarting copy operation for $($fontsToProcess.Count) fonts..."
$copiedCount = 0
$skippedCount = 0
$errorCount = 0
$totalCount = $fontsToProcess.Count

foreach ($font in $fontsToProcess) {
    $currentIndex = $copiedCount + $skippedCount + $errorCount + 1
    
    if ($ShowProgress) {
        Write-Progress -Activity "Copying Fonts" -Status "Processing $($font.FileName)" -PercentComplete (($currentIndex / $totalCount) * 100)
    }
    
    # Determine destination path
    $destPath = $DestinationFolder
    
    if ($CreateFamilyFolders) {
        $safeFamilyName = $font.Family -replace '[<>:"/\\|?*]', '_'
        $destPath = Join-Path $destPath $safeFamilyName
        
        if ($CreateFaceSubfolders) {
            $safeFaceName = $font.Face -replace '[<>:"/\\|?*]', '_'
            $destPath = Join-Path $destPath $safeFaceName
        }
    }
    
    $finalDestPath = Join-Path $destPath $font.FileName
    
    # Create destination directory if needed
    if (-not $DryRun) {
        try {
            $destDir = Split-Path $finalDestPath -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
                Write-Log "Created directory: $destDir" "DEBUG"
            }
        } catch {
            Write-Log "Failed to create directory $destDir`: $($_.Exception.Message)" "ERROR"
            $errorCount++
            continue
        }
    }
    
    # Check if file already exists
    if ((Test-Path $finalDestPath) -and (-not $OverwriteExisting)) {
        Write-Log "Skipping $($font.FileName) - file already exists at destination" "WARN"
        $skippedCount++
        continue
    }
    
    # Copy the file
    if ($DryRun) {
        Write-Log "DRY RUN: Would copy $($font.FullPath) -> $finalDestPath" "INFO"
        $copiedCount++
    } else {
        try {
            Copy-Item -Path $font.FullPath -Destination $finalDestPath -Force
            Write-Log "Copied: $($font.FileName) -> $finalDestPath" "INFO"
            $copiedCount++
        } catch {
            Write-Log "Failed to copy $($font.FileName): $($_.Exception.Message)" "ERROR"
            $errorCount++
        }
    }
}

if ($ShowProgress) {
    Write-Progress -Activity "Copying Fonts" -Completed
}

# Summary
Write-Host "`n=== COPY OPERATION SUMMARY ===" -ForegroundColor Magenta
Write-Log "Source folders processed: $($FontFolders.Count)"
$FontFolders | ForEach-Object { Write-Log "  - $_" "INFO" }
Write-Log "Font family pattern searched: starts with '$FamilyNameStartsWith'"
Write-Log "Matching families found: $($matchingFamilies.Count)"
Write-Log "Total fonts processed: $totalCount"
Write-Log "Successfully copied: $copiedCount"
if ($skippedCount -gt 0) {
    Write-Log "Skipped (already exist): $skippedCount" "WARN"
}
if ($errorCount -gt 0) {
    Write-Log "Errors encountered: $errorCount" "ERROR"
}

if ($DryRun) {
    Write-Log "This was a dry run - no files were actually copied" "WARN"
    Write-Log "Remove the -DryRun parameter to perform the actual copy operation" "INFO"
}

Write-Log "Copy operation completed!"

# Return summary object for pipeline usage
return [PSCustomObject]@{
    SearchPattern = $FamilyNameStartsWith
    MatchingFamilies = ($matchingFamilies.Keys | Sort-Object)
    FamiliesFound = $matchingFamilies.Count
    FontsFound = $familyMatches.Count
    FontsCopied = $copiedCount
    FontsSkipped = $skippedCount
    Errors = $errorCount
    SourceFolders = $FontFolders
    DestinationFolder = $DestinationFolder
    FacesFound = ($familyMatches | Select-Object -ExpandProperty Face -Unique | Sort-Object)
    WasDryRun = $DryRun
}
