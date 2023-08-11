Title: Neuro-Foundry Logout
Description: This page logs you out from Neuro-Foundry.
Date: 2023-08-10
Author: Peter Waher
Master: Master.md

=====================================================================================

Neuro-Foundry Logout
=======================

{{If exists(QuickLoginUser) then
(
	Destroy(QuickLoginUser);
	]]You have successfully logged out of the system.[[
)
else
	]]You're not logged into the system.[[
}}

[Click here to go back to the main page.](Index.md)

