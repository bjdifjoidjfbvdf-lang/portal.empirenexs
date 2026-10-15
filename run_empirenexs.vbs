Set WshShell = CreateObject("WScript.Shell")
strDir = "c:\Users\Office\Documents\EmpireNexs Management System"
WshShell.CurrentDirectory = strDir

' Check if port 3050 is already listening
Set oExec = WshShell.Exec("cmd.exe /c netstat -ano | findstr :3050 | findstr LISTENING")
strOut = oExec.StdOut.ReadAll()

If InStr(strOut, "LISTENING") > 0 Then
    ' Already running, just open browser
    WshShell.Run "cmd.exe /c start http://localhost:3050", 0, False
    WshShell.Run "cmd.exe /c start chrome http://localhost:3050 2>nul", 0, False
Else
    ' Start server completely hidden in the background
    WshShell.Run "cmd.exe /c npm.cmd run dev", 0, False
    WScript.Sleep 4500
    WshShell.Run "cmd.exe /c start http://localhost:3050", 0, False
    WshShell.Run "cmd.exe /c start chrome http://localhost:3050 2>nul", 0, False
End If
