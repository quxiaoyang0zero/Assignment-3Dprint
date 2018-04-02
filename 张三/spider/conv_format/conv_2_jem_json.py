# -*- coding: utf-8 -*-
#import sys
import json
import collections
import unicodecsv as csv
#from os import path

#reload(sys)
#sys.setdefaultencoding('utf8')

def read_csv(file):
    i = 0
    csv_rows     = []
    classes_book = ""
    classes_list = ['文学', '流行', '文化', '生活', '经管', '科技']
    year_list    = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015]
    year_num     = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]]
    with open(file) as csvfile:
        read = csv.reader(csvfile, encoding='utf-8')
        for row in read:
            classes_book = row[0]
            book_name    = row[2]
            row.reverse()
            try:
                year_book = str(row[2])
                year_book = year_book[0:4]
                year_num[year_list.index(int(year_book))][classes_list.index(str(classes_book.encode('utf8')))]   += 1
            except Exception, e:
                i += 1
        for k in range(2000, 2016):
            conv = collections.OrderedDict()    #据说可保证字典的顺序，但是使用起来貌似没什么效果
            conv = {'State':k,
                    'freq':{'literature':year_num[year_list.index(k)][0], 
                    'fashion':           year_num[year_list.index(k)][1],
                    'culture':           year_num[year_list.index(k)][2],
                    'life':              year_num[year_list.index(k)][3],
                    'sdministered':      year_num[year_list.index(k)][4],
                    'science':           year_num[year_list.index(k)][5]}}
            csv_rows.extend([conv])
        #print csv_rows
        print "not target num: %d" % i
        with open('book.josn', "w") as f:
            f.write(json.dumps(csv_rows, sort_keys=True, indent=4, separators=(',', ': '),encoding="utf-8",ensure_ascii=False))
            #f.write(json.dumps(csv_rows))    #直接写没有换行
read_csv('comment_complete_complete_test_year.csv')
