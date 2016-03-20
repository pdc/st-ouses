# Fake data fro St Ouses

Let’s create some fake API data!

This uses Python to generate the data.


## Creating data

Run this command:

    ./mkfake.py

This generates around 100 `.json` files.


## Running the server

Python has a built in server which can be activated thusly if you
want to run it standalone:

    python -m SimpleHTTPServer 8086

The API is then available on <http://localhost:8086/index.json>

Note that you do not need to run the fake data server if you are
already running the UI server.
