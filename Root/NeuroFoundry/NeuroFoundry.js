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

function ThrowAway()
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

function Prev()
{
    DoFullPagePost({ "cmd": "Prev" });
}

function Next()
{
    DoFullPagePost({ "cmd": "Next" });
}

function LanguageChanged()
{
    DoFullPagePost(
        {
            "cmd": "SelectLanguage",
            "language": document.getElementById("Language").value
        });
}

function StartMethodChanged()
{
    FormVisibility("UploadWord");
    FormVisibility("SuggestWithAi");
    FormVisibility("Manually");
}

function FormVisibility(Name)
{
    var Input = document.getElementById(Name);
    var Form = document.getElementById(Name + "Form");

    Form.setAttribute("style", StyleFromChecked(Input.checked));
}

function StyleFromChecked(Checked)
{
    return Checked ? "display:block" : "display:none";
}

function CreateManually()
{
    DoFullPagePost(
        {
            "cmd": "CreateManually",
            "title": document.getElementById("DocumentTitle").value
        });
}

function StartAICreationProcess()
{
    DoFullPagePost(
        {
            "cmd": "SuggestWithAi",
            "type": document.getElementById("DocumentType").value,
            "scope": document.getElementById("DocumentScope").value,
            "roles": document.getElementById("DocumentRoles").value,
            "jurisdiction": document.getElementById("DocumentJurisdiction").value,
            "references": document.getElementById("DocumentReferences").value,
            "tabId": TabID
        });
}

function AddMarkdown(Data)
{
    var Control = document.getElementById("ContractMarkdown");
    var s = Control.value;
    var i = s.indexOf(Data.Placeholder);

    if (i < 0)
        s += "\r\n\r\n" + Data.Markdown;
    else
        s = s.substring(0, i) + Data.Markdown + "\r\n\r\n" + s.substring(i + Data.Placeholder.length);

    Control.value = s;
}

var HeaderNr = 0;

function RecommendGenericTitle(Data)
{
    HeaderNr = 0;
    var Markdown = Data.Title + "\r\n" + '='.repeat(Data.Title.length + 3) + "\r\n\r\n⌛";
    AddMarkdown({
        "Markdown": Markdown,
        "Placeholder": "⌛"
    });
}

function RecommendHeader(Data)
{
    var Markdown = Data.Header + "\r\n" + '-'.repeat(Data.Header.length + 3) + "\r\n\r\n⚙" +
        (++HeaderNr).toString() + "\r\n\r\n⌛";
    AddMarkdown({
        "Markdown": Markdown,
        "Placeholder": "⌛"
    });
}

function RecommendSectionBody(Data)
{
    AddMarkdown({
        "Markdown": Data.Markdown,
        "Placeholder": "⚙" + Data.headerNr.toString()
    });
}

function NoMoreHeaders(Data)
{
    AddMarkdown({
        "Markdown": "",
        "Placeholder": "⌛"
    });
}

function DocumentComplete(Data)
{
    document.getElementById("ContractMarkdown").removeAttribute("readonly");

    var Span = document.getElementById("PleaseWaitWhileGenerating");
    Span.innerHTML = "Edit the text of the document, using <a href=\"ContractMarkdown.md\" target=\"_blank\">Markdown</a>";
}