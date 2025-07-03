# PowerShell script to find the real file location(s) of a font by family name and/or style
# Usage examples:
#   .\find-font-file-by-family-style.ps1 -FamilyName 'Arial'
#   .\find-font-file-by-family-style.ps1 -FamilyName 'Arial' -FaceName 'Bold'

param(
    [string]$FamilyName = "",
    [string]$FaceName = "",
    [string[]]$FontFolders = @(),
    [string[]]$FileExtensions = @('*.ttf', '*.otf', '*.ttc', '*.woff', '*.woff2', '*.fon', '*.fnt'),
    [switch]$IncludeSystemFonts,
    [switch]$IncludeUserFonts
)

if ([string]::IsNullOrEmpty($FamilyName)) {
    Write-Host "Error: You must specify a font family name (-FamilyName)" -ForegroundColor Red
    exit 1
}

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

# Helper functions (from copy-fonts-by-family-style.ps1)
function Get-FamilyFromFilename {
    param([string]$FileName)
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
    # Convert hyphens and underscores to spaces for better matching
    $normalizedName = $baseName -replace '[-_]', ' '
    # Remove version numbers in brackets and dates
    $familyName = $normalizedName -replace '\s*\[Version\s+[\d\.]+\]\s*\d*', ''
    # Remove common style suffixes to get family name
    $familyName = $familyName -replace '(?i)(bold|italic|light|regular|medium|thin|black|condensed|expanded|oblique|bd|bi|it|rg).*$', ''
    $familyName = $familyName -replace '\s+$', ''  # Remove trailing spaces
    $familyName = $familyName -replace '\s+', ' '  # Normalize multiple spaces to single space
    if ([string]::IsNullOrEmpty($familyName)) { return $normalizedName } else { return $familyName }
}
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

# Scan for font files and try to match family/style
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
            $matchFamily = $family -ieq $FamilyName
            $matchFace = ([string]::IsNullOrEmpty($FaceName)) -or ($face -ieq $FaceName)
            if ($matchFamily -and $matchFace) {
                $results += [PSCustomObject]@{
                    FullPath = $file.FullName
                    Family = $family
                    Face = $face
                }
            }
        }
    }
}

if ($results.Count -eq 0) {
    $message = "No font files found for family '$FamilyName'"
    if (![string]::IsNullOrEmpty($FaceName)) {
        $message += " and face '$FaceName'"
    }
    Write-Host $message -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($results.Count) font file(s):" -ForegroundColor Green
$results | Format-Table -AutoSize
