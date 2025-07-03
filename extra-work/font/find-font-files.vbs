' VBScript to list all available fonts and output as CSV
' Usage examples:
'   cscript find-font-files.vbs
'   cscript find-font-files.vbs > fonts.csv

Option Explicit

Dim fso, shell, objShell
Dim fontFolders, fileExtensions
Dim results, seenFiles
Dim folder, file, files
Dim family, face, fullPath
Dim i, j, k

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
Set objShell = CreateObject("Shell.Application")

' Initialize arrays
Set fontFolders = CreateObject("Scripting.Dictionary")
Set fileExtensions = CreateObject("Scripting.Dictionary")
Set results = CreateObject("Scripting.Dictionary")
Set seenFiles = CreateObject("Scripting.Dictionary")

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

' Output CSV
Call OutputCSV()

' Clean up
Set fso = Nothing
Set shell = Nothing
Set objShell = Nothing
Set fontFolders = Nothing
Set fileExtensions = Nothing
Set results = Nothing
Set seenFiles = Nothing

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
                            
                            family = GetFamilyFromFilename(fileName)
                            face = GetFaceFromFilename(fileName)
                            
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

Function GetFamilyFromFilename(fileName)
    Dim baseName, normalizedName, familyName, lowerName
    
    ' Remove file extension
    baseName = fso.GetBaseName(fileName)
    lowerName = LCase(baseName)
    
    ' Convert hyphens and underscores to spaces
    normalizedName = Replace(Replace(baseName, "-", " "), "_", " ")
    
    ' Remove version numbers in brackets and dates
    normalizedName = RegexReplace(normalizedName, "\s*\[Version\s+[\d\.]+\]\s*\d*", "")
    
    ' For short names like "arialbd", "timesi", extract family differently
    If Len(baseName) <= 10 Then
        If Right(lowerName, 2) = "bd" Then
            familyName = Left(baseName, Len(baseName) - 2)
        ElseIf Right(lowerName, 2) = "bi" Then
            familyName = Left(baseName, Len(baseName) - 2)
        ElseIf Right(lowerName, 1) = "i" And lowerName <> "i" Then
            familyName = Left(baseName, Len(baseName) - 1)
        Else
            familyName = normalizedName
        End If
    Else
        ' Remove common style suffixes for longer names
        familyName = RegexReplace(normalizedName, "\s+(bold|italic|light|regular|medium|thin|black|condensed|expanded|oblique)(\s|$)", "")
    End If
    
    ' Clean up spaces
    familyName = Trim(familyName)
    familyName = RegexReplace(familyName, "\s+", " ")
    
    If Len(familyName) = 0 Then
        GetFamilyFromFilename = normalizedName
    Else
        GetFamilyFromFilename = familyName
    End If
End Function

Function GetFaceFromFilename(fileName)
    Dim baseName, lowerName
    baseName = fso.GetBaseName(fileName)
    lowerName = LCase(baseName)
    
    ' Handle short font names like arialbd, timesi, etc.
    If Len(baseName) <= 10 Then
        If Right(lowerName, 2) = "bd" Then
            GetFaceFromFilename = "Bold"
        ElseIf Right(lowerName, 2) = "bi" Then
            GetFaceFromFilename = "Bold Italic"
        ElseIf Right(lowerName, 1) = "i" And lowerName <> "i" Then
            GetFaceFromFilename = "Italic"
        Else
            GetFaceFromFilename = "Regular"
        End If
        Exit Function
    End If
    
    ' Check for combinations first (longer names)
    If (InStr(lowerName, "bold") > 0 And InStr(lowerName, "italic") > 0) Or _
       (InStr(lowerName, "bd") > 0 And InStr(lowerName, "i") > 0) Or _
       InStr(lowerName, "bi") > 0 Or InStr(lowerName, "ib") > 0 Then
        GetFaceFromFilename = "Bold Italic"
    ElseIf (InStr(lowerName, "light") > 0 And InStr(lowerName, "italic") > 0) Or _
           (InStr(lowerName, "lt") > 0 And InStr(lowerName, "i") > 0) Then
        GetFaceFromFilename = "Light Italic"
    ElseIf InStr(lowerName, "bold") > 0 Or InStr(lowerName, "bd") > 0 Then
        GetFaceFromFilename = "Bold"
    ElseIf InStr(lowerName, "italic") > 0 Or InStr(lowerName, "it") > 0 Then
        GetFaceFromFilename = "Italic"
    ElseIf InStr(lowerName, "light") > 0 And Not (InStr(lowerName, "freehand") > 0 Or InStr(lowerName, "highlight") > 0) Then
        GetFaceFromFilename = "Light"
    ElseIf InStr(lowerName, "thin") > 0 Then
        GetFaceFromFilename = "Thin"
    ElseIf InStr(lowerName, "medium") > 0 Then
        GetFaceFromFilename = "Medium"
    ElseIf InStr(lowerName, "black") > 0 Then
        GetFaceFromFilename = "Black"
    ElseIf InStr(lowerName, "condensed") > 0 Then
        GetFaceFromFilename = "Condensed"
    ElseIf InStr(lowerName, "expanded") > 0 Then
        GetFaceFromFilename = "Expanded"
    Else
        GetFaceFromFilename = "Regular"
    End If
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
    
    ' Output header
    WScript.Echo "FullPath,Family,Face"
    
    ' Output each font
    resultKeys = results.Keys
    For i = 0 To UBound(resultKeys)
        fontData = results(resultKeys(i))
        parts = Split(fontData, "|")
        
        If UBound(parts) >= 2 Then
            WScript.Echo EscapeCSV(parts(0)) & "," & EscapeCSV(parts(1)) & "," & EscapeCSV(parts(2))
        End If
    Next
End Sub
