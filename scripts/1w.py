#!/usr/bin/python
import sys
import os


if len(sys.argv) > 1:
	device = sys.argv[1]
	command = "timeout 6 cat /sys/devices/w1_bus_master1/{0}/w1_slave".format(device)
	path = "/sys/devices/w1_bus_master1/{0}/w1_slave".format(device)
	if os.path.exists(path):
		try:
			value = float(os.popen(command).read().strip().split("=")[2])/1000
			if isinstance(value, float):
				if value != 85.00: 
					# Do not add 85.00, it is a reset value
					print "{ \"temperature\": ", value, "}"
		except:
			#not a float or not connected
			pass
else:
	sensors = []
	path = "/sys/devices/w1_bus_master1"
        if os.path.exists(path):
		subdirs = [d for d in os.listdir(path) if os.path.isdir(os.path.join(path, d))]
		for dir in subdirs:
			if os.path.exists(path + "/" + dir + "/w1_slave") and os.path.isfile(path + "/" + dir + "/w1_slave"):
				sensors.append("\""+dir+"\"")
		sensorJSONString = "{\"sensors\": ["+",".join(sensors)+"]}"
		
		print sensorJSONString
				
