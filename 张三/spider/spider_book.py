# -*- coding: utf-8 -*-
import re
import sys
import csv
import time
import urllib
import urllib2
import requests
from bs4 import BeautifulSoup

reload(sys)
sys.setdefaultencoding('utf8')

####################################################################################################
per_tag_page    = 8    #结束
starpageNumber  = 4    #起始
per_tag_skip    = 1    #在小标签内跳过的步长，例如1就是每页都爬，2就是1,3,5,7,9
tag_sleep_time  = 0    #每爬完一个tag休息2分钟
page_sleep_time = 0    #每爬一个小标签内的一页休息1分钟 
####################################################################################################

classes_name = ""
tag_name     = ""
page_step    = 20

def BrowserHeaders():
    head    = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/' \
           '537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36'
    headers = {'User-Agent': head}
    return headers

def GetTag():
    global classes_name
    global tag_name
    write_tag_name = []
    BaseUrl        = 'https://book.douban.com/tag/?view=type&icn=index-sorttags-all'
    headers        = BrowserHeaders()
    print "get url"
    try:
        request  = urllib2.Request(BaseUrl)
        response = urllib2.urlopen(request)
        soup     = BeautifulSoup(response,"lxml")
    except Exception, e:
        print "maybe blocked!"
    for items in soup.find_all('div',{'class':'article'}):
        classes_list = re.findall(r'.*?<a class="tag-title-wrapper" name="(.*?)">.*?', str(items))
        #for classes_detail in classes_list:
        classes_name = "".join(classes_list[0].split())
        tag_list = re.findall(r'.*?<a href="/tag/(.*?)">.*?', str(items))
        for tag in tag_list:
            tag_name = "".join(tag.split())
            GetFilmPage(tag, per_tag_page)
            time.sleep(tag_sleep_time * 60)
    return True

def GetFilmPage(TagName, pangeNumber):
    global classes_name
    global tag_name
    
    TagUrl  = 'https://book.douban.com/tag/{tag}?start={start}&type=T'
    headers = BrowserHeaders()
    for pages in range(starpageNumber, pangeNumber):
        print TagName
        start_num = pages * per_tag_skip * page_step
        print "    crawling page%d..." % (start_num)
        Tagurl   = TagUrl.format(start = start_num, tag = urllib.quote(TagName))    
        try:
            request  = urllib2.Request(Tagurl, headers = headers)
            response = urllib2.urlopen(request)
            tagsoup  = BeautifulSoup(response,"lxml")
            time.sleep(page_sleep_time * 60)
        except Exception, e:
            print "    maybe blocked!"
            time.sleep(1200)
        for items in tagsoup.find_all('div',{'class':'info'}):
            book_name = re.search(r'.*?<a href=".*?" onclick="moreurl.*?" title="(.*?)">.*?', str(items))
            try:
                book_name = book_name.group(1)
                book_name = "".join(book_name)
                print "    %s" % book_name
            except Exception, e:
                print "    empty book name" 
            books_detail = items.div.text
            books_detail = "".join(books_detail.split())
            book_rate = re.search(r'.*?<span class="rating_nums">(.*?)</span>.*?', str(items))
            try:
                book_rate = book_rate.group(1)
                book_rate = "".join(book_rate)
            except Exception, e:
                print "    empty rate"  
            books_hot = items.find_all('span',{'class':'pl'})
            books_hot = re.search(r'.*?<span class="pl">([\s\S]*) \((.*?)\)([\s\S]*)</span>.*?', str(books_hot))
            try:
                books_hot = books_hot.group(2)
                books_hot = "".join(books_hot.split())
            except Exception, e:
                print "    empty hot"    
            items_book = [classes_name, tag_name, book_name, books_detail, book_rate, books_hot]
            Writecsv(items_book)
    return True

def Writecsv(commentcomplete):
    with open('comment_complete_complete.csv', 'ab+') as f:
        writer = csv.writer(f)
        writer.writerow(commentcomplete)
    f.close()


GetTag()
