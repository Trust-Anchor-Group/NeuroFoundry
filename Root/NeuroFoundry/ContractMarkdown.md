Title: Markdown for Smart Contracts
Description: This page describes the simplified Markdown syntax available to Smart Contracts.
Date: 2023-08-29
Author: Peter Waher
Master: Master.md
FirstName: John
LastName: Doe

=====================================================================================

Markdown for Smart Contracts
================================

Human-readable text in Smart Contracts can be edited using a simlified form of *Markdown*. Markdown is a
text-based format that is easy to edit in any text editor, while at the same time allowing the user to
provide basic formatting instructions. This document lists these simple formatting instructions available
in Smart Contracts.

![Table of Contents](ToC)

Simple text
--------------

To write text using *Markdown*, you simply write the text as-is. *Markdown* is a text-based format, that
can be edited in simple text editors, like Notepad in Windows, or similar applications.

Example:

	This text is shown as-is when displayed to users.

Becomes:

>	This text is shown as-is when displayed to users.

Paragraphs
-------------

Text on multiple non-empty rows form a single *paragraph* in Markdown. You can insert line-breaks in your
text, but as long as you don't have an empty row, all rows are concatenated into one paragraph. Simply put,
one line-break is treated just as if it was a space. This makes it possible to edit the text in any text editor,
regardless of window or screen size, and display the paragraph as flowing text on any other display, regardless
of screen size.

Example:

	This text consists of multiple lines that are concatenated
	into one paragraph. This makes it easier to write longer
	texts in a simple text editor, without having to worry about 
	screen width when displaying the text to the user.

	If you insert an empty row in your text, it signals the end
	of the paragraph, and the beginning of the next paragraph.

Becomes:

>	This text consists of multiple lines that are concatenated
>	into one paragraph. This makes it easier to write longer
>	texts in a simple text editor, without having to worry about 
>	screen width when displaying the text to the user.
>
>	If you insert an empty row in your text, it signals the end
>	of the paragraph, and the beginning of the next paragraph.

Section Headers
------------------

When writing chapters in a book, or dividing a longer text in a contract into sections, each with a separate *header*
and *body*. The *header* can also be at a given *level* in the disposition of the document. Top-level headers, are
considered level 1, sub-headers to level 1 are level 2, sub-headers to level 2 are level 3, and so on. A header in
*Markdown* consists of a single row of text with a number of `#` characters in the beginning, signifying the level the
header belongs to, followed by a space character. After the header, an empty row is inserted, following by the paragraphs 
to include in the body of the section. The body itself can also include sub-headers, with their corresponding bodies.

Example:

	### Third-level header

	This text belongs to the body of the third-level header.
	(To make text work within the scope of this description,
	headers begin on level 3 in this example, as the headers
	of the text use levels one and two.)

	#### Fourth-level header

	This text is part of the body of the second header.

	#### Another fourth-level header

	This is some more text.

	### Second third-level header

	Some text, this time, on level 3 again.

Becomes:

>	### Third-level header
>
>	This text belongs to the body of the third-level header.
>	(To make text work within the scope of this description,
>	headers begin on level 3 in this example, as the headers
>	of the text use levels one and two.)
>
>	#### Fourth-level header
>
>	This text is part of the body of the second header.
>
>	#### Another fourth-level header
>
>	This is some more text.
>
>	### Second third-level header
>
>	Some text, this time, on level 3 again.

Unordered lists
------------------

Unordered lists (or bullet-point lists) are simply list, whose items are prefixed by asterisks `*` (or bullets), followed
by a space or TAB character.

Example:

	*	Item 1
	*	Item 2
	*	Item 3
	*	...

Becomes:

>	*	Item 1
>	*	Item 2
>	*	Item 3
>	*	...

Ordered lists
----------------

Ordered lists (or numbered lists) are simply list, whose items are prefixed by a number, followed by a period `.` and
a space or TAB character.

Example:

	1.	Item 1
	2.	Item 2
	3.	Item 3
	4.	...

Becomes:

>	1.	Item 1
>	2.	Item 2
>	3.	Item 3
>	4.	...

Parameter References
-----------------------

When creating smart contracts, you have the option to create a set of parameters for the contract. This simplifies reuse
of the contract. It also protects the integrity of the contract, as you can refer to the parameter by name everywhere in the
text of the contract, and not have to worry you miss a place when changing the parameter value before signing the contract.

To reference a parameter in the contract text, you simply use the `[%` characters, following by the name of the parameter,
lastly followed by a `]` character.

Example:

	I, [%FirstName] [%LastName] hereby solemnly swear:
	[%FirstName] is my first name, [%LastName] is my
	last name, and [%FirstName] [%LastName] is the order
	I usually pronounce my names.

Becomes:

>	I, [%FirstName] [%LastName] hereby solemnly swear:
>	[%FirstName] is my first name, [%LastName] is my
>	last name, and [%FirstName] [%LastName] is the order
>	I usually pronounce my names.

Simple formatting
--------------------

Smart Contracts also support some simple text-formatting methods. The following table shows the basic syntaxes available
for formatting text:

| Formatting     | Syntax        | Example                                                  | Rendering                                              |
|:---------------|:-------------:|:---------------------------------------------------------|:-------------------------------------------------------|
| Bold           | `**` ... `**` | `Use **bold** text to make text stand out.`              | Use **bold** text to make text stand out.              |
| Italic         | `*` ... `*`   | `*Italic* text allows you to emphasize text.`            | *Italic* text allows you to emphasize text.            |
| Underline      | `_` ... `_`   | `This text contains _underlined_ text.`                  | This text contains _underlined_ text.                  |
| Strike-through | `~` ... `~`   | `This text contains text that is ~stricken through~.`    | This text contains text that is ~stricken through~.    |
| Super-script   | `^[` ... `]`  | `Footnotes require you to write superscript^[1] text.`   | Footnotes require you to write superscript^[1] text.   |
| Sub-script     | `[` ... `]`   | `Subscript text allows you to write CO[2] in contracts.` | Subscript text allows you to write CO[2] in contracts. |
