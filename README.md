Neuro-Foundry
================

The *Neuro-Foundry*^TM is a service that runs on a TAG Neuron(R), and lets users create smart contracts for different purposes.

Prerequisites
-----------------

The *Neuro-Foundry*^TM service relies on the [OpenAI integration with the Neuron(R)](https://lab.tagroot.io/Community/Post/OpenAI_integration_with_the_Neuron).
You need to install the `TAG.XmppOpenAIBridge.package` on the Neuron(R) you wish to run the *Neuro-Foundry*^TM on. This includes
the development machine. You also need to configure a node named `ChatGPT`, with a live connection to OpenAI, as indicated in
the linked article. Without such a node available, many features of the *Neuro-Foundry*^TM will not be avialable.

Development
--------------

The *Neuro-Foundry*^TM runs on a [TAG Neuron(R)](https://lab.tagroot.io/Documentation/Neuron/InstallBroker.md). To simplify 
development, once the project is cloned, add a `FileFolder` reference to your repository folder in your 
[gateway.config file](https://lab.tagroot.io/Documentation/IoTGateway/GatewayConfig.md). 
This allows you to test and run your changes immediately, without having to synchronize the folder contents with an external 
host, or go through the trouble of generating a distributable software package just for testing purposes.

Example:

```
<FileFolders>
  <FileFolder webFolder="/NeuroFoundry" folderPath="C:\My Projects\NeuroFoundry\Root\NeuroFoundry"/>
</FileFolders>
```

**Note**: Once file folder reference is added, you need to restart the *IoT Gateway service* for the change to take effect.

You will also need to copy the `NeuroFoundry.config` file to the Program Data folder of the gateway, to initialize the database, 
indexes and full-text-search functions, and then restart the gateway. This configuration file contains initialization script
that needs to be executed before the service can function properly.

## Solution File

A Visual Studio solution file, with references to the files and folders of this repository, is available: `NeuroFoundry.sln`.

## Main Page

The main page of the community service is `/NeuroFoundry/Index.md`.

