# Getting started

> These are instructions for running an executable. For Docker, [see the dedicated guide](docker)

## Windows

1. Install Elasticsearch ([Installation guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/zip-windows.html)). Using a single node is fine.
2. Run Elasticsearch.
3. Visit the [Releases](https://github.com/porn-vault/porn-vault/releases) page and download the latest \*\_windows zip file.
4. Unzip the file
5. Open CMD, navigate to the unzipped folder run the executable `./porn-vault(.exe)` and follow the on-screen instructions

> cd download/folder/porn-vault
> porn-vault.exe

6. Once your app is setup you can visit it on `http://localhost:3000` (or your LAN IP equivalent) in your web browser of choice

## Linux/Mac

If you're a Linux/Mac user, you may want to use [Docker](docker)

Otherwise:

1. Install Elasticsearch ([Installation guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html)). Using a single node is fine.
2. Run Elasticsearch.
3. Visit the [Releases](https://github.com/porn-vault/porn-vault/releases) page and download the latest \*\_linux/\*\_macos zip
4. Unzip the file
5. Open the terminal of your choice, navigate to the unzipped folder run the executable `./porn-vault` and follow the on-screen instructions
6. Once your app is setup you can visit it on `http://localhost:3000` (or your LAN IP equivalent) in your web browser of choice

> When running in terminal you **MUST** be in the same directory as the executable.  
> Examples:
>
> - `./path/to/vault/porn-vault.exe` will not work
> - `cd ./path/to/vault`, `porn-vault.exe` will work
