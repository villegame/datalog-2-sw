# datalog-2-sw

## Overview

Datalogger software related to a project [described here](https://villegame.wordpress.com/projects/data-monitoring/portable-temperature-and-humidity-measuring-application-project/).

Designed for Raspberry PI single-board computers, to read and store data from 1-wire temperature sensors and bme280 sensors. Provides also easy configuration tool and visual graphs to monitor values.

This repository contains core functionalities of logger including:
* Sensor reader scripts
* Server-side database client (not the database itself)
* Web-UI with easy to use settings and graphs

Screenshots:  
[Live graph](https://villegame.files.wordpress.com/2018/03/live1.png)  
[Configuration](https://villegame.files.wordpress.com/2018/03/config1.png)  

## Hardware

You will need to do the wiring with desired components: 1-Wire sensor(s), BME-280 sensor on i2c bus.

BME-280 module connects to RPI pins as following:  

| BME-Module | RPI     |
| ---------- | ------- |
| VCC        | 3.3V    |
| GND        | GND     |
| SCL        | I2C-SCL |
| SDA        | I2C-SDA |  

1-Wire DS1820 sensors connects as following: 

| DS1820 | RPI  |
| ------ | ---- |
| V      | 3.3V |
| D      | IO4  |
| GND    | GND  |

**NOTE!** you need to add 4,7kOhm resistor between Voltage and Data pins as illustrated [in here](https://villegame.files.wordpress.com/2018/03/1w.png).  
You can add several DS1820 sensors parallel to the setup.  

With RPi zero these items might come in handy: 
* micro usb male to usb female adapter
* usb to ethernet adapter
* mini hdmi male to hdmi female adapter

## Software

### Raspbian OS

Make a Raspbian Jessie or Stretch sd-card for the RPI. Lite version will do perfectly since gui isn't needed. If you don't know any good sd-writer software, use [Etcher](https://etcher.io/). 

**Notice** For RPi Zero W model it is recommended to use Raspbian Stretch, for the on-board wifi to work. I've tested other RPi models with Jessie.

### Raspi-config 

On first boot it is recommended to connect at least monitor/tv, keyboard and ethernet cable to RPI. If you're using RPI Zero, connect just monitor and keyboard. After running configuration tool and rebooting you should be able to switch usb keyboard to ethernet adapter to do the rest over ssh in your LAN using ssh or putty for example.

**Notice** You can also enable ssh by creating an empty file named 'ssh' on boot partition of sd-card. This makes installing on RPi Zero easier.

Login to your pi (username pi, password raspberry) and start configuration tool on terminal:

```
sudo raspi-config
```

* Internationalisation Options (localisation in Stretch): Set locales (I used en_US.UTF-8).
  * In general if you see any python locale warnings including locale names, you should install all locales mentioned in warning. Otherwise there is a possibility for database installation to fail.
  * It is also useful to set the rest of options in internationalisation category.
* Expand filesystem (just in case, could have been done automatically)
* Advanced options (interfacing in Stretch)
  * Enable i2c
  * Enable 1-wire
  * Enable ssh (if you want to connect over network to do the rest)

Finish config and reboot.

### Install necessary software

```
sudo apt-get update  
sudo apt-get install git python-smbus i2c-tools postgresql -y
```

Check that your postgre install was succesfull by typing:  

```
sudo su postgres  
psql  
```

It should open psql client, in this case everything is fine, exit by typing:  

```
\q  
exit  
```

And continue to install node.js.

If you got perl warnings and error, exit by:  

```
exit  
```

and fix locale issue by setting locales to whichever you installed earlier, in this example en_US.UTF-8:  

```
export LANGUAGE=en_US.UTF-8  
export LANG=en_US.UTF-8  
export LC_ALL=en_US.UTF-8  
sudo locale-gen en_US.UTF-8  
sudo dpkg-reconfigure locales  
```

after this finish the fix by:  

```
sudo pg_createcluster 9.4 main --start  
```

(this command was suggested by failed postgre installer, so check version number there)


### Install node.js for raspberry

To install node.js run following commands:

```
cd ~  
wget https://nodejs.org/dist/v7.7.2/node-v7.7.2-linux-armv6l.tar.gz  
tar -xzf node-v7.7.2-linux-armv6l.tar.gz  
sudo cp -R node-v7.7.2-linux-armv6l/* /usr/local/  
rm node-v7.7.2-linux-armv6l.tar.gz  
rm -r node-v7.7.2-linux-armv6l  
sudo npm install -g npm  
```

### Clone git repo

Clone the repository from git:  

```
cd ~  
git clone https://github.com/villegame/datalog-2-sw.git  
```

install dependencies:  

```
cd datalog-2-sw  
npm install  
```

**Notice!** If you are getting "killed" message as result of running npm install, it means you are probably running out of memory. You can try and increase swapfile size by editing /etc/dphys-swapfile and changing CONF_SWAPFILE=100 to something like CONF_SWAPFILE=512. After that reboot and re-run npm install.

### Setup database

```
cd ~/datalog-2-sw
sudo su postgres  
psql  
create database temp_mon;  
create user temp_mon_user with password 'temp_mon_password';  
grant all on database temp_mon to temp_mon_user;  
\q  
```

now run database create script as freshly created user:

```
psql -d temp_mon -U temp_mon_user -W -h localhost -f create.sql  
```

(use password assigned earlier 'temp_mon_password')  
finally logout as postgre by typing:  

```
exit  
```


### Set software to start on boot.

```
sudo crontab -e  
```

add line:  

```
@reboot /usr/local/bin/node /home/pi/datalog-2-sw/app.js &  
```

### WLAN AP (optional)

The whole device works nicely if you attach wi-fi adapter (unless your raspberry has built in wlan like models 3 and Zero W) to it and set it to work as an access point. This way you can access the web-ui wirelessly connecting to the wifi and browsing to the gateway address.

Instructions [For Raspbian Jessie](https://learn.adafruit.com/setting-up-a-raspberry-pi-as-a-wifi-access-point/install-software).  
And for [Raspbian Stretch](https://www.raspberrypi.org/documentation/configuration/wireless/access-point.md).

### System on-led and poweroff button (optional)

It is also quite practical to have a poweroff button for RPI simply because no one wants to shut the device down every time thru console. System on-led is included with the poweroff button in [this blog post](https://villegame.wordpress.com/2016/12/05/portable-temp-humidity-reader-part-ii/).

### Finished

Just browse to your RPI's ip address, or if you created wlan-ap connect to the network and direct your browser to the gateway.

**NOTE!**
* server.js contains express-session secret for sessions, which should be changed

## TODO
* Config panel
  * Backend log display tool for ui?
  * Poweroff/reboot button to config-panel
  * Set time window of live graph x-axis
  * Set amount of time how old data will be fetched for graph
* Use package manager to manage Web-ui dependancies
* LCD screen support
