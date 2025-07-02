' cscript.exe .\extra-work\font\fonts1.vbs | code -
const HKEY_LOCAL_MACHINE = &H80000002

 

strKeyPath = "SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts"

Set oReg=GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\default:StdRegProv")

 

wscript.echo "File Name" & vbTab & vbTab & "Font Family Name"

wscript.echo "---------------------------------------------------------------"

 

oReg.EnumValues HKEY_LOCAL_MACHINE, strKeyPath, arrValueNames

For each strValueName in arrValueNames

	oReg.GetStringValue HKEY_LOCAL_MACHINE,strKeyPath,strValueName,strValue

	wscript.echo strValue & vbTab & vbTab & strValueName

Next

 

set oReg = Nothing
