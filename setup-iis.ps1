# Save this as setup-iis.ps1
$sourceDir = 'C:\Windows\Temp\livealertsapi'
$destDir = 'C:\inetpub\wwwroot\livealertsapi'

# Create destination directory if it doesn't exist
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force
}

# Set permissions
$acl = Get-Acl $destDir
$rule1 = New-Object System.Security.AccessControl.FileSystemAccessRule('IIS_IUSRS', 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
$rule2 = New-Object System.Security.AccessControl.FileSystemAccessRule('IUSR', 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
$rule3 = New-Object System.Security.AccessControl.FileSystemAccessRule('NetworkService', 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
$rule4 = New-Object System.Security.AccessControl.FileSystemAccessRule('Everyone', 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')

$acl.AddAccessRule($rule1)
$acl.AddAccessRule($rule2)
$acl.AddAccessRule($rule3)
$acl.AddAccessRule($rule4)

Set-Acl -Path $destDir -AclObject $acl

# Copy files using robocopy
robocopy $sourceDir $destDir /E /IS /IT
