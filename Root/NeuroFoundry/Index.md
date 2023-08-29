Title: Neuro-Foundry
Description: Main page for the Neuro-Foundtry™ smart contract generation service.
Date: 2023-08-10
Author: Peter Waher
Master: Master.md
Cache-Control: max-age=0, no-cache, no-store
UserVariable: QuickLoginUser
Login: /NeuroFoundry/Login.md
BodyOnly: {{exists(Posted)}}
AllowScriptTag: true

==================

TAG Neuro-Foundry^TM
=======================

Welcome to TAG Neuro-Foundry^TM. This service allows you to create smart contracts for use with 
[TAG ID](https://lab.tagroot.io/Community/Post/Getting_Started_with_the_Tag_ID_Application) App, 
or its variants.

{{
MS:=TAG.Content.Microsoft;

if !exists(NeuroFoundryState) then NeuroFoundryState:=
{
	"Step":0,
	"ContractMarkdown":"",
	"Contract":null,
	"Language":null,
	"HeaderInfo":null,
	"EditMode":false
};

if NeuroFoundryState.Step=0 then
(
	if exists(Posted) then
	(
		if Posted is DocumentFormat.OpenXml.Packaging.WordprocessingDocument then
		(
			Language:=null;
			Markdown:=MS.WordUtilities.ExtractAsMarkdown(Posted,Language);

			NeuroFoundryState.Contract:=Create(Waher.Service.IoTBroker.Legal.Contracts.Contract);
			NeuroFoundryState.Contract.Provider:=Waher.Service.IoTBroker.XmppServerModule.Legal.MainDomain.Address;
			NeuroFoundryState.Contract.Account:=Before(QuickLoginUser.Jid,"@");
			NeuroFoundryState.Contract.Created:=NowUtc;
			NeuroFoundryState.Contract.PartsMode:=Waher.Service.IoTBroker.Legal.Contracts.ContractParts.Open;

			HeaderInfo:=null;
			if MS.ContractUtilities.ExtractParameters(Markdown,HeaderInfo) then
			(
				PT:=MS.ParameterType;

				foreach P in HeaderInfo do
				(
					T:=P.Value.Type;

					if T = PT.String then
					(
						1
					)
					else if T = PT.Boolean then
					(
						2
					)
					else if T = PT.StringWithOptions then
					(
						3
					)
					else if T = PT.ListOfOptions then
					(
						4
					)
					else if T = PT.Date then
					(
						5
					)
					else if T = PT.Time then
					(
						6
					)
					else if T = PT.Number then
					(
						7
					)
					else
					(
						8
					)
				)
			);

			NeuroFoundryState.ContractMarkdown:=Markdown;
			NeuroFoundryState.Language:=Language;
			NeuroFoundryState.HeaderInfo:=HeaderInfo;

			Parsed:=Waher.Content.Markdown.MarkdownDocument.CreateAsync(NeuroFoundryState.ContractMarkdown,[]);
			SmartContractXml:=Xml("<Root xmlns='urn:ieee:iot:leg:sc:1.0'>"+Parsed.GenerateSmartContractXml()+"</Root>");
			SmartContractText:=Waher.Service.IoTBroker.Legal.HumanReadable.HumanReadableText.Parse(SmartContractXml.DocumentElement);
			SmartContractText.Language:=Language;
			sb:=Create(System.Text.StringBuilder);
			SmartContractText.ToMarkdown(sb,NeuroFoundryState.Contract,2);
			Markdown:=sb.ToString();

			NeuroFoundryState.ContractMarkdown:=Markdown;
		)
		else if Posted matches {"cmd":"NewDocument"} then
		(
			NeuroFoundryState.ContractMarkdown:="";
			NeuroFoundryState.HeaderInfo:=null;
		)
		else if Posted matches {"cmd":"EditDocument"} then
		(
			NeuroFoundryState.EditMode:=true;
		)
		else if Posted matches {"cmd":"CancelEdit"} then
		(
			NeuroFoundryState.EditMode:=false;
		)
		else if Posted matches {"cmd":"DocumentEdited","markdown":PMarkdown} then
		(
			NeuroFoundryState.EditMode:=false;
			NeuroFoundryState.ContractMarkdown:=PMarkdown;
		)
		else
			BadRequest("Posted content did not match expected input.");
	);

	UserDomain:=After(QuickLoginUser.Jid,"@");
	if !empty(Waher.IoTGateway.Gateway.Domain) and !Waher.IoTGateway.Gateway.IsDomain(UserDomain,true) then
	(
		]]
## Your account is registered on another server

This service is only available on this domain for users with account on this server. To create a contract using this service 
on the server that hosts your account, follow this link:

[Neuro-Foundry^TM on ((UserDomain))](https://((UserDomain))/NeuroFoundry/Index.md)

If the link does not work, it might indicate that Neuro-Foundry^TM is not installed on the server. To remedy this, send a request
to install the service to their [Feedback page](https://((UserDomain))/Feedback.md).

[[
	)
	else
	(
		]]
<fieldset>
<legend>
<span class="headerIndex">1</span>
<span class="headerText">Human-readable text</span>
</legend>[[;

		if empty(NeuroFoundryState.ContractMarkdown) then ]]
<p id="UploadForm">
Upload a Word document (in `.docx` format) to start the creation of the smart contract:  
<input name="WordFile" id="WordFile" type="file" accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
       multiple="false" onchange="UploadDocument()"/>
</p>[[
		else if NeuroFoundryState.EditMode then ]]
<p id="EditForm">
Edit the text of the document, using <a href="ContractMarkdown.md" target="_blank">Markdown</a>:  
<textarea id="ContractMarkdown"></textarea>

<button type="button" class="posButton" onclick="UpdateText()">Update</button>
<button type="button" class="negButton" onclick="CancelEdit()">Cancel</button>

<script>LoadContractMarkdown()</script>
</p>[[
		else
		]]
<p>
Please review the preview of the uploaded document below. Note that unsupported formatting has been removed from the document.

* If you are unhappy with the text or want to upload another document, you can simply press the **Upload New Document** button.
* If you want to perform minor changes in the text, or correct some formatting errors, press the **Edit Text** button.
* When satisfied with the text, press the **Next** button. (You will be able to edit the text in following steps as well.)  

<button type="button" class="posButton" onclick="EditText()">Edit Text</button>
<button type="button" class="negButton" onclick="UploadNewDocument()">Upload New</button>
<button type="button" class="posButton" onclick="Next()">Next</button>

<h2>Preview</h2>

((NeuroFoundryState.ContractMarkdown))

[[;

		]]
</fieldset>[[
	)
)
}}