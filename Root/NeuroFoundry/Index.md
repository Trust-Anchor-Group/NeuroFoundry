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
	"EditMode":false
};

if exists(Posted) then
(
	if Posted is DocumentFormat.OpenXml.Packaging.WordprocessingDocument then
	(
		Language:=null;
		Markdown:=MS.WordUtilities.ExtractAsMarkdown(Posted,Request.Header["X-FileName"],Language);

		SaveFile(Markdown,"C:\\Temp\\Markdown.md");

		NeuroFoundryState.Contract:=Create(Waher.Service.IoTBroker.Legal.Contracts.Contract);
		NeuroFoundryState.Contract.Provider:=Waher.Service.IoTBroker.XmppServerModule.Legal.MainDomain.Address;
		NeuroFoundryState.Contract.Account:=Before(QuickLoginUser?.Jid,"@");
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
		SmartContractXml:=Parsed.GenerateSmartContractXml();
	
		SmartContractXml:=Xml("<Root xmlns='urn:ieee:iot:leg:sc:1.0'>"+SmartContractXml+"</Root>");
		SmartContractText:=Waher.Service.IoTBroker.Legal.HumanReadable.HumanReadableText.Parse(SmartContractXml.DocumentElement);
		SmartContractText.Language:=Language;
		MarkdownOutput:=Create(Waher.Service.IoTBroker.Legal.HumanReadable.MarkdownOutput);
		SmartContractText.ToMarkdown(MarkdownOutput,NeuroFoundryState.Contract,2,0);
		Markdown:=MarkdownOutput.ToString();

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
	else if Posted matches {"cmd":"SelectLanguage","language":PLanguage} then
	(
		NeuroFoundryState.Language:=PLanguage;
	)
	else if Posted matches {"cmd":"Next"} then
	(
		NeuroFoundryState.Step++;
	)
	else if Posted matches {"cmd":"Prev"} then
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

		if empty(NeuroFoundryState.ContractMarkdown) then ]]
<p id="UploadForm">
Upload a Word document (in `.docx` format) to start the creation of the smart contract:  
<input name="WordFile" id="WordFile" name="WordFile" type="file" accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
       multiple="false" onchange="UploadDocument()"/>
</p>[[
		else if NeuroFoundryState.EditMode then ]]
<p id="EditForm">
Edit the text of the document, using <a href="ContractMarkdown.md" target="_blank">Markdown</a>:  
<textarea id="ContractMarkdown" name="ContractMarkdown"></textarea>

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