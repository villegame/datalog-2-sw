#!/usr/bin/python
import sys
import os

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
