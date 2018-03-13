#!/usr/bin/python
import sys
import os
from error import printError

# If given arg, read sensor by id which is arg
#
# On success returns:   { "temperature": float } 
#
# On error returns:     { "err": 
#                           {
#                               "type": integer (0: Invalid value, 1: Device does not exist)
#                               "msg": string
#                           }
#                       }
if len(sys.argv) > 1:
    device = sys.argv[1]
    command = "timeout 6 cat /sys/devices/w1_bus_master1/{0}/w1_slave".format(device)
    path = "/sys/devices/w1_bus_master1/{0}/w1_slave".format(device)
    if os.path.exists(path):
        try:
            value = float(os.popen(command).read().strip().split("=")[2])/1000
            if isinstance(value, float):
                # Do not add 85.00, it is a reset value
                if value != 85.00: 
                    print "{ \"temperature\": ", value, "}"
                else: 
                    raise Exception("Got reset value for {0}".format(device))
            else: 
                raise Exception("Got non-float value for {0}".format(device))
        except Exception as e:
            #not a float or not connected
            printError(0, "Error reding value: {0}".format(str(e)))
            #print "{ \"err\": { \"type\": 0, \"msg\": \"Error reading value: "+str(e)+" \" } }"
    else:
        printError(1, "Device {0} does not exist".format(device))
        #print "{ \"err\": \"Device " + device  + " does not exist\" }"

# Else list local sensors
#
# Returns:  { "sensors" : [list of sensors] }
else:
    sensors = []
    subdirs = []
    path = "/sys/devices/w1_bus_master1"
    if os.path.exists(path):
        subdirs = [d for d in os.listdir(path) if os.path.isdir(os.path.join(path, d))]
    for dir in subdirs:
        if os.path.exists(path + "/" + dir + "/w1_slave") and os.path.isfile(path + "/" + dir + "/w1_slave"):
            sensors.append("\""+dir+"\"")
    sensorJSONString = "{\"sensors\": ["+",".join(sensors)+"]}"
    print sensorJSONString
				
