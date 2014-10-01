@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "./platypus-docs/plat-docs" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "./platypus-docs/plat-docs" %*
)
