#!/usr/bin/python

def printError(type, message):
    print "{{ \"err\": {{ \"type\": {0}, \"msg\": \"{1}\" }} }}".format(type, message)
