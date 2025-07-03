# PowerShell script to list all available fonts and output as CSV
# Enhanced version with compatibility for all PowerShell versions (including PS 2.0/3.0)
#
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
    # Use ArrayList for better compatibility with older PowerShell versions
    $defaultFolders = New-Object System.Collections.ArrayList

    if ($IncludeSystemFonts -or (-not $IncludeSystemFonts -and -not $IncludeUserFonts)) {
        $systemFontFolder = "C:\Windows\Fonts"
        if (Test-Path $systemFontFolder) { [void]$defaultFolders.Add($systemFontFolder) }
    }
    if ($IncludeUserFonts -or (-not $IncludeSystemFonts -and -not $IncludeUserFonts)) {
        $userLocalFonts = "$env:LOCALAPPDATA\Microsoft\Windows\Fonts"
        if (Test-Path $userLocalFonts) { [void]$defaultFolders.Add($userLocalFonts) }

        $userRoamingFonts = "$env:APPDATA\Microsoft\Windows\Fonts"
        if (Test-Path $userRoamingFonts) { [void]$defaultFolders.Add($userRoamingFonts) }

        $adobeFonts = "$env:LOCALAPPDATA\Adobe\CoreSync\plugins\livetype\r"
        if (Test-Path $adobeFonts) { [void]$defaultFolders.Add($adobeFonts) }

        $officeFonts = "$env:PROGRAMFILES\Microsoft Office\root\VFS\Fonts\private"
        if (Test-Path $officeFonts) { [void]$defaultFolders.Add($officeFonts) }

        $commonLocations = @(
            "$env:PROGRAMFILES\Common Files\Microsoft Shared\Fonts",
            "$env:PROGRAMFILES(X86)\Common Files\Microsoft Shared\Fonts",
            "$env:USERPROFILE\AppData\Local\Microsoft\Windows\Fonts",
            "$env:USERPROFILE\Documents\My Fonts"
        )
        foreach ($location in $commonLocations) {
            if (Test-Path $location) { [void]$defaultFolders.Add($location) }
        }
    }
    # Convert ArrayList back to array for assignment
    $FontFolders = $defaultFolders.ToArray()
}

# Load required assemblies for font metadata reading
try {
    Add-Type -AssemblyName System.Drawing
    Add-Type -AssemblyName System.Windows.Forms
}
catch {
    Write-Warning "Failed to load one or more assemblies: $($_.Exception.Message)"
    Write-Warning "Some font metadata features may not be available"
}

# Don't load PresentationCore here - we'll attempt it when needed
# This improves compatibility with systems without WPF

# Helper functions
function Get-FontMetadata {
    param([string]$FontPath)

    try {
        # Create a PrivateFontCollection to load the font file
        $fontCollection = New-Object System.Drawing.Text.PrivateFontCollection
        $fontCollection.AddFontFile($FontPath)

        if ($fontCollection.Families.Count -gt 0) {
            $fontFamily = $fontCollection.Families[0]
            $familyName = $fontFamily.Name

            # Try to determine style by checking available styles
            $styleName = "Regular"

            # Check which styles are available for this font family
            $isBold = $fontFamily.IsStyleAvailable([System.Drawing.FontStyle]::Bold)
            $isItalic = $fontFamily.IsStyleAvailable([System.Drawing.FontStyle]::Italic)
            $isBoldItalic = $fontFamily.IsStyleAvailable([System.Drawing.FontStyle]::Bold -bor [System.Drawing.FontStyle]::Italic)
            # Also check regular style - even though not used directly, checking helps determine available styles
            $fontFamily.IsStyleAvailable([System.Drawing.FontStyle]::Regular)

            # Try to infer style from font availability
            if ($isBoldItalic) {
                $styleName = "Bold Italic"
            }
            elseif ($isBold) {
                $styleName = "Bold"
            }
            elseif ($isItalic) {
                $styleName = "Italic"
            }

            # Also check filename for style hints
            $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FontPath).ToLower()

            # Guess style based on filename patterns as a fallback
            if ($baseName.EndsWith("bd") -or $baseName -match "bold") {
                if ($baseName.EndsWith("bi") -or $baseName -match "italic") {
                    $styleName = "Bold Italic"
                }
                else {
                    $styleName = "Bold"
                }
            }
            elseif ($baseName.EndsWith("bi") -or ($baseName -match "bold" -and $baseName -match "italic")) {
                $styleName = "Bold Italic"
            }
            elseif ($baseName.EndsWith("i") -or $baseName -match "italic") {
                $styleName = "Italic"
            }
            elseif ($baseName -match "light") {
                $styleName = "Light"
            }
            elseif ($baseName -match "thin") {
                $styleName = "Thin"
            }
            elseif ($baseName -match "medium") {
                $styleName = "Medium"
            }
            elseif ($baseName -match "black") {
                $styleName = "Black"
            }
            elseif ($baseName -match "semibold") {
                $styleName = "Semibold"
            }
            elseif ($baseName -match "semilight") {
                $styleName = "Semilight"
            }
            elseif ($baseName -match "condensed") {
                $styleName = "Condensed"
            }
            elseif ($baseName -match "expanded") {
                $styleName = "Expanded"
            }

            # Map family names for consistency with VBScript version
            $mappedFamily = Get-ProperFamilyName $familyName

            return @{
                Family  = $mappedFamily
                Style   = $styleName
                Success = $true
            }
        }

        # Dispose of the font collection
        $fontCollection.Dispose()
    }
    catch {
        # If font metadata reading fails, fall back to filename parsing
        return @{
            Family  = $null
            Style   = $null
            Success = $false
            Error   = $_.Exception.Message
        }
    }

    return @{
        Family  = $null
        Style   = $null
        Success = $false
    }
}

function Get-FallbackFontInfo {
    param([string]$FileName)
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
    $lowerName = $baseName.ToLower()

    # Fallback family name extraction
    $familyName = $baseName
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
    }
    else {
        # For longer names, remove common style indicators
        # Using a more compatibility-friendly approach with explicit checks
        $commonStyles = @("Bold", "Italic", "Light", "Regular", "Medium", "Thin",
            "Black", "Semibold", "Semilight", "Condensed", "Expanded")

        foreach ($style in $commonStyles) {
            # Simple string replacement without regex
            $familyName = $familyName.Replace($style, "")
        }

        $familyName = $familyName.Trim()
    }

    # Apply proper family name mapping for consistency
    $mappedFamily = Get-ProperFamilyName $familyName

    # Fallback style determination
    $styleName = "Regular"
    if ($baseName.Length -le 10) {
        if ($lowerName.EndsWith("bd")) { $styleName = 'Bold' }
        elseif ($lowerName.EndsWith("bi")) { $styleName = 'Bold Italic' }
        elseif ($lowerName.EndsWith("i") -and $lowerName -ne "i") { $styleName = 'Italic' }
    }
    else {
        # For longer names, check for style keywords
        if (($lowerName -match "bold" -and $lowerName -match "italic") -or $lowerName -match "bi\b") {
            $styleName = "Bold Italic"
        }
        elseif ($lowerName -match "bold" -or $lowerName -match "\bbd\b") {
            $styleName = "Bold"
        }
        elseif ($lowerName -match "italic" -or $lowerName -match "\bit\b") {
            $styleName = "Italic"
        }
        elseif ($lowerName -match "light") {
            $styleName = "Light"
        }
        elseif ($lowerName -match "thin") {
            $styleName = "Thin"
        }
        elseif ($lowerName -match "medium") {
            $styleName = "Medium"
        }
        elseif ($lowerName -match "black") {
            $styleName = "Black"
        }
        elseif ($lowerName -match "semibold") {
            $styleName = "Semibold"
        }
        elseif ($lowerName -match "semilight") {
            $styleName = "Semilight"
        }
    }

    return @{
        Family = $mappedFamily
        Style  = $styleName
    }
}

function Get-FontsFromRegistry {
    # Attempt to get font information from registry as an additional source
    # Returns a hashtable with font names as keys
    try {
        $fontDict = @{}

        # Check font registry paths
        $fontKeys = @(
            'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts',
            'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\FontSubstitutes'
        )

        foreach ($keyPath in $fontKeys) {
            if (Test-Path $keyPath) {
                $fontKey = Get-Item -Path $keyPath

                # Process font registry values
                foreach ($valueName in $fontKey.GetValueNames()) {
                    # Extract font family name
                    $familyName = $valueName

                    # Clean up font family name - using more compatible regex pattern syntax
                    if ($familyName -match ' \(TrueType\)$') {
                        $familyName = $familyName -replace ' \(TrueType\)$', ''
                    }
                    if ($familyName -match ' \(OpenType\)$') {
                        $familyName = $familyName -replace ' \(OpenType\)$', ''
                    }
                    if ($familyName -match ' \(CFF\)$') {
                        $familyName = $familyName -replace ' \(CFF\)$', ''
                    }
                    if ($familyName -match ' Regular$') {
                        $familyName = $familyName -replace ' Regular$', ''
                    }
                    $familyName = $familyName.Trim()

                    # Add to dictionary if not empty
                    if ($familyName -and -not $fontDict.ContainsKey($familyName)) {
                        $fontDict[$familyName] = $true
                    }

                    # For font substitutes, also add the substituted font
                    if ($keyPath -like '*FontSubstitutes') {
                        $substituteValue = $fontKey.GetValue($valueName)
                        if ($substituteValue -and -not $fontDict.ContainsKey($substituteValue)) {
                            $fontDict[$substituteValue] = $true
                        }
                    }
                }
            }
        }

        # Try to directly read MS Shell Dlg mappings - these are important system virtual fonts
        try {
            $shellDlgKey = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\FontSubstitutes'
            if (Test-Path $shellDlgKey) {
                $shellDlgFonts = @('MS Shell Dlg', 'MS Shell Dlg 2')
                foreach ($shellFont in $shellDlgFonts) {
                    $shellValue = (Get-ItemProperty -Path $shellDlgKey -Name $shellFont -ErrorAction SilentlyContinue).$shellFont
                    if ($shellValue) {
                        if (-not $fontDict.ContainsKey($shellFont)) {
                            $fontDict[$shellFont] = $true
                        }
                        if (-not $fontDict.ContainsKey($shellValue)) {
                            $fontDict[$shellValue] = $true
                        }
                    }
                }
            }
        }
        catch {
            # Continue even if this specific check fails
            Write-Verbose "Could not check MS Shell Dlg mappings: $($_.Exception.Message)"
        }

        # Additional common system fonts that might be missed
        $additionalFonts = @(
            'MS Shell Dlg',
            'MS Shell Dlg 2',
            'Microsoft Sans Serif',
            'System',
            'Terminal',
            'Marlett',
            'Webdings',
            'Wingdings'
        )

        foreach ($font in $additionalFonts) {
            if (-not $fontDict.ContainsKey($font)) {
                $fontDict[$font] = $true
            }
        }

        return $fontDict
    }
    catch {
        Write-Warning "Error retrieving fonts from registry: $($_.Exception.Message)"
        return @{}
    }
}

function Get-SystemFontNames {
    return @(
        'Arial Unicode MS', 'Bahnschrift', 'Cambria Math', 'DengXian', 'Franklin Gothic',
        'Gabriola', 'Global Monospace', 'Global Sans Serif', 'Global Serif',
        'Global User Interface', 'HoloLens MDL2 Assets', 'Khmer UI', 'Lao UI',
        'Leelawadee UI', 'Leelawadee UI Semilight', 'Microsoft JhengHei UI',
        'Microsoft JhengHei UI Light', 'Microsoft YaHei UI', 'Microsoft YaHei UI Light',
        'MingLiU-ExtB', 'MingLiU_HKSCS-ExtB', 'MingLiU_MSCS-ExtB', 'MS Gothic',
        'MS PGothic', 'MS UI Gothic', 'Myanmar Text', 'Nirmala UI', 'Nirmala UI Semilight',
        'Segoe Fluent Icons', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script',
        'Segoe UI Emoji', 'Segoe UI Historic', 'Segoe UI Light', 'Segoe UI Semibold',
        'Segoe UI Semilight', 'Segoe UI Symbol', 'Sitka Banner', 'Sitka Display',
        'Sitka Heading', 'Sitka Small', 'Sitka Subheading', 'Sitka Text', 'Yu Gothic UI',
        'Yu Gothic UI Light', 'Yu Gothic UI Semibold', 'Yu Gothic UI Semilight'
    )
}

function Get-ProperFamilyName {
    param([string]$ExtractedFamily)

    # This function mirrors the VBScript GetProperFamilyName function
    # for consistency between the two implementations, adapted for maximum PowerShell version compatibility

    if ([string]::IsNullOrEmpty($ExtractedFamily)) {
        return ""
    }

    $lowerFamily = $ExtractedFamily.ToLower()

    # Map common filename patterns to proper font family names - using simple if statements
    # instead of switch -regex for better compatibility with older PowerShell versions

    # Exact matches
    if ($lowerFamily -eq "times") { return "Times New Roman" }
    if ($lowerFamily -eq "arial") { return "Arial" }
    if ($lowerFamily -eq "tahoma") { return "Tahoma" }
    if ($lowerFamily -eq "verdana") { return "Verdana" }
    if ($lowerFamily -eq "trebuc") { return "Trebuchet MS" }
    if ($lowerFamily -eq "cour") { return "Courier New" }
    if ($lowerFamily -eq "georgia") { return "Georgia" }
    if ($lowerFamily -eq "comic") { return "Comic Sans MS" }
    if ($lowerFamily -eq "impact") { return "Impact" }
    if ($lowerFamily -eq "lucon") { return "Lucida Console" }
    if ($lowerFamily -eq "pala") { return "Palatino Linotype" }
    if ($lowerFamily -eq "symbol") { return "Symbol" }
    if ($lowerFamily -eq "webdings") { return "Webdings" }
    if ($lowerFamily -eq "wingding") { return "Wingdings" }

    # Calibri patterns
    if ($lowerFamily -eq "calibr" -or $lowerFamily -eq "calibri" -or
        $lowerFamily -eq "calibrib" -or $lowerFamily -eq "calibril" -or
        $lowerFamily -eq "calibriz") {
        return "Calibri"
    }

    # Segoe UI patterns
    if ($lowerFamily -eq "segoeuib" -or $lowerFamily -eq "segoeui") {
        return "Segoe UI"
    }

    # Check if it starts with a known font family prefix
    if ($lowerFamily.StartsWith("calibri") -or $lowerFamily.StartsWith("calibr")) {
        return "Calibri"
    }
    if ($lowerFamily.StartsWith("arial")) {
        return "Arial"
    }
    if ($lowerFamily.StartsWith("times")) {
        return "Times New Roman"
    }
    if ($lowerFamily.StartsWith("tahoma")) {
        return "Tahoma"
    }
    if ($lowerFamily.StartsWith("verdana")) {
        return "Verdana"
    }
    if ($lowerFamily.StartsWith("cour")) {
        return "Courier New"
    }
    if ($lowerFamily.StartsWith("georgia")) {
        return "Georgia"
    }
    if ($lowerFamily.StartsWith("comic")) {
        return "Comic Sans MS"
    }

    # If no mapping found, return the original
    return $ExtractedFamily
}

# Scan for all font files
# Use ArrayList instead of arrays for better compatibility and performance in older PowerShell
$results = New-Object System.Collections.ArrayList
$seenFiles = New-Object System.Collections.Hashtable  # Track files we've already added to prevent duplicates
$seenFamilies = New-Object System.Collections.Hashtable  # Track font families we've already added

foreach ($fontFolder in $FontFolders) {
    foreach ($ext in $FileExtensions) {
        $files = Get-ChildItem -Path $fontFolder -Filter $ext -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            # Skip if we've already processed this exact file path
            if ($seenFiles.ContainsKey($file.FullName)) {
                continue
            }
            $seenFiles[$file.FullName] = $true

            # Try to get font metadata first
            $fontInfo = Get-FontMetadata -FontPath $file.FullName

            if ($fontInfo.Success) {
                $family = $fontInfo.Family
                $face = $fontInfo.Style
            }
            else {
                # Fall back to filename parsing if metadata reading fails
                $fallbackInfo = Get-FallbackFontInfo -FileName $file.Name
                $family = $fallbackInfo.Family
                $face = $fallbackInfo.Style
            }

            # Track this family as found
            $seenFamilies[$family] = $true

            # Create object compatible with older PowerShell versions
            $fontObject = New-Object PSObject
            $fontObject | Add-Member -MemberType NoteProperty -Name "FullPath" -Value $file.FullName
            $fontObject | Add-Member -MemberType NoteProperty -Name "Family" -Value $family
            $fontObject | Add-Member -MemberType NoteProperty -Name "Face" -Value $face

            # Using ArrayList's Add method instead of += for better performance and compatibility
            [void]$results.Add($fontObject)
        }
    }
}

# Add system font families that weren't found in file scan
try {
    # First try to load WPF assembly (may not be available in older PowerShell versions)
    $wpfAssemblyLoaded = $false

    try {
        # Check if WPF is available by attempting to load required assemblies
        Add-Type -AssemblyName PresentationFramework -ErrorAction Stop
        $wpfAssemblyLoaded = $true
    }
    catch {
        # WPF isn't available - this is normal on older PowerShell versions
        $wpfAssemblyLoaded = $false
    }

    if ($wpfAssemblyLoaded) {
        # First method: Using WPF (most comprehensive)
        $systemFamilies = [System.Windows.Media.Fonts]::SystemFontFamilies

        foreach ($family in $systemFamilies) {
            $name = $null
            # Try different ways to get the name, compatible with older PowerShell
            try {
                # Method 1: Try to get the English name directly
                $langObj = [System.Windows.Markup.XmlLanguage]::GetLanguage('en-us')
                $name = ""
                $gotName = $family.FamilyNames.TryGetValue($langObj, ([ref]$name))
                if (-not $gotName -or [string]::IsNullOrEmpty($name)) {
                    # Method 2: Try to get any name
                    if ($family.FamilyNames.Keys.Count -gt 0) {
                        $firstKey = $family.FamilyNames.Keys | Select-Object -First 1
                        if ($firstKey) {
                            $name = $family.FamilyNames[$firstKey]
                        }
                    }

                    # Method 3: Last resort - get name through Source property if available
                    if ([string]::IsNullOrEmpty($name) -and $family.Source) {
                        $name = $family.Source
                    }
                }
            }
            catch {
                # If all structured approaches fail, try one more direct method
                try {
                    $name = $family.ToString()
                }
                catch {
                    # Nothing more we can do
                    $name = $null
                }
            }

            # Only add if we got a valid name and haven't seen this family before
            if (-not [string]::IsNullOrEmpty($name) -and -not $seenFamilies.ContainsKey($name)) {
                $seenFamilies[$name] = $true

                # Create object for system font family (no physical file)
                $fontObject = New-Object PSObject
                $fontObject | Add-Member -MemberType NoteProperty -Name "FullPath" -Value ""
                $fontObject | Add-Member -MemberType NoteProperty -Name "Family" -Value $name
                $fontObject | Add-Member -MemberType NoteProperty -Name "Face" -Value "Regular"

                # Using ArrayList's Add method instead of += for better performance and compatibility
                [void]$results.Add($fontObject)
            }
        }
    }
    else {
        Write-Warning "WPF is not available in this PowerShell version, using fallback methods"
        throw "WPF not available"  # Force using fallback methods
    }
}
catch {
    # If WPF font enumeration fails, fall back to registry-based approach
    Write-Warning "Could not enumerate system fonts with WPF: $($_.Exception.Message)"
    try {
        # Second method: Registry-based font detection (fallback)
        $registryFonts = Get-FontsFromRegistry
        foreach ($fontName in $registryFonts.Keys) {
            # Only add if we haven't seen this family name before
            if (-not $seenFamilies.ContainsKey($fontName)) {
                $seenFamilies[$fontName] = $true

                # Create object for system font family (no physical file)
                $fontObject = New-Object PSObject
                $fontObject | Add-Member -MemberType NoteProperty -Name "FullPath" -Value ""
                $fontObject | Add-Member -MemberType NoteProperty -Name "Family" -Value $fontName
                $fontObject | Add-Member -MemberType NoteProperty -Name "Face" -Value "Regular"

                # Using ArrayList's Add method instead of += for better performance and compatibility
                [void]$results.Add($fontObject)
            }
        }

        # Third method: Use dynamically generated system font list as last resort
        $systemFontNames = Get-SystemFontNames

        foreach ($fontName in $systemFontNames) {
            # Only add if we haven't seen this family name before
            if (-not $seenFamilies.ContainsKey($fontName)) {
                $seenFamilies[$fontName] = $true

                # Create object for system font family (no physical file)
                $fontObject = New-Object PSObject
                $fontObject | Add-Member -MemberType NoteProperty -Name "FullPath" -Value ""
                $fontObject | Add-Member -MemberType NoteProperty -Name "Family" -Value $fontName
                $fontObject | Add-Member -MemberType NoteProperty -Name "Face" -Value "Regular"

                # Using ArrayList's Add method instead of += for better performance and compatibility
                [void]$results.Add($fontObject)
            }
        }
    }
    catch {
        # If all methods fail, continue with file-based results only
        Write-Warning "Could not enumerate system fonts from registry: $($_.Exception.Message)"
    }
}

# Output CSV header and process fonts to remove duplicates
Write-Output "FullPath,Family,Face"

# First pass: identify all fonts with full paths
$fontFamilyWithPath = New-Object System.Collections.Hashtable
foreach ($font in $results) {
    if ($font.FullPath -ne "") {
        # Normalize by removing trailing spaces - using String methods for compatibility
        $normalizedFamily = $font.Family.TrimEnd()
        if (-not $fontFamilyWithPath.ContainsKey($normalizedFamily)) {
            $fontFamilyWithPath[$normalizedFamily] = $true
        }
    }
}

# Second pass: output fonts, skipping virtual fonts when a physical file exists
foreach ($font in $results) {
    # Normalize family name by removing trailing spaces - using String methods for compatibility
    $normalizedFamily = $font.Family.TrimEnd()

    # Skip this font if:
    # 1. It has no path (virtual font)
    # 2. The same font family exists with a full path
    if ($font.FullPath -eq "" -and $fontFamilyWithPath.ContainsKey($normalizedFamily)) {
        # Skip this virtual font as we have a physical file for this family
        continue
    }

    # For fonts we're keeping, ensure the family name has no trailing spaces
    $font.Family = $normalizedFamily

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
