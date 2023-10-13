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

<fieldset>
{{
MS:=TAG.Content.Microsoft;

if !exists(QuickLoginUser) then QuickLoginUser:=null;

if !exists(NeuroFoundryState) then NeuroFoundryState:=
{
	"Step":0,
	"ContractMarkdown":"",
	"Contract":null,
	"Language":null,
	"HeaderInfo":null,
	"EditMode":false,
	"StartMode":"UploadWord",
	"Title":"",
	"Type":"",
	"Scope":"",
	"Roles":"",
	"Jurisdiction":"",
	"References":"",
	"Generating":false
};

if exists(Posted) then
(
	if Posted is DocumentFormat.OpenXml.Packaging.WordprocessingDocument then
	(
		Language:=null;
		Markdown:=MS.WordUtilities.ExtractAsMarkdown(Posted,Request.Header["X-FileName"],Language);

		NeuroFoundryState.Contract:=Create(Waher.Service.IoTBroker.Legal.Contracts.Contract);
		NeuroFoundryState.Contract.Provider:=Waher.Service.IoTBroker.XmppServerModule.Legal.MainDomain.Address;
		NeuroFoundryState.Contract.Account:=Before(QuickLoginUser?.Jid,"@");
		NeuroFoundryState.Contract.Created:=NowUtc;
		NeuroFoundryState.Contract.PartsMode:=Waher.Service.IoTBroker.Legal.Contracts.ContractParts.Open;
		NeuroFoundryState.StartMode:='UploadWord';

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
		SmartContractXml:=Parsed.GenerateSmartContractXml();
	
		SmartContractXml:=Xml("<Root xmlns='urn:ieee:iot:leg:sc:1.0'>"+SmartContractXml+"</Root>");
		SmartContractText:=Waher.Service.IoTBroker.Legal.HumanReadable.HumanReadableText.Parse(SmartContractXml.DocumentElement);
		SmartContractText.Language:=Language;
		MarkdownOutput:=Create(Waher.Service.IoTBroker.Legal.HumanReadable.MarkdownOutput);
		SmartContractText.ToMarkdown(MarkdownOutput,NeuroFoundryState.Contract,2,0);
		Markdown:=MarkdownOutput.ToString();

		NeuroFoundryState.ContractMarkdown:=Markdown;
		NeuroFoundryState.Generating:=false;
	)
	else if Posted matches {
		"cmd":"NewDocument"
	} then
	(
		NeuroFoundryState.ContractMarkdown:="";
		NeuroFoundryState.HeaderInfo:=null;
		if exists(NeuroFoundryState.Tasks) then 
		(
			Abort(NeuroFoundryState.Tasks);
			NeuroFoundryState.Tasks:=null;

			LogNotice("AI-generation of smart contract aborted.",
			{
				"Actor":QuickLoginUser.Jid,
				"EventId":"AiAborted"
			});
		)
	)
	else if Posted matches {
		"cmd":"CreateManually",
		"title":PTitle
	} then
	(
		NeuroFoundryState.ContractMarkdown:=MarkdownEncode(PTitle)+"\r\n" + 
			Create(System.String,"=",len(PTitle)+3)+"\r\n\r\n";
		NeuroFoundryState.HeaderInfo:=null;
		NeuroFoundryState.EditMode:=true;
		NeuroFoundryState.Title:=PTitle;
		NeuroFoundryState.StartMode:='Manually';
		NeuroFoundryState.Generating:=false;
	)
	else if Posted matches {
		"cmd":"SuggestWithAi",
		"type":PType,
		"scope":PScope,
		"roles":PRoles,
		"jurisdiction":PJurisdiction,
		"references":PReferences,
		"tabId": PTabID
	} then
	(
		LogNotice("Starting AI-generation of smart contract human-readable text.",
		{
			"Actor":QuickLoginUser.Jid,
			"Type":PType,
			"Scope":PScope,
			"Roles":PRoles,
			"Jurisdiction":PJurisdiction,
			"References":PReferences,
			"EventId":"AiStarted"
		});

		NeuroFoundryState.ContractMarkdown:="⌛";
		NeuroFoundryState.HeaderInfo:=null;
		NeuroFoundryState.EditMode:=true;
		NeuroFoundryState.Type:=PType;
		NeuroFoundryState.Scope:=PScope;
		NeuroFoundryState.Roles:=PRoles;
		NeuroFoundryState.Jurisdiction:=PJurisdiction;
		NeuroFoundryState.References:=PReferences;
		NeuroFoundryState.StartMode:='SuggestWithAi';
		NeuroFoundryState.Generating:=true;
		NeuroFoundryState.Title:=null;
		NeuroFoundryState.Headers:=[];
		NeuroFoundryState.MoreHeaders:=true;
		NeuroFoundryState.QueriesLeft:=1000;
		NeuroFoundryState.NrHeaders:=0;
		NeuroFoundryState.NrBodies:=0;
		NeuroFoundryState.StartTime:=Now;

		if exists(NeuroFoundryState.Tasks) then 
		(
			Abort(NeuroFoundryState.Tasks);

			LogNotice("AI-generation of smart contract aborted.",
			{
				"Actor":QuickLoginUser.Jid,
				"EventId":"AiAborted"
			})
		);

		NeuroFoundryState.Tasks:=[Background((
			AddMarkdown:=(Markdown,Placeholder)->
			(
				Markdown:=Markdown.Trim().Replace(":**","\\:**");
				s:=NeuroFoundryState.ContractMarkdown;
				i:=s.IndexOf(Placeholder);

				if (i < 0) then
					s += "\r\n\r\n" + Markdown
				else
				(
					s2:=s.Substring(i + len(Placeholder));
					if !empty(s2) then s2:="\r\n\r\n" + s2;
					s := s.Substring(0, i) + Markdown + s2;
				);

				NeuroFoundryState.ContractMarkdown:=s;
			);

			RecommendGenericTitle:=Data->
			(
				NeuroFoundryState.Title:=Data.Title;
				NeuroFoundryState.GenSectionNr:=1;
				NeuroFoundryState.NrHeaders:=0;
				NeuroFoundryState.NrBodies:=0;
				Markdown:=Data.Title + "\r\n" + 
					Create(System.String,'=',Data.Title.Length + 3) + "\r\n\r\n⌛";
				AddMarkdown(Markdown,"⌛");

				NeuroFoundryState.Tasks:=join(NeuroFoundryState.Tasks,
					Background(AskAi("Recommend the header of the first section of the document.",{},
						[
							ChatGptFunction("RecommendHeader", "Recommends a short generic and reusable header for a section of the document.",
								[
									ChatGptString("Header", "Short generic and reusable header of a section of the document.", true)
								])
						])));
			);

			RecommendHeader:=Data->
			(
				NeuroFoundryState.NrHeaders++;
				NeuroFoundryState.Headers:=join(NeuroFoundryState.Headers,Data.Header);
				HeaderNr:=NeuroFoundryState.GenSectionNr++;
				Markdown:=Data.Header + "\r\n" + 
					Create(System.String,'-',Data.Header.Length + 3) + "\r\n\r\n⚙" +
					Str(HeaderNr) + "\r\n\r\n⌛";
				AddMarkdown(Markdown,"⌛");

				NeuroFoundryState.Tasks:=join(NeuroFoundryState.Tasks,
					Background(AskAi("Recommend the header of the next section of the document, or determine that no more sections are necessary for a complete document according to requirements.",{},
						[
							ChatGptFunction("RecommendHeader", "Recommends a short generic and reusable header for a section of the document.",
								[
									ChatGptString("Header", "Short generic and reusable header of a section of the document.", true)
								]),
							ChatGptFunction("NoMoreHeaders", "Determines that no more sections are necessary for a complete document.",
								[])
						])),

					Background(AskAi("Recommend the body text of a given section of the document. The section is given by the 'sectionHeader' property. The body text should be formatted using Markdown, and returned via the function call. The body text does not need to repeat the header.",
						{
							"sectionHeader":Data.Header,
							"headerNr":HeaderNr
						},
						[
							ChatGptFunction("RecommendSectionBody", "Recommends the body text of a given section of the document.",
								[
									ChatGptString("Markdown", "Markdown of the body text of the specified section in the document being generated.", true)
								])
						])))
			);

			RecommendSectionBody:=Data->
			(
				NeuroFoundryState.NrBodies++;
				AddMarkdown(Data.Markdown,"⚙" + Str(Data.headerNr));

				if NeuroFoundryState.NrBodies=NeuroFoundryState.NrHeaders and !NeuroFoundryState.MoreHeaders then
				(
					NeuroFoundryState.Generating:=false;
					NeuroFoundryState.Tasks:=null;

					PushEvent(PTabID,"DocumentComplete","");

					LogNotice("AI-generation of smart contract human-readable text completed.",
					{
						"Actor":QuickLoginUser.Jid,
						"Type":NeuroFoundryState.Type,
						"Scope":NeuroFoundryState.Scope,
						"Roles":NeuroFoundryState.Roles,
						"Jurisdiction":NeuroFoundryState.Jurisdiction,
						"References":NeuroFoundryState.References,
						"ElapsedTime":Now.Subtract(NeuroFoundryState.StartTime).ToString(),
						"EventId":"AiCompleted"
					});
				)
			);

			NoMoreHeaders:=Data->
			(
				NeuroFoundryState.MoreHeaders:=false;
				AddMarkdown("","⌛");
			);

			AskAi(Instruction,Parameters,Functions):=
			(
				if (--NeuroFoundryState.QueriesLeft>=0) then
				(
					Request:=
					{
						"type":NeuroFoundryState.Type,
						"scope":NeuroFoundryState.Scope,
						"roles":NeuroFoundryState.Roles,
						"jurisdiction":NeuroFoundryState.Jurisdiction,
						"references":NeuroFoundryState.References,
						"title":NeuroFoundryState.Title,
						"headers":NeuroFoundryState.Headers
					};

					foreach P in Parameters do Request[P.Key]:=P.Value;

					R:=ChatGpt(
						"You help legal professionals generate texts for legal documents. "+
						"During the generation of the document, multiple calls will be made. "+
						"You take JSON as input that will contain what is known. You call functions "+
						"to return recommendations. Input properties are as follows: 'type' defines "+
						"the type of document that is to be generated, 'scope' contains a description "+
						"of the scope of the document, 'roles' describes the roles included in the "+
						"contract, 'jurisdiction' defines the legal jurisdiction, "+
						"'references' contains any references that should be taken into account, "+
						"'title', if defined, contains the title of the document, and 'headers' "+
						"contain the headers that already have been generated. " + Instruction,
						QuickLoginUser.Jid, JSON.Encode(Request, false), Functions, false, false);

					if empty(R.Content) then
					(
						foreach P in Parameters do R.Function.Arguments[P.Key]:=P.Value;
					
						PushEvent(PTabID,R.Function.Name,R.Function.Arguments);
						eval(R.Function.Name)(R.Function.Arguments)
					)
					else
					(
						PushEvent(PTabID,"AddMarkdown",
						{
							"Markdown":R.Content,
							"Placeholder":"⌛"
						});
						AddMarkdown(R.Content,"⌛")
					)
				)
			);

			AskAi("Recommend document title.",{},
				[
					ChatGptFunction("RecommendGenericTitle", "Recommends a short generic and reusable title of the legal document.",
						[
							ChatGptString("Title", "Short generic and reusable title to display at the top of the document.", true)
						])
				]);
		))];
	)
	else if Posted matches {
		"cmd":"EditDocument"
	} then
	(
		NeuroFoundryState.EditMode:=true;
		NeuroFoundryState.Generating:=false;
	)
	else if Posted matches {
		"cmd":"CancelEdit"
	} then
	(
		NeuroFoundryState.EditMode:=false;
		if exists(NeuroFoundryState.Tasks) then 
		(
			Abort(NeuroFoundryState.Tasks);
			NeuroFoundryState.Tasks:=null;

			LogNotice("AI-generation of smart contract aborted.",
			{
				"Actor":QuickLoginUser.Jid,
				"EventId":"AiAborted"
			});
		)
	)
	else if Posted matches {
		"cmd":"DocumentEdited",
		"markdown":PMarkdown
	} then
	(
		NeuroFoundryState.EditMode:=false;
		NeuroFoundryState.ContractMarkdown:=PMarkdown;

		if exists(NeuroFoundryState.Tasks) then 
		(
			Abort(NeuroFoundryState.Tasks);
			NeuroFoundryState.Tasks:=null;

			LogNotice("AI-generation of smart contract aborted.",
			{
				"Actor":QuickLoginUser.Jid,
				"EventId":"AiAborted"
			});
		)
	)
	else if Posted matches {
		"cmd":"SelectLanguage",
		"language":PLanguage
	} then
	(
		NeuroFoundryState.Language:=PLanguage;
	)
	else if Posted matches {
		"cmd":"Next"
	} then
	(
		NeuroFoundryState.Step++;
	)
	else if Posted matches {
		"cmd":"Prev"
	} then
	(
		NeuroFoundryState.Step--;
	)
	else
		BadRequest("Posted content did not match expected input.");
);






if NeuroFoundryState.Step=0 then
(
	UserDomain:=After(QuickLoginUser?.Jid,"@");
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
		]]<legend>
<span class="headerIndex">1</span>
<span class="headerText">Human-readable text</span>
</legend>[[;

		if empty(NeuroFoundryState.ContractMarkdown) then 
		(
			]]
<form id="UploadForm">

The first step in creating a *smart contract* is to generate the human-readable text that
human users can read. You can either:

<p style="margin-top:1.5em">
<input type="radio" id="UploadWord" name="StartMethod" value="MsWord" ((NeuroFoundryState.StartMode='UploadWord' ? 'checked' : '' ??? '')) onclick="StartMethodChanged()">
<label for="UploadWord">Upload a **Microsoft Word** document with the text already written,</label>
</p>

[[;

			if ChatGptConfigured() then ]]
<p>
<input type="radio" id="SuggestWithAi" name="StartMethod" value="AI" ((NeuroFoundryState.StartMode='SuggestWithAi' ? 'checked' : '' ??? '')) onclick="StartMethodChanged()">
<label for="SuggestWithAi">Start from a suggestion created by **Artificial Intelligence**,</label>
</p>

[[;

			]]
<p>
<input type="radio" id="Manually" name="StartMethod" value="Manually" ((NeuroFoundryState.StartMode='Manually' ? 'checked' : '' ??? '')) onclick="StartMethodChanged()">
<label for="Manually">Enter the text **Manually** here on the page.</label>  
</p>

<fieldset id="UploadWordForm" style="display:((NeuroFoundryState.StartMode='UploadWord' ? 'block' : 'none' ??? 'none'))">
<legend><span class="headerText">Upload Word Document</span></legend>

<p>
<label for="WordFile">If you want to upload a **Word document** (in `.docx` format), select it here below:</label>  
<input name="WordFile" id="WordFile" type="file" accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
       multiple="false" onchange="UploadDocument()"/>
</p>
</fieldset>
[[;

			if ChatGptConfigured() then ]]

<fieldset id="SuggestWithAiForm" style="display:((NeuroFoundryState.StartMode='SuggestWithAi' ? 'block' : 'none' ??? 'none'))">
<legend><span class="headerText">Let *Artifical Intelligence* suggest a text</span></legend>

<p>
<label for="DocumentType">To create a document using *Artificial Intelligence*, indicate what **type of document** you want to create:</label>  
<input name="DocumentType" id="DocumentType" type="text" value="((NeuroFoundryState?.Type ??? ''))" required/>
</p>

<p>
<label for="DocumentScope">Provide some information about the **scope** or **purpose** of the document:</label>  
<input name="DocumentScope" id="DocumentScope" type="text" value="((NeuroFoundryState?.Scope ??? ''))" required/>
</p>

<p>
<label for="DocumentRoles">List the **roles** of the parties included in the agreement:</label>  
<input name="DocumentRoles" id="DocumentRoles" type="text" value="((NeuroFoundryState?.Roles ??? ''))" required/>
</p>

<p>
<label for="DocumentJurisdiction">In what **jurisdiction** should the document operate:</label>  
<input name="DocumentJurisdiction" id="DocumentJurisdiction" type="text" value="((NeuroFoundryState?.Jurisdiction ??? ''))" required/>
</p>

<p>
<label for="DocumentReferences">Provide any optional **references** you wish to take into consideration:</label>  
<input name="DocumentReferences" id="DocumentReferences" type="text" value="((NeuroFoundryState?.References ??? ''))"/>
</p>

<button type="button" onclick="StartAICreationProcess()">Start Creation Process</button>
</fieldset>

[[;
			]]

<fieldset id="ManuallyForm" style="display:((NeuroFoundryState.StartMode='Manually' ? 'block' : 'none' ??? 'none'))">
<legend><span class="headerText">Enter text *Manually*</span></legend>

<p>
<label for="DocumentTitle">To create a document *Manually*, enter the Title of the document:</label>  
<input name="DocumentTitle" id="DocumentTitle" type="text" value="((NeuroFoundryState?.Title ??? ''))"/>
</p>

<button type="button" onclick="CreateManually()">Create Manually</button>
</fieldset>

</form>[[







		)
		else if NeuroFoundryState.EditMode then  
		(
			]]
<p id="EditForm">[[;

			if (NeuroFoundryState.Generating???false) then ]]
<span id="PleaseWaitWhileGenerating">Please wait while the document is being generated:</span>  
<textarea id="ContractMarkdown" name="ContractMarkdown" readonly></textarea>
[[
			else ]]
Edit the text of the document, using <a href="ContractMarkdown.md" target="_blank">Markdown</a>:  
<textarea id="ContractMarkdown" name="ContractMarkdown" autofocus></textarea>
[[;
			]]
<button type="button" class="posButton" onclick="UpdateText()">Update</button>
<button type="button" class="negButton" onclick="CancelEdit()">Cancel</button>

<script>LoadContractMarkdown()</script>
</p>[[
		)
		else
			]]
<p>
Please review the preview of the uploaded document below. Note that unsupported formatting has been removed from the document.

* If you are unhappy with the text or want to upload another document, you can simply press the **Throw Away** button, to restart the process.
* If you want to perform minor changes in the text, or correct some formatting errors, press the **Edit Text** button.
* When satisfied with the text, press the **Next** button. (You will be able to edit the text in following steps as well.)  

<button type="button" class="posButton" onclick="EditText()">Edit Text</button>
<button type="button" class="negButton" onclick="ThrowAway()">Throw Away</button>
<button type="button" class="posButton" onclick="Next()">Next</button>

<fieldset>
<legend><span class="headerText">Preview</span></legend>

((NeuroFoundryState.ContractMarkdown))

</fieldset>

[[;
	)
)
else if NeuroFoundryState.Step=1 then
(
	]]<legend>
<span class="headerIndex">2</span>
<span class="headerText">Language</span>
</legend>

Each smart contract must specify the *language* its human-readable text is written in. Make sure the specified language
is correct, and then press the **Next** button to continue.

[[;

	if empty(NeuroFoundryState.Language) then
		]]Please select the language of the text in the document.  
[[
	else
		]]The language of the smart contract:  
[[;

	]]<select id="Language" name="Language" onchange="LanguageChanged()">
<option value=''>Please select a language</option>[[;

	M:=[["Abkhaz", "ab"],
		["Afar", "aa"],
		["Afrikaans", "af"],
		["Akan", "ak"],
		["Albanian", "sq"],
		["Amharic", "am"],
		["Arabic", "ar"],
		["Aragonese", "an"],
		["Armenian", "hy"],
		["Assamese", "as"],
		["Avaric", "av"],
		["Aymara", "ay"],
		["Azerbaijani", "az"],
		["Bambara", "bm"],
		["Bashkir", "ba"],
		["Basque", "eu"],
		["Belarusian", "be"],
		["Bengali", "bn"],
		["Bihari", "bh"],
		["Bislama", "bi"],
		["Bosnian", "bs"],
		["Breton", "br"],
		["Bulgarian", "bg"],
		["Burmese", "my"],
		["Catalan", "ca"],
		["Chamorro", "ch"],
		["Chechen", "ce"],
		["Chichewa", "ny"],
		["Chinese", "zh"],
		["Chuvash", "cv"],
		["Cornish", "kw"],
		["Corsican", "co"],
		["Cree", "cr"],
		["Croatian", "hr"],
		["Czech", "cs"],
		["Danish", "da"],
		["Divehi", "dv"],
		["Dutch", "nl"],
		["Dzongkha", "dz"],
		["English", "en"],
		["Estonian", "et"],
		["Ewe", "ee"],
		["Faroese", "fo"],
		["Fijian", "fj"],
		["Finnish", "fi"],
		["French", "fr"],
		["Fula", "ff"],
		["Galician", "gl"],
		["Ganda", "lg"],
		["Georgian", "ka"],
		["German", "de"],
		["Greek", "el"],
		["Guaraní", "gn"],
		["Gujarati", "gu"],
		["Haitian", "ht"],
		["Hausa", "ha"],
		["Hebrew", "he"],
		["Herero", "hz"],
		["Hindi", "hi"],
		["Hiri Motu", "ho"],
		["Hungarian", "hu"],
		["Icelandic", "is"],
		["Ido", "io"],
		["Igbo", "ig"],
		["Indonesian", "id"],
		["Inuktitut", "iu"],
		["Inupiaq", "ik"],
		["Irish", "ga"],
		["Italian", "it"],
		["Japanese", "ja"],
		["Javanese", "jv"],
		["Kalaallisut", "kl"],
		["Kannada", "kn"],
		["Kanuri", "kr"],
		["Kashmiri", "ks"],
		["Kazakh", "kk"],
		["Khmer", "km"],
		["Kikuyu", "ki"],
		["Kinyarwanda", "rw"],
		["Kirundi", "rn"],
		["Komi", "kv"],
		["Kongo", "kg"],
		["Korean", "ko"],
		["Kurdish", "ku"],
		["Kwanyama", "kj"],
		["Kyrgyz", "ky"],
		["Lao", "lo"],
		["Latvian", "lv"],
		["Limburgish", "li"],
		["Lingala", "ln"],
		["Lithuanian", "lt"],
		["Luba-Katanga", "lu"],
		["Luxembourgish", "lb"],
		["Macedonian", "mk"],
		["Malagasy", "mg"],
		["Malay", "ms"],
		["Malayalam", "ml"],
		["Maltese", "mt"],
		["Manx", "gv"],
		["Māori", "mi"],
		["Marathi", "mr"],
		["Marshallese", "mh"],
		["Mongolian", "mn"],
		["Nauru", "na"],
		["Navajo", "nv"],
		["Ndonga", "ng"],
		["Nepali", "ne"],
		["North Ndebele", "nd"],
		["Northern Sami", "se"],
		["Norwegian Bokmål", "nb"],
		["Norwegian Nynorsk", "nn"],
		["Norwegian", "no"],
		["Nuosu", "ii"],
		["Occitan", "oc"],
		["Ojibwe", "oj"],
		["Oriya", "or"],
		["Oromo", "om"],
		["Ossetian", "os"],
		["Panjabi", "pa"],
		["Pashto", "ps"],
		["Persian", "fa"],
		["Polish", "pl"],
		["Portuguese", "pt"],
		["Quechua", "qu"],
		["Romanian", "ro"],
		["Romansh", "rm"],
		["Russian", "ru"],
		["Samoan", "sm"],
		["Sango", "sg"],
		["Sanskrit", "sa"],
		["Sardinian", "sc"],
		["Scottish Gaelic", "gd"],
		["Serbian", "sr"],
		["Shona", "sn"],
		["Sindhi", "sd"],
		["Sinhala", "si"],
		["Slovak", "sk"],
		["Slovenian", "sl"],
		["Somali", "so"],
		["South Ndebele", "nr"],
		["Southern Sotho", "st"],
		["Spanish", "es"],
		["Sundanese", "su"],
		["Swahili", "sw"],
		["Swati", "ss"],
		["Swedish", "sv"],
		["Tagalog", "tl"],
		["Tahitian", "ty"],
		["Tajik", "tg"],
		["Tamil", "ta"],
		["Tatar", "tt"],
		["Telugu", "te"],
		["Thai", "th"],
		["Tibetan", "bo"],
		["Tigrinya", "ti"],
		["Tonga", "to"],
		["Tsonga", "ts"],
		["Tswana", "tn"],
		["Turkish", "tr"],
		["Turkmen", "tk"],
		["Twi", "tw"],
		["Uighur", "ug"],
		["Ukrainian", "uk"],
		["Urdu", "ur"],
		["Uzbek", "uz"],
		["Venda", "ve"],
		["Vietnamese", "vi"],
		["Walloon", "wa"],
		["Welsh", "cy"],
		["Western Frisian", "fy"],
		["Wolof", "wo"],
		["Xhosa", "xh"],
		["Yiddish", "yi"],
		["Yoruba", "yo"],
		["Zhuang", "za"],
		["Zulu", "zu"]];

	ContractLangauge:=NeuroFoundryState.Language;
	HasSelected:=false;
	foreach Language in M do
		]]<option value='((Language[1]))'((ContractLangauge=Language[1] ? (HasSelected:=true;" selected") : ""))>((Language[0]))</option>
[[;

	]]</select>
[[;

	if HasSelected then ]]
<button type="button" class="posButton" onclick="Prev()">Previous</button>
<button type="button" class="posButton" onclick="Next()">Next</button>
[[
)
else
(
	]]<legend>
<span class="headerIndex">3</span>
<span class="headerText">Roles</span>
</legend>

<button type="button" class="posButton" onclick="Prev()">Previous</button>
[[
)
}}

</fieldset>