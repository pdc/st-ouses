St Ouses
========

This is a toy app for playing with [A RESTful API for St Ouses][1].

I wanteed to experiment with aporoaches to web APIs that did not
involve daa even remotely resembling that which I work with at my
paid job.

  [1]: http://alleged.org.uk/pdc/2016/02/19.html


Running the server
------------------

Generate the fake data:

    $ cd fake
    $ python mkfake.py
    $ cd ..

Install the JavaScript dependencies. You need Node 4.3+. Then do these commands:

    $ npm install
    $ npm run build
    $ npm start

Visit <http://localhost:8087> to see a view of one entity in the fake
dataset. Click on links to navigate through the data.


Development
-----------

You can run tests with

    $ npm test

Or to run tests continually when files are changed, do

    $ npm run karma


TODO
----

Routing
- Add routing
