# WQP_UI
===================

[![Build Status](https://travis-ci.org/NWQMC/WQP_UI.svg?branch=master)](https://travis-ci.org/NWQMC/WQP_UI)
[![Coverage Status](https://coveralls.io/repos/github/NWQMC/WQP_UI/badge.svg?branch=master)](https://coveralls.io/github/NWQMC/WQP_UI?branch=master)

Water Quality Portal User Interface

This application should be built using python 3.6.x and node version > 8.x.x. 

You will need to create a config.py file in the `instance` directory. It should contain the following:
```python

DEBUG = True
VERIFY_CERT = True or False

ASSETS_DEBUG = True # This will disable minimizing js and css assets but less files will still compile.
ASSETS_AUTO_BUILD = True # Typically local developers will not be using precompiled assets.
	
# Do not use the same key as any of the deployment servers
SECRET_KEY = 'local_secret_key'

# points to the geoserver endpoint you want to use. 
WQP_MAP_GEOSERVER_ENDPOINT = ''
SITES_MAP_GEOSERVER_ENDPOINT = ''
	
#points to the sld endpoint you want to use.
SLD_ENDPOINT = ''

# points to the endpoint which returns flow lines and sites for a comid
NLDI_SERVICES_ENDPOINT = ''
	
#points to the codes endpoint
CODES_ENDPOINT = ''
	
#points to the query endpoint. Does not include the type of data or 'search' part of the endpoint
SEARCH_QUERY_ENDPOINT = ''
	
#points to the public srsnames endpoint you want to use.
PUBLIC_SRSNAMES_ENDPOINT = ''

#A list of dictionaries that associate user-facing text with an identifier for the style
#
# In each dictionary,
#    The 'id' key should be given a string value - the name of a style present on GeoServer
#    The 'text' key should be given a string value - user-facing text that appears in the web ui's dropdown for selecting styles
SITE_SLDS = [
    {'id' : 'wqp_sources', 'text' : 'By source'},
    {'id' : 'site_type', 'text' : 'By site type'},
    {'id' : 'activity_visual', 'text' : 'By activity'}
]


# set REDIS Config if it exists.
REDIS_CONFIG = None

# set the local base url, this deals with the weird way we do wsgi around here, for local development
# use http://127.0.0.1:5050
LOCAL_BASE_URL = ''

#Sets the theme to be used for the portal_ui app pages. Valid values are 'wqp' and 'usgs'
UI_THEME = 'wqp' or 'usgs'
```

## Setup on Linux or MacOS
To build this application on a linux or Mac OS you can use the dev_install.sh script. If you want a fresh install type in:
`source dev_install.sh --clean`
This will remove the previous javascript and python dependencies. If you don't want to install from scratch, type in:
`source dev_install.sh --update` or `source dev_install.sh`
This will update your javascript and python dependencies. Both commands will run the jasmine tests.

## Setup on Windows
To build on Windows, you can use the dev_install.ps1 script. If you want a fresh install, open Powershell and type in:
`.\dev_install.ps1 --clean`
This will remove previous javascript and python dependencies. If you don't want to install from scratch, type in:
`.\dev_install.ps1 --update` or `.\dev_install.ps1`
This will update javascript and python dependencies. Both commands will run the jasmine tests on Windows.

As this runs npm, bower, and pip installs, you will want to make sure your certificate stores are all good to go.

## Manual Setup
If you prefer to go through the setup manually:
1. If you want to clean, remove the env, node, node_modules, portal_ui/bower_components, portal_ui/static/gen, and portal_ui/static/.webassets-cache directories
2. Install node (if you don't already have it installed.
3. Run `npm install`
5. Run `karma start test/js/karma.conf.js` (optional this runs the tests)
6. Run `virtualenv --python=python3`
7. Activate your virtualenv
8. Run `pip install -r requirements.txt`

## Running the Application
Now you can run the application within the virtualenv by executing:
`python run.py`

The application can be accessed at 127.0.0.1:5050/index.

For developer level testing, you can use the npm test script to run in no-single-step mode. Note that this
script will have to modified for Windows users.

## Installing Redis for local development
Note that Redis does not support Windows, but there is a Windows port (see the link below)). These instructions
are for Linux or MacOS. There is a brew recipe for MacOS which I have not tested

Get the latest stable release from https://redis.io/download. You will install it as follows.

`% tar xzf redis-3.2.8.tar.gz`
`% make` will make in the current directory, or `sudo make install` to but the executable in /usr/local/bin

You can run the redis server by using the redis_server executable in the src directory.
`% src/redis-server`

Test by running `src/redis-cli ping`. The response should be `PONG`.

To use redis in the application set the following in your instance/config.py:
```python
REDIS_CONFIG = {
    'host': 'localhost',
    'port': 6379,
    'db': 0
}
```

## Running Celery worker for local development
You will need to set the following in your instance/config.py to allow Celery to use Redis as the broker and backend.
```python
CELERY_BROKER_URL = 'redis://localhost:6379/10'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/11'
```
The celery worker can be started from the project home directory with the following command:
`% env/bin/celery worker -A wqp:celery --loglevel=info`


