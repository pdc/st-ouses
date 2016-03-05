Let’s create some a fake API server!

This uses Python to generate the data. You can also use Python’s
built-in HTTP server to serve the files.

# Creating data

Run this command:

    ./mkfake.py

This generates around 100 `.json` files.


# Running the server

Python has a built in server which can be activated thusly:

    python -m SimpleHTTPServer 8086

The API is then available on <http://localhost:8086/index.json>
