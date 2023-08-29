function UploadDocument()
{
    var FileInput = document.getElementById("WordFile");
    var File = FileInput.files[0];

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (xhttp.readyState === 4)
        {
            if (xhttp.status === 200)
                document.body.innerHTML = xhttp.responseText;
            else
                ShowError(xhttp);
        }
    };

    xhttp.open("POST", "/NeuroFoundry/Index.md", true);
    xhttp.setRequestHeader("Content-Type", File.type);
    xhttp.setRequestHeader("X-FileName", File.name);
    xhttp.send(File);
}
