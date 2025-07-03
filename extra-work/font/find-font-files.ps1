# PowerShell script to list all available fonts and output as CSV
# Usage examples:
#   .\find-font-files.ps1
#   .\find-font-files.ps1 -IncludeUserFonts
#   .\find-font-files.ps1 -IncludeSystemFonts

param(
    [string[]]$FontFolders = @(),
    [string[]]$FileExtensions = @('*.ttf', '*.otf', '*.ttc', '*.woff', '*.woff2', '*.fon', '*.fnt'),
    [switch]$IncludeSystemFonts,
    [switch]$IncludeUserFonts
)

# Build font folders list if not specified
if ($FontFolders.Count -eq 0) {
    $defaultFolders = @()
    if ($IncludeSystemFonts -or (-not $IncludeSystemFonts -and -not $IncludeUserFonts)) {
        $systemFontFolder = "C:\Windows\Fonts"
        if (Test-Path $systemFontFolder) { $defaultFolders += $systemFontFolder }
    }
    if ($IncludeUserFonts -or (-not $IncludeSystemFonts -and -not $IncludeUserFonts)) {
        $userLocalFonts = "$env:LOCALAPPDATA\Microsoft\Windows\Fonts"
        if (Test-Path $userLocalFonts) { $defaultFolders += $userLocalFonts }
        $userRoamingFonts = "$env:APPDATA\Microsoft\Windows\Fonts"
        if (Test-Path $userRoamingFonts) { $defaultFolders += $userRoamingFonts }
        $adobeFonts = "$env:LOCALAPPDATA\Adobe\CoreSync\plugins\livetype\r"
        if (Test-Path $adobeFonts) { $defaultFolders += $adobeFonts }
        $officeFonts = "$env:PROGRAMFILES\Microsoft Office\root\VFS\Fonts\private"
        if (Test-Path $officeFonts) { $defaultFolders += $officeFonts }
        $commonLocations = @(
            "$env:PROGRAMFILES\Common Files\Microsoft Shared\Fonts",
            "$env:PROGRAMFILES(X86)\Common Files\Microsoft Shared\Fonts",
            "$env:USERPROFILE\AppData\Local\Microsoft\Windows\Fonts",
            "$env:USERPROFILE\Documents\My Fonts"
        )
        foreach ($location in $commonLocations) {
            if (Test-Path $location) { $defaultFolders += $location }
        }
    }
    $FontFolders = $defaultFolders
}

# Helper functions
function Get-FamilyFromFilename {
    param([string]$FileName)
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
    $lowerName = $baseName.ToLower()
    
    # Convert hyphens and underscores to spaces for better matching
    $normalizedName = $baseName -replace '[-_]', ' '
    # Remove version numbers in brackets and dates
    $familyName = $normalizedName -replace '\s*\[Version\s+[\d\.]+\]\s*\d*', ''
    
    # For short names like "arialbd", "timesi", extract family differently
    if ($baseName.Length -le 10) {
        if ($lowerName.EndsWith("bd")) {
            $familyName = $baseName.Substring(0, $baseName.Length - 2)
        }
        elseif ($lowerName.EndsWith("bi")) {
            $familyName = $baseName.Substring(0, $baseName.Length - 2)
        }
        elseif ($lowerName.EndsWith("i") -and $lowerName -ne "i") {
            $familyName = $baseName.Substring(0, $baseName.Length - 1)
        }
        else {
            $familyName = $familyName
        }
    }
    else {
        # Remove common style suffixes for longer names
        $familyName = $familyName -replace '(?i)\s+(bold|italic|light|regular|medium|thin|black|condensed|expanded|oblique)(\s|$)', ''
    }
    
    $familyName = $familyName -replace '\s+$', ''  # Remove trailing spaces
    $familyName = $familyName -replace '\s+', ' '  # Normalize multiple spaces to single space
    if ([string]::IsNullOrEmpty($familyName)) { return $normalizedName } else { return $familyName }
}
function Get-FaceFromFilename {
    param([string]$FileName)
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
    $lowerName = $baseName.ToLower()
    
    # Handle short font names like arialbd, timesi, etc.
    if ($baseName.Length -le 10) {
        if ($lowerName.EndsWith("bd")) { return 'Bold' }
        elseif ($lowerName.EndsWith("bi")) { return 'Bold Italic' }
        elseif ($lowerName.EndsWith("i") -and $lowerName -ne "i") { return 'Italic' }
        else { return 'Regular' }
    }
    
    # Use if-elseif structure for longer names
    if ($baseName -match '(?i).*bold.*italic.*|.*bi\b') { return 'Bold Italic' }
    elseif ($baseName -match '(?i).*italic.*bold.*|.*ib\b') { return 'Bold Italic' }
    elseif ($baseName -match '(?i).*bold.*|.*bd\b') { return 'Bold' }
    elseif ($baseName -match '(?i).*italic.*|.*it\b') { return 'Italic' }
    elseif ($baseName -match '(?i).*light.*italic.*|.*li\b') { return 'Light Italic' }
    elseif ($baseName -match '(?i).*light.*' -and $baseName -notmatch '(?i).*(freehand|highlight).*') { return 'Light' }
    elseif ($baseName -match '(?i).*thin.*') { return 'Thin' }
    elseif ($baseName -match '(?i).*medium.*') { return 'Medium' }
    elseif ($baseName -match '(?i).*black.*') { return 'Black' }
    elseif ($baseName -match '(?i).*condensed.*') { return 'Condensed' }
    elseif ($baseName -match '(?i).*expanded.*') { return 'Expanded' }
    else { return 'Regular' }
}

# Scan for all font files
$results = @()
$seenFiles = @{}  # Track files we've already added to prevent duplicates

foreach ($fontFolder in $FontFolders) {
    foreach ($ext in $FileExtensions) {
        $files = Get-ChildItem -Path $fontFolder -Filter $ext -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            # Skip if we've already processed this exact file path
            if ($seenFiles.ContainsKey($file.FullName)) {
                continue
            }
            $seenFiles[$file.FullName] = $true
            
            $family = Get-FamilyFromFilename -FileName $file.Name
            $face = Get-FaceFromFilename -FileName $file.Name
            
            # Create object compatible with older PowerShell versions
            $fontObject = New-Object PSObject
            $fontObject | Add-Member -MemberType NoteProperty -Name "FullPath" -Value $file.FullName
            $fontObject | Add-Member -MemberType NoteProperty -Name "Family" -Value $family
            $fontObject | Add-Member -MemberType NoteProperty -Name "Face" -Value $face
            
            $results += $fontObject
        }
    }
}

# Output CSV header
Write-Output "FullPath,Family,Face"

# Output each font as CSV
foreach ($font in $results) {
    # Escape commas and quotes in CSV values
    $fullPath = $font.FullPath -replace '"', '""'
    $family = $font.Family -replace '"', '""'
    $face = $font.Face -replace '"', '""'
    
    # Quote values that contain commas (compatible with older PowerShell versions)
    if ($fullPath -match ',') { $fullPath = '"' + $fullPath + '"' }
    if ($family -match ',') { $family = '"' + $family + '"' }
    if ($face -match ',') { $face = '"' + $face + '"' }
    
    Write-Output "$fullPath,$family,$face"
}
