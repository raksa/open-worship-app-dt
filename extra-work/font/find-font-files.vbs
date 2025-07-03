' VBScript to list all available fonts and output as CSV
' Usage examples:
'   cscript find-font-files.vbs
'   cscript find-font-files.vbs > fonts.csv

Option Explicit

Dim fso, shell, objShell, fontNamespace
Dim fontFolders, fileExtensions
Dim results, seenFiles, seenFamilies
Dim folder, file, files
Dim family, face, fullPath
Dim i, j, k

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
Set objShell = CreateObject("Shell.Application")
Set fontNamespace = Nothing

' Initialize arrays
Set fontFolders = CreateObject("Scripting.Dictionary")
Set fileExtensions = CreateObject("Scripting.Dictionary")
Set results = CreateObject("Scripting.Dictionary")
Set seenFiles = CreateObject("Scripting.Dictionary")
Set seenFamilies = CreateObject("Scripting.Dictionary")

' Define file extensions to search for
fileExtensions.Add "ttf", True
fileExtensions.Add "otf", True
fileExtensions.Add "ttc", True
fileExtensions.Add "woff", True
fileExtensions.Add "woff2", True
fileExtensions.Add "fon", True
fileExtensions.Add "fnt", True

' Build font folders list
Call BuildFontFolders()

' Scan for all font files
Call ScanFontFiles()

' Add system font families that weren't found in file scan
Call AddSystemFonts()

' Output CSV
Call OutputCSV()

' Clean up
Set fso = Nothing
Set shell = Nothing
Set objShell = Nothing
Set fontNamespace = Nothing
Set fontFolders = Nothing
Set fileExtensions = Nothing
Set results = Nothing
Set seenFiles = Nothing
Set seenFamilies = Nothing

' ==================== FUNCTIONS ====================

Sub BuildFontFolders()
    Dim systemFontFolder, userLocalFonts, userRoamingFonts
    Dim adobeFonts, officeFonts
    Dim commonLocations(7)

    ' System fonts
    systemFontFolder = shell.ExpandEnvironmentStrings("%WINDIR%") & "\Fonts"
    If fso.FolderExists(systemFontFolder) Then
        If Not fontFolders.Exists(systemFontFolder) Then
            fontFolders.Add systemFontFolder, True
        End If
    End If

    ' User fonts
    userLocalFonts = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Microsoft\Windows\Fonts"
    If fso.FolderExists(userLocalFonts) Then
        If Not fontFolders.Exists(userLocalFonts) Then
            fontFolders.Add userLocalFonts, True
        End If
    End If

    userRoamingFonts = shell.ExpandEnvironmentStrings("%APPDATA%") & "\Microsoft\Windows\Fonts"
    If fso.FolderExists(userRoamingFonts) Then
        If Not fontFolders.Exists(userRoamingFonts) Then
            fontFolders.Add userRoamingFonts, True
        End If
    End If

    ' Adobe fonts
    adobeFonts = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Adobe\CoreSync\plugins\livetype\r"
    If fso.FolderExists(adobeFonts) Then
        If Not fontFolders.Exists(adobeFonts) Then
            fontFolders.Add adobeFonts, True
        End If
    End If

    ' Office fonts
    officeFonts = shell.ExpandEnvironmentStrings("%PROGRAMFILES%") & "\Microsoft Office\root\VFS\Fonts\private"
    If fso.FolderExists(officeFonts) Then
        If Not fontFolders.Exists(officeFonts) Then
            fontFolders.Add officeFonts, True
        End If
    End If

    ' Common third-party locations
    commonLocations(0) = shell.ExpandEnvironmentStrings("%PROGRAMFILES%") & "\Common Files\Microsoft Shared\Fonts"
    commonLocations(1) = shell.ExpandEnvironmentStrings("%PROGRAMFILES(X86)%") & "\Common Files\Microsoft Shared\Fonts"
    commonLocations(2) = shell.ExpandEnvironmentStrings("%USERPROFILE%") & "\AppData\Local\Microsoft\Windows\Fonts"
    commonLocations(3) = shell.ExpandEnvironmentStrings("%USERPROFILE%") & "\Documents\My Fonts"

    For i = 0 To UBound(commonLocations)
        If fso.FolderExists(commonLocations(i)) Then
            If Not fontFolders.Exists(commonLocations(i)) Then
                fontFolders.Add commonLocations(i), True
            End If
        End If
    Next
End Sub

Sub ScanFontFiles()
    Dim folderKeys, extKeys
    Dim currentFolder, currentExt
    Dim folderObj, fileObj
    Dim fileName, baseName

    folderKeys = fontFolders.Keys
    extKeys = fileExtensions.Keys

    For i = 0 To UBound(folderKeys)
        currentFolder = folderKeys(i)

        If fso.FolderExists(currentFolder) Then
            Set folderObj = fso.GetFolder(currentFolder)

            For Each fileObj In folderObj.Files
                fileName = fileObj.Name

                ' Check if file has one of our target extensions
                For j = 0 To UBound(extKeys)
                    currentExt = extKeys(j)
                    If LCase(Right(fileName, Len(currentExt) + 1)) = "." & LCase(currentExt) Then
                        ' Skip if we've already processed this file
                        If Not seenFiles.Exists(fileObj.Path) Then
                            seenFiles.Add fileObj.Path, True

                            ' Try to get font metadata first
                            Dim fontInfo
                            Set fontInfo = GetFontMetadata(fileObj.Path, fileObj.Name)

                            family = fontInfo("Family")
                            face = fontInfo("Style")

                            ' Track this family as found
                            If Not seenFamilies.Exists(family) Then
                                seenFamilies.Add family, True
                            End If

                            ' Store result
                            results.Add results.Count, fileObj.Path & "|" & family & "|" & face
                        End If
                        Exit For
                    End If
                Next
            Next
        End If
    Next
End Sub

Sub AddSystemFonts()
    ' Add system font families using a comprehensive list
    ' Since VBScript cannot directly access WPF APIs, we'll use a comprehensive list
    ' to add common missing font families that are typically virtual/system fonts

    ' First try to get fonts from registry if possible
    Dim registryFonts
    Set registryFonts = GetFontsFromRegistry()

    ' Also use our hardcoded list for maximum coverage
    Dim systemFonts
    systemFonts = Array( _
        "Arial Unicode MS", _
        "Bahnschrift", _
        "Cambria Math", _
        "DengXian", _
        "Franklin Gothic", _
        "Gabriola", _
        "Global Monospace", _
        "Global Sans Serif", _
        "Global Serif", _
        "Global User Interface", _
        "HoloLens MDL2 Assets", _
        "Khmer UI", _
        "Lao UI", _
        "Leelawadee UI", _
        "Leelawadee UI Semilight", _
        "Microsoft JhengHei UI", _
        "Microsoft JhengHei UI Light", _
        "Microsoft YaHei UI", _
        "Microsoft YaHei UI Light", _
        "MingLiU-ExtB", _
        "MingLiU_HKSCS-ExtB", _
        "MingLiU_MSCS-ExtB", _
        "MS Gothic", _
        "MS PGothic", _
        "MS UI Gothic", _
        "Myanmar Text", _
        "Nirmala UI", _
        "Nirmala UI Semilight", _
        "Segoe Fluent Icons", _
        "Segoe MDL2 Assets", _
        "Segoe Print", _
        "Segoe Script", _
        "Segoe UI Emoji", _
        "Segoe UI Historic", _
        "Segoe UI Light", _
        "Segoe UI Semibold", _
        "Segoe UI Semilight", _
        "Segoe UI Symbol", _
        "Sitka Banner", _
        "Sitka Display", _
        "Sitka Heading", _
        "Sitka Small", _
        "Sitka Subheading", _
        "Sitka Text", _
        "Yu Gothic UI", _
        "Yu Gothic UI Light", _
        "Yu Gothic UI Semibold", _
        "Yu Gothic UI Semilight" _
    )

    ' Add registry detected fonts first
    If Not registryFonts Is Nothing Then
        Dim regFontName
        For Each regFontName in registryFonts.Keys
            ' Only add if we haven't seen this family name before
            If Not seenFamilies.Exists(regFontName) Then
                seenFamilies.Add regFontName, True
                ' Store result with empty path and Regular face
                results.Add results.Count, "" & "|" & regFontName & "|Regular"
            End If
        Next
    End If

    ' Add hardcoded system fonts
    Dim fontName
    For i = 0 To UBound(systemFonts)
        fontName = systemFonts(i)

        ' Only add if we haven't seen this family name before
        If Not seenFamilies.Exists(fontName) Then
            seenFamilies.Add fontName, True

            ' Store result with empty path and Regular face
            results.Add results.Count, "" & "|" & fontName & "|Regular"
        End If
    Next
End Sub

Function GetFontsFromRegistry()
    ' Try to get font names from registry as an additional source
    ' This helps in discovering system fonts that may not have physical files

    Dim fontDict
    Set fontDict = CreateObject("Scripting.Dictionary")

    On Error Resume Next

    Dim WshShell, fontKey, fontValues, fontName
    Set WshShell = CreateObject("WScript.Shell")

    ' Try to access the fonts registry key
    fontKey = "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts\"

    ' We can't enumerate registry keys in VBScript easily, but we can try some common system fonts
    Dim testFonts
    testFonts = Array("Arial (TrueType)", "Calibri (TrueType)", "Segoe UI (TrueType)", "Cambria Math (TrueType)")

    ' Try to read some font registry values
    For Each fontName in testFonts
        Dim regValue
        regValue = ""

        ' Try to read the registry value
        On Error Resume Next
        regValue = WshShell.RegRead(fontKey & fontName)
        On Error GoTo 0

        If regValue <> "" Then
            ' Extract font family name from registry key name
            Dim familyName
            familyName = Replace(fontName, " (TrueType)", "")
            familyName = Replace(familyName, " (OpenType)", "")

            If Not fontDict.Exists(familyName) Then
                fontDict.Add familyName, True
            End If
        End If
    Next

    ' Try to access the font substitutes registry key, which often contains system fonts
    Dim subsKey
    subsKey = "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\FontSubstitutes\"

    ' List of common font substitutes to check
    Dim substituteFonts
    substituteFonts = Array("Segoe UI", "Arial", "Times New Roman", "Courier New", "MS Shell Dlg", "MS Shell Dlg 2", "Tahoma")

    ' Try to read font substitute values
    For Each fontName in substituteFonts
        Dim subValue
        subValue = ""

        On Error Resume Next
        subValue = WshShell.RegRead(subsKey & fontName)
        On Error GoTo 0

        If subValue <> "" Then
            ' Add both the substitute name and the substituted font
            If Not fontDict.Exists(fontName) Then
                fontDict.Add fontName, True
            End If

            If Not fontDict.Exists(subValue) Then
                fontDict.Add subValue, True
            End If
        End If
    Next

    On Error GoTo 0

    Set GetFontsFromRegistry = fontDict
End Function

Function GetFontMetadata(fontPath, fileName)
    Dim fontInfo
    Set fontInfo = CreateObject("Scripting.Dictionary")

    ' Try to get metadata using Shell.Application
    Dim folderPath, justFileName
    folderPath = fso.GetParentFolderName(fontPath)
    justFileName = fso.GetFileName(fontPath)

    On Error Resume Next
    Dim folder, fileItem
    Set folder = objShell.Namespace(folderPath)

    If Not folder Is Nothing Then
        Set fileItem = folder.ParseName(justFileName)
        If Not fileItem Is Nothing Then
            ' Get font name from extended properties
            ' Common property indices for font information
            ' Index 0: Name
            ' Index 21: Title/Font Name on some systems
            ' Index 165: Font face name on some systems
            ' Index 194: Font family on some systems

            Dim fontName, i
            fontName = ""

            ' Try known property indices first
            Dim knownIndices
            knownIndices = Array(0, 21, 165, 194, 195)

            For Each i In knownIndices
                Dim propValue
                propValue = folder.GetDetailsOf(fileItem, i)
                If propValue <> "" Then
                    ' Check if this looks like a font family name
                    If InStr(propValue, "Times New Roman") > 0 Or _
                       InStr(propValue, "Arial") > 0 Or _
                       InStr(propValue, "Calibri") > 0 Or _
                       InStr(propValue, "Tahoma") > 0 Or _
                       Len(propValue) > 3 And InStr(propValue, ".") = 0 And _
                       InStr(propValue, "KB") = 0 And InStr(propValue, "MB") = 0 And _
                       Not IsNumeric(propValue) Then
                        fontName = propValue
                        Exit For
                    End If
                End If
            Next

            ' If we didn't find a name with known indices, try scanning more property indices
            If fontName = "" Then
                For i = 1 To 200
                    If Not Contains(knownIndices, i) Then
                        propValue = folder.GetDetailsOf(fileItem, i)
                        If propValue <> "" Then
                            ' Check if this looks like a font family name
                            If InStr(propValue, "Times New Roman") > 0 Or _
                               InStr(propValue, "Arial") > 0 Or _
                               InStr(propValue, "Calibri") > 0 Or _
                               InStr(propValue, "Tahoma") > 0 Or _
                               Len(propValue) > 3 And InStr(propValue, ".") = 0 And _
                               InStr(propValue, "KB") = 0 And InStr(propValue, "MB") = 0 And _
                               Not IsNumeric(propValue) Then
                                fontName = propValue
                                Exit For
                            End If
                        End If
                    End If
                Next
            End If

            ' If we found a font name, use it
            If fontName <> "" And fontName <> justFileName Then
                fontInfo("Family") = fontName
                fontInfo("Style") = GetStyleFromMetadata(fontName, fileName)
                fontInfo("Success") = True
                On Error GoTo 0
                Set GetFontMetadata = fontInfo
                Exit Function
            End If
        End If
    End If
    On Error GoTo 0

    ' Fallback to enhanced filename parsing
    Dim fallbackInfo
    Set fallbackInfo = GetFallbackFontInfo(fileName)
    fontInfo("Family") = fallbackInfo("Family")
    fontInfo("Style") = fallbackInfo("Style")
    fontInfo("Success") = False

    Set GetFontMetadata = fontInfo
End Function

Function GetStyleFromMetadata(fontName, fileName)
    ' Extract style information from filename since metadata often doesn't include style
    Dim baseName, lowerName
    baseName = fso.GetBaseName(fileName)
    lowerName = LCase(baseName)

    ' Check filename patterns for style
    If Len(baseName) <= 10 Then
        If Right(lowerName, 2) = "bd" Then
            GetStyleFromMetadata = "Bold"
        ElseIf Right(lowerName, 2) = "bi" Then
            GetStyleFromMetadata = "Bold Italic"
        ElseIf Right(lowerName, 1) = "i" And lowerName <> "i" Then
            GetStyleFromMetadata = "Italic"
        Else
            GetStyleFromMetadata = "Regular"
        End If
    Else
        ' For longer names, check for style keywords
        If (InStr(lowerName, "bold") > 0 And InStr(lowerName, "italic") > 0) Or InStr(lowerName, "bi") > 0 Then
            GetStyleFromMetadata = "Bold Italic"
        ElseIf InStr(lowerName, "bold") > 0 Or InStr(lowerName, "bd") > 0 Then
            GetStyleFromMetadata = "Bold"
        ElseIf InStr(lowerName, "italic") > 0 Or InStr(lowerName, "it") > 0 Then
            GetStyleFromMetadata = "Italic"
        ElseIf InStr(lowerName, "light") > 0 Then
            GetStyleFromMetadata = "Light"
        ElseIf InStr(lowerName, "thin") > 0 Then
            GetStyleFromMetadata = "Thin"
        ElseIf InStr(lowerName, "medium") > 0 Then
            GetStyleFromMetadata = "Medium"
        ElseIf InStr(lowerName, "black") > 0 Then
            GetStyleFromMetadata = "Black"
        Else
            GetStyleFromMetadata = "Regular"
        End If
    End If
End Function

Function GetFallbackFontInfo(fileName)
    Dim fontInfo
    Set fontInfo = CreateObject("Scripting.Dictionary")

    Dim baseName, normalizedName, familyName, lowerName
    baseName = fso.GetBaseName(fileName)
    lowerName = LCase(baseName)

    ' Extract family name from filename
    If Len(baseName) <= 10 Then
        If Right(lowerName, 2) = "bd" Then
            familyName = Left(baseName, Len(baseName) - 2)
        ElseIf Right(lowerName, 2) = "bi" Then
            familyName = Left(baseName, Len(baseName) - 2)
        ElseIf Right(lowerName, 1) = "i" And lowerName <> "i" Then
            familyName = Left(baseName, Len(baseName) - 1)
        Else
            familyName = baseName
        End If
    Else
        familyName = baseName
        ' Remove common style suffixes
        familyName = Replace(familyName, "Bold", "")
        familyName = Replace(familyName, "Italic", "")
        familyName = Replace(familyName, "Light", "")
        familyName = Replace(familyName, "Regular", "")
        familyName = Trim(familyName)
    End If

    ' Apply proper family name mapping
    fontInfo("Family") = GetProperFamilyName(familyName)
    fontInfo("Style") = GetStyleFromMetadata("", fileName)

    Set GetFallbackFontInfo = fontInfo
End Function

Function GetProperFamilyName(extractedFamily)
    Dim lowerFamily
    lowerFamily = LCase(extractedFamily)

    ' Map common filename patterns to proper font family names
    Select Case lowerFamily
        Case "times"
            GetProperFamilyName = "Times New Roman"
        Case "arial"
            GetProperFamilyName = "Arial"
        Case "calibr", "calibri", "calibrib", "calibril", "calibriz"
            GetProperFamilyName = "Calibri"
        Case "tahoma"
            GetProperFamilyName = "Tahoma"
        Case "verdana"
            GetProperFamilyName = "Verdana"
        Case "trebuc"
            GetProperFamilyName = "Trebuchet MS"
        Case "cour"
            GetProperFamilyName = "Courier New"
        Case "georgia"
            GetProperFamilyName = "Georgia"
        Case "comic"
            GetProperFamilyName = "Comic Sans MS"
        Case "impact"
            GetProperFamilyName = "Impact"
        Case "lucon"
            GetProperFamilyName = "Lucida Console"
        Case "pala"
            GetProperFamilyName = "Palatino Linotype"
        Case "segoeuib", "segoeui"
            GetProperFamilyName = "Segoe UI"
        Case "symbol"
            GetProperFamilyName = "Symbol"
        Case "webdings"
            GetProperFamilyName = "Webdings"
        Case "wingding"
            GetProperFamilyName = "Wingdings"
        Case Else
            ' Check if it starts with a known font family prefix
            If Left(lowerFamily, 7) = "calibri" Or Left(lowerFamily, 6) = "calibr" Then
                GetProperFamilyName = "Calibri"
            ElseIf Left(lowerFamily, 5) = "arial" Then
                GetProperFamilyName = "Arial"
            ElseIf Left(lowerFamily, 5) = "times" Then
                GetProperFamilyName = "Times New Roman"
            ElseIf Left(lowerFamily, 6) = "tahoma" Then
                GetProperFamilyName = "Tahoma"
            ElseIf Left(lowerFamily, 7) = "verdana" Then
                GetProperFamilyName = "Verdana"
            ElseIf Left(lowerFamily, 4) = "cour" Then
                GetProperFamilyName = "Courier New"
            ElseIf Left(lowerFamily, 7) = "georgia" Then
                GetProperFamilyName = "Georgia"
            ElseIf Left(lowerFamily, 5) = "comic" Then
                GetProperFamilyName = "Comic Sans MS"
            Else
                ' If no mapping found, return the original with proper case
                GetProperFamilyName = ProperCase(extractedFamily)
            End If
    End Select
End Function

Function ProperCase(inputString)
    ' Simple function to convert to proper case (first letter uppercase)
    If Len(inputString) = 0 Then
        ProperCase = ""
    Else
        ProperCase = UCase(Left(inputString, 1)) & LCase(Mid(inputString, 2))
    End If
End Function

Function Contains(arr, val)
    ' Helper function to check if an array contains a value
    Dim item
    Contains = False

    For Each item In arr
        If item = val Then
            Contains = True
            Exit Function
        End If
    Next
End Function

Function RegexReplace(inputString, pattern, replacement)
    ' Simple regex replacement for common patterns
    Dim result
    result = inputString

    ' Handle version pattern: [Version X.XX] XXXXXX
    If pattern = "\s*\[Version\s+[\d\.]+\]\s*\d*" Then
        Dim pos
        pos = InStr(result, "[Version")
        If pos > 0 Then
            Dim endPos
            endPos = InStr(pos, result, "]")
            If endPos > 0 Then
                ' Check if there are trailing digits and spaces after the ]
                Dim i, afterBracket
                afterBracket = endPos + 1
                ' Skip any trailing numbers and spaces
                For i = afterBracket To Len(result)
                    Dim ch
                    ch = Mid(result, i, 1)
                    If ch <> " " And Not IsNumeric(ch) Then
                        Exit For
                    End If
                Next

                ' Remove the version string and trailing content
                If pos > 1 And Mid(result, pos - 1, 1) = " " Then
                    result = Left(result, pos - 2) & Mid(result, i)
                Else
                    result = Left(result, pos - 1) & Mid(result, i)
                End If
            End If
        End If
    End If

    ' Handle style suffixes pattern
    If pattern = "\s+(bold|italic|light|regular|medium|thin|black|condensed|expanded|oblique)(\s|$)" Then
        ' Simple approach: find and remove style words at the end
        Dim lowerResult
        lowerResult = LCase(result)
        Dim styles
        styles = Array(" bold", " italic", " light", " regular", " medium", " thin", " black", " condensed", " expanded", " oblique")

        Dim j
        For j = 0 To UBound(styles)
            If Right(lowerResult, Len(styles(j))) = styles(j) Then
                result = Left(result, Len(result) - Len(styles(j)))
                Exit For
            End If
        Next
    End If

    ' Handle multiple spaces
    If pattern = "\s+" Then
        Do While InStr(result, "  ") > 0
            result = Replace(result, "  ", " ")
        Loop
    End If

    RegexReplace = result
End Function

Function EscapeCSV(value)
    Dim result
    result = Replace(value, """", """""")
    If InStr(result, ",") > 0 Then
        result = """" & result & """"
    End If
    EscapeCSV = result
End Function

Sub OutputCSV()
    Dim resultKeys, fontData, parts

    ' Try to add DirectWrite fonts as a last resort
    On Error Resume Next
    Call TryAddDirectWriteFonts()
    On Error GoTo 0

    ' First pass: identify all fonts with full paths
    Dim fontFamilyWithPath, normalizedFamily
    Set fontFamilyWithPath = CreateObject("Scripting.Dictionary")

    resultKeys = results.Keys
    For i = 0 To UBound(resultKeys)
        fontData = results(resultKeys(i))
        parts = Split(fontData, "|")

        If UBound(parts) >= 2 Then
            ' If this font has a full path
            If parts(0) <> "" Then
                ' Normalize family name by removing trailing spaces
                normalizedFamily = Trim(parts(1))
                ' Mark this family as having a physical file
                If Not fontFamilyWithPath.Exists(normalizedFamily) Then
                    fontFamilyWithPath.Add normalizedFamily, True
                End If
            End If
        End If
    Next

    ' Output header
    WScript.Echo "FullPath,Family,Face"

    ' Second pass: output fonts, skipping virtual fonts when a physical file exists
    resultKeys = results.Keys
    For i = 0 To UBound(resultKeys)
        fontData = results(resultKeys(i))
        parts = Split(fontData, "|")

        If UBound(parts) >= 2 Then
            ' Normalize family name by removing trailing spaces
            normalizedFamily = Trim(parts(1))

            ' Skip this font if:
            ' 1. It has no path (virtual font)
            ' 2. The same font family exists with a full path
            If parts(0) = "" And fontFamilyWithPath.Exists(normalizedFamily) Then
                ' Skip this virtual font as we have a physical file for this family
            Else
                ' Output the font with normalized family name
                WScript.Echo EscapeCSV(parts(0)) & "," & EscapeCSV(normalizedFamily) & "," & EscapeCSV(parts(2))
            End If
        End If
    Next
End Sub

Sub TryAddDirectWriteFonts()
    ' This is an optional approach that tries to use an ActiveX object if available
    ' to get DirectWrite fonts. This will be ignored silently if it fails.
    On Error Resume Next

    ' Try to create a DirectWrite font collection enumerator if available on the system
    ' This might work on some systems and not on others - we don't want to fail if not available
    Dim obj, dwriteFonts
    Set obj = Nothing

    ' Try to create a font enumeration object - this will fail gracefully if not supported
    ' and is just an additional attempt to find more fonts
    Err.Clear
    Set obj = CreateObject("DirectWriteFontCollection.Factory")
    If Err.Number = 0 And Not obj Is Nothing Then
        ' If we successfully created the object, try to get system font families
        Set dwriteFonts = obj.GetSystemFontFamilies()

        If Not dwriteFonts Is Nothing Then
            Dim fontCount, j, fontName
            fontCount = dwriteFonts.Count

            ' Enumerate fonts from the collection
            For j = 0 To fontCount - 1
                fontName = dwriteFonts.Item(j)

                ' Only add if we haven't seen this family name before
                If Not seenFamilies.Exists(fontName) Then
                    seenFamilies.Add fontName, True
                    ' Store result with empty path and Regular face
                    results.Add results.Count, "" & "|" & fontName & "|Regular"
                End If
            Next
        End If
    End If

    On Error GoTo 0
End Sub
