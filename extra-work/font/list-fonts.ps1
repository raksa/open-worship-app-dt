# powershell.exe .\extra-work\font\list-fonts.ps1 | code -
chcp 65001 | Out-Null;
Add-Type -AssemblyName PresentationCore;
$families = [Windows.Media.Fonts]::SystemFontFamilies;
foreach ($family in $families) {
    $name = '';
    if (
        !$family.FamilyNames.TryGetValue([Windows.Markup.XmlLanguage]::GetLanguage('zh-cn'), [ref]$name)
    ) {
        $name = $family.FamilyNames[[Windows.Markup.XmlLanguage]::GetLanguage('en-us')] 
    }
    Write-Output $name;
}
