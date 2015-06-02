# Mushi
Mushi is a minimalistic open-source bug tracker.
It offers a clear separation between its backend and its frontend, so you can easily replace either with your own.

The backend is written in Python (2.7, 3.3+), on the top of the incredibly excellent Flask micro-framework, and SQLAlchemy for the persistence.
The frontend is written with Twitter's Bootstrap and Facebook's React.js.

## Quick start
This tutorial should help you getting started and run your own version of Mushi.

### Prerequisites
As prerequisites , the remaining of this guide expects that you have [python](https://www.python.org), [pip](https://pip.pypa.io/en/latest/installing.html) and [npm](https://www.npmjs.com) installed on your system.

Additionally, it is recommended to run Mushi in its own virtual environment, so you may install [virtualenv](http://www.virtualenv.org/en/latest/) as well.
Then, you may create an environment wherever you like, for instance:

```
virtualenv /opt/mushi/venv
source /opt/mushi/venv/bin/activate
```

### Dependencies
Mushi is built on the top of Flask and SQLAlchemy.
Go on and install them with ```pip```:

```
pip install flask
pip install sqlalchemy
```

Mushi also uses the ```dateutil``` module to manage date fields.
Go on and install it as well:

```
pip install python-dateutil
```

And that's it for the server dependencies.

### Installation of Mushi
Now that all dependencies have been set, we are ready to install and run Mushi.
Download and unzip the latest version of Mushi from github: [https://github.com/kyouko-taiga/mushi/archive/master.zip](https://github.com/kyouko-taiga/mushi/archive/master.zip).

Alternatively, if you have git installed on your system, you may prefer cloning the repository directly:

```
git clone https://github.com/kyouko-taiga/mushi.git
```

The default configuration of Mushi resides under the file ```/path/to/mushi/mushi/settings.py```.
For the sake of this quick start, we will use the default configuration.
If however you want to override them for whatever reason, please refer to the section [Handling configuration](#handling-configuration) before continuing this tutorial.

Before we can run our server, we need to initialize the database.
Open a terminal to the root of Mushi and type the following:

```
mkdir data
python manage.py db sync
```

Unless a problem happens during the initialization of the database, this command will exit silently and you will be able to see a file ```/path/to/mushi/data/mushi.dev.db```.
Once the database initialized, we will create a user:

```
python manage.py users add admin@mushi.local
```

*Note that this command will prompt you for a password.*

And finally, we are ready to run our server:

```
python manage.py server run
```

This command will tell you your server is now running at [http://localhost:5000/](http://localhost:5000/) but don't rush to your favourite web browser yet.
If you navigate to this address, not much will happen, because we didn't built the front end application yet.
Open a terminal at the root of Mushi and type the following:

```
npm install
npm run setup
npm run build
```

Et voilà!
This time you can open your browser to [http://localhost:5000/login](http://localhost:5000/login) and you should see the login page of Mushi.

*Note that the above commands will build minified files, which is the format Mushi will include by default.
However, it you run Mushi in debug mode, it will try to include non-minified files and won't find them.
To build the non-minified files, run the command ```npm run build-debug```.*

<a name="handling-configuration">
## Handling configuration
</a>
Mushi uses python files to handle its configuration.
You can see such file in action if you open ```/path/to/mushi/mushi/settings.py```, which is the default configuration of Mushi.
Please note that you should **not** directly edit this configuration but override them with another file of your own.

### Override default settings
The following is the method to override the default settings of Mushi:

* Copy the default configuration file ```/path/to/mushi/mushi/settings.py``` wherever you like and open it.
* Replace the value of the keys you'd like to override and comment the ones you'd like to leave unchanged.
* Create an environment variable ```MUSHI_SETTINGS``` pointing to your custom configuration file, for instance:
  
  ```
  export MUSHI_SETTINGS=/opt/settings/production.py
  ```

Using this technique, it is very easy to see which configuration keys are overriden, and which are not.

### Configuration keys
The following is a description of the configuration keys you can set.
Please refer to the [documentation of Flask](http://flask.pocoo.org/docs/latest/config/#builtin-configuration-values) for an exhaustive list of the other available configuration keys.

#### ```API_ROOT```
This key is used by Mushi to configure the root url of the api in the web UI.
Please note that this key will **not** modify the mounting point of the api and is only used to configure the web UI.

#### ```SQLALCHEMY_DATABASE_URI```
This key is used to build the database engine Mushi will use.
Its value can be any string compatible with the [format of SQLAlchemy](http://docs.sqlalchemy.org/en/latest/core/engines.html#sqlalchemy.create_engine).

#### ```AUTH_TOKEN_DURATION```
This key is used to configure the duration of the authentication tokens delivered by the API.
Its value should be a natural number denoting the number of seconds tokens will be valid for.

## Deploying Mushi on Apache
Using ```python manage.py server run``` is not a viable option to use Mushi in a production environment.
The following is a small tutorial on how to deploy Mushi on Apache with mod_wsgi.

### Installing mod_wsgi
If you already have mod_wsgi installed on your system, you can skip this step.

There are two ways of installing mod_wsgi.
The documentation of mod_wsgi describes the steps for installing mod_wsgi on a UNIX system [from the sources](https://code.google.com/p/modwsgi/wiki/QuickInstallationGuide).
Another method is to install it [as a Python package](https://pypi.python.org/pypi/mod_wsgi), with ```pip```.

First, you will need the developer variant of the specific Apache package you are using. Then, install the mod_wsgi package and create a link to the compiled binary in the modules directory of Apache:

```
pip install mod_wsgi
ln -s /usr/local/lib/pythonx.y/dist-packages/mod_wsgi/server/mod_wsgi-pyxy.cpython-xym.so /usr/lib/apache2/modules/mod_wsgi.so
```

Note that you have to compile mod_wsgi for the exact same  version of python that the version you will use to run Mushi.
This is particularily important if you installed Mushi in a virtual environment, as you won't be able to have Apache use it otherwise.

### Configuring a wsgi file
The repository of Mushi contains a file named ```wsgi.py``` that you can use as a boilerplate to make your own wsgi file.
You won't probably change anything but the variables ```SITE_PACKAGES``` and ```APP_PATH``` at the beginning of the file. The first declares the list of site-packages directories that should be added to the python path.
Typically, if you use a virtual environment, you will enter the path to its site-packages directory (ex: ```/opt/mushi/venv/lib/pythonx.y/site-packages/```). The second declares the location of the Mushi package, that is the root directory of Mushi.

### Creating a virtual host
The last step is to create a virtual host.

*The following makes the assumption you are running a Debian/Ubuntu system.
There are countless tutorials on the Internet on how to get started with Apache virtual hosts, so be sure to check on them to adapt this tutorial to your operating system if necessary.*

Once you are ready to setup virtual hosts, create the file ```/etc/apache2/sites-available/mushi.example.com.conf``` and add the following:

```
<VirtualHost *:80>
  ServerName mushi.example.com
  ServerAlias www.mushi.example.com

  SetEnv MUSHI_SETTINGS /opt/mushi/settings/production.py

  WSGIDaemonProcess mushi user=mushi group=mushi threads=2
  WSGIProcessGroup mushi

  WSGIScriptAlias / /path/to/mushi/mushi/wsgi.py
  <Directory /path/to/mushi/mushi/>
    Order allow,deny
    Allow from all
  </Directory>

  Alias /static /path/to/mushi/mushi/apps/webui/static/
  <Directory /path/to/mushi/mushi/apps/webui/static/>
    Options FollowSymLinks
    Order allow,deny
    Allow from all
  </Directory>

  LogLevel warn
  ErrorLog ${APACHE_LOG_DIR}/mushi-error.log
  CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

For security reasons, note that we chose to run Mushi as a dedicated user.
Go on a create it:

```
useradd --system -m mushi
```

If you use SQLite as your database engine, be sure to give write access to the new Mushi user.

```
chown mushi:mushi /path/to/database/file
chmod 0664 /path/to/database/file
```

Finally, activate your new site, and reload Apache:

```
a2ensite mushi.example.com
service apache2 reload
```

Mushi should now run at [http://mushi.example.com](http://mushi.example.com).

### Using another WSGI server
Mushi should be able to run under any other WSGI server.
Please refer to the documentation of your WSGI server to learn about the best way to integrate Mushi with it.
Keep in mind that the Mushi is the actual WSGI application, as shown in the ```wsgy.py``` boilerplate.

## Troubleshooting
You can run Mushi in debug mode with the following command:

```
python manage.py server run --debug
```

Under debug mode, Mushi will log the stack trace of any uncaught exception to the console.
The error will be reported to the client too, as a HTML page containing the stack trace and an AJAX based debugger (which allows to execute code in the context of the traceback's frame).
Please refer to the [documentation of Werkzeug](http://werkzeug.pocoo.org/docs/latest/debug/) for more information about the AJAX debugger.

For obvious security reasons, be sure to *never* expose your Mushi server in debug mode to the Internet.
