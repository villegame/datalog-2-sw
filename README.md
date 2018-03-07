# datalog-2-sw

## Overview

Datalogger software related to a project [described here](https://villegame.wordpress.com/projects/data-monitoring/portable-temperature-and-humidity-measuring-application-project/).

Designed for Raspberry PI single-board computers, to read and store data from 1-wire temperature sensors and bme280 sensors. Provides also easy configuration tool and visual graphs to monitor values.

This repository contains core functionalities of logger including:
* Sensor reader scripts
* Server-side database client (not the database itself)
* Web-UI with easy to use settings and graphs

Screenshots:  
[Live graph](https://villegame.files.wordpress.com/2018/03/livegraph.png)  
[Configuration](https://villegame.files.wordpress.com/2018/03/config.png)  

## Use

Before deploying the software you need to have raspbian jessie installed on your RPI. You will also need to do the wiring with desired components (1-Wire sensors, BME-280 sensor on i2c bus).

To deploy, follow these steps:

### Raspi-config 

Start configuration tool on terminal:

sudo raspi-config
* Internationalisation Options: Set locales (I used en_US.UTF-8).
  * It is also useful to set the rest of options in this category.
* Expand filesystem
* Advanced options
  * Enable i2c
  * Enable 1-wire
  * Enable ssh (if you want to connect over network to do the rest)

### Install necessary software

sudo apt-get update  
sudo apt-get install git python-smbus i2c-tools postgresql -y

Check that your postgre install was succesfull by typing:  
sudo su postgres  
psql  

It should open psql client, in this case everything is fine, exit by typing:  
\q  
exit  

If you get perl warnings and error, exit by:  
exit  

and fix locale issue by setting locales to en_US.UTF-8 (in this case):  

export LANGUAGE=en_US.UTF-8  
export LANG=en_US.UTF-8  
export LC_ALL=en_US.UTF-8  
sudo locale-gen en_US.UTF-8  
sudo dpkg-reconfigure locales  

after this finish postgre install by:  
sudo pg_createcluster 9.4 main --start  
(this command was suggested by installer if it failed, so check version number there)


### Install node.js for raspberry

cd ~  
wget https://nodejs.org/dist/v7.7.2/node-v7.7.2-linux-armv6l.tar.gz  
tar -xzf node-v7.7.2-linux-armv6l.tar.gz  
sudo cp -R node-v7.7.2-linux-armv6l/* /usr/local/  
rm node-v7.7.2-linux-armv6l.tar.gz  
rm -r node-v7.7.2-linux-armv6l  
sudo npm install -g npm  

### Clone git repo

Clone the repository from git:  
cd ~  
git clone https://github.com/villegame/datalog-2-sw.git  

install dependencies:  
cd datalog-2-sw  
npm install  

### Setup database

sudo su postgres  
psql  
create database temp_mon;  
create user temp_mon_user with password 'temp_mon_password';  
grant all on database temp_mon to temp_mon_user;  
\q  

psql -d temp_mon -U temp_mon_user -W -h localhost -f create.sql  
(use password assigned to run command 'temp_mon_password')  
finally logout as postgre by typing:  
exit  

### Set software to start on boot.

sudo crontab -e  
add line:  
@reboot /usr/local/bin/node /home/pi/datalog-2-sw/app.js &  

### WLAN AP (optional)

The whole device works nicely if you attach wi-fi adapter to it and set it to work as an access point. This way you can access the web-ui wirelessly connecting to the wifi and browsing to the gateway address.
Instructions [here](https://learn.adafruit.com/setting-up-a-raspberry-pi-as-a-wifi-access-point/install-software).

### System on-led and poweroff button (optional)

It is also quite practical to have a poweroff button for RPI simply because no one wants to shut the device down every time thru console. System on-led is included with the poweroff button in [this blog post](https://villegame.wordpress.com/2016/12/05/portable-temp-humidity-reader-part-ii/).

### Finished

Just browse to your RPI's ip address, or if you created wlan-ap connect to the network and direct your browser to the gateway.

**NOTE!**
* So far the hardcoded password for configuration is 'password'.
* Also it is good to point out that server.js contains express-session secret for sessions, which should also be changed.
* So far depending on your RPI revision you might need to change SMBus from 0 to 1 in /scripts/bme280.py on line 30.

## TODO
* Poweroff button to config-panel
* Proper superuser authentication instead of current dummy
* Add revision identification feature for BME-280 script so that sensor can be read on all Raspberry PIs without manual modification of script
* Use bower for Web-ui dependancies
* LCD screen compatibility
* Backend log display tool for ui?
