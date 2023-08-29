Title: Neuro-Foundry
Description: Main page for the Neuro-Foundtry™ smart contract generation service.
Date: 2023-08-10
Author: Peter Waher
Master: Master.md
Cache-Control: max-age=0, no-cache, no-store
UserVariable: QuickLoginUser
Login: /NeuroFoundry/Login.md
BodyOnly: {{exists(Posted)}}

==================

TAG Neuro-Foundry^TM
=======================

Welcome to TAG Neuro-Foundry^TM. This service allows you to create smart contracts for use with 
[TAG ID](https://lab.tagroot.io/Community/Post/Getting_Started_with_the_Tag_ID_Application) App, 
or its variants.

{{
if !exists(NeuroFoundryState) then NeuroFoundryState:=
{
	"Step":0,
	"ContractMarkdown":"",
	"EditMode":false
};

if NeuroFoundryState.Step=0 then
(
	if exists(Posted) then
	(
		if Posted is DocumentFormat.OpenXml.Packaging.WordprocessingDocument then
			NeuroFoundryState.ContractMarkdown:=TAG.Content.Microsoft.WordUtilities.ExtractAsMarkdown(Posted);
	);

	]]
<fieldset>
<legend>
<span class="headerIndex">1</span>
<span class="headerText">Human-readable text</span>
</legend>[[;

	if empty(NeuroFoundryState.ContractMarkdown) then ]]
<p>
Upload a Word document (in `.docx` format) to start the creation of the smart contract:  
<input name="WordFile" id="WordFile" type="file" accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple="false"/>
</p>
<button type="button" class="posButton" onclick="UploadDocument()">Upload</button>[[
	else
	]]
<p>
Below is a preview of the uploaded document. Note that unsupported formatting has been removed from the document.  
<h2>Preview</h2>

((NeuroFoundryState.ContractMarkdown))

	[[;

	]]
</fieldset>[[
)

}}