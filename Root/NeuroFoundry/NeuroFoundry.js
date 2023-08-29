function UploadDocument()
{
    var FileInput = document.getElementById("WordFile");
    var File = FileInput.files[0];
    var UploadForm = document.getElementById("UploadForm");

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (xhttp.readyState === 4)
        {
            if (xhttp.status === 200)
                SetDynamicHtml(document.body, xhttp.responseText);
            else
            {
                UploadForm.setAttribute("style", "display:inline");
                ShowError(xhttp);
            }
        }
    };

    UploadForm.setAttribute("style", "display:none");

    var H2 = document.createElement("H2");
    H2.innerText = "Please wait while loading and converting document...";
    UploadForm.parentNode.insertBefore(H2, UploadForm.nextSibling);

    xhttp.open("POST", "/NeuroFoundry/Index.md", true);
    xhttp.setRequestHeader("Content-Type", File.type);
    xhttp.setRequestHeader("X-FileName", File.name);
    xhttp.send(File);
}

function DoFullPagePost(Request)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (xhttp.readyState === 4)
        {
            if (xhttp.status === 200)
                SetDynamicHtml(document.body, xhttp.responseText);
            else
                ShowError(xhttp);
        }
    };

    xhttp.open("POST", "/NeuroFoundry/Index.md", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(Request));
}

function UploadNewDocument()
{
    DoFullPagePost({ "cmd": "NewDocument" });
}

function EditText()
{
    DoFullPagePost({ "cmd": "EditDocument" });
}

function LoadContractMarkdown()
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (xhttp.readyState === 4)
        {
            if (xhttp.status === 200)
                document.getElementById("ContractMarkdown").value = xhttp.responseText;
            else
                ShowError(xhttp);
        }
    };

    xhttp.open("POST", "/NeuroFoundry/GetContractMarkdown.ws", true);
    xhttp.setRequestHeader("Accept", "text/plain");
    xhttp.send();
}

function UpdateText()
{
    DoFullPagePost(
        {
            "cmd": "DocumentEdited",
            "markdown": document.getElementById("ContractMarkdown").value
        });
}

function CancelEdit()
{
    DoFullPagePost({ "cmd": "CancelEdit" });
}

function Next()
{
}
