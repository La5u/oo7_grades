import urllib.request
import pymupdf 
import os, os.path
import re
import sys

def clear():
    if sys.platform == 'linux':
        os.system('clear')
    else:
        os.system('cls')

FILENAME = 'grades.pdf'
if not os.path.isfile('url.txt'):

    URL = input('url: ')
    with open('url.txt', 'w') as f:
        f.write(URL)

else:
    URL = open('url.txt').read()


print('creating file...', end='\r')
urllib.request.urlretrieve(URL, FILENAME)

pdf = pymupdf.open(FILENAME)

clear()
for page in pdf: # iterate the document pages    
    text = page.get_text()
    r = r'(.*) *\n[\S\s]*[12][A-G][ \n]*(.*)[\S\s]*KZ\n([\n\/\d%]*)%\n[\S\s]*Grade\n(\/[\n\/\d%]*)%\n[\S\s]*Grade\n([\d\n ]*)\n[\S\s]*'
    if 'KZ' not in text:
        r = r'(.*) *\n[\S\s]*[12][A-G][ \n]*(.*)[\S\s]*?\/([\n\/\d%]*)%\n[\S\s]*Grade\n(\/[\n\/\d%]*)%\n[\S\s]*Grade\n([\d\n ]*)\n[\S\s]*'
    try:
        name, subject, g1, g2, g3 = re.search(r, text).groups()
    except AttributeError:
        continue
    formative_max_grades = g1.replace('\n', '').replace('/', '').split('%')
    summative_max_grades = g2.replace('\n', '').replace('/', '').split('%')
    all_grades = g3.split('\n')
    formative_grades = all_grades[:len(formative_max_grades)*2+2]
    summative_grades = all_grades[len(formative_max_grades)*2+2:len(formative_max_grades)*2+2+len(summative_max_grades)*2+2]

    print(subject)
    print('\nTotal:')
    if 'KZ' in text:
        print(all_grades[-3]+'%')
        print(all_grades[-2]+'ib')
        print(all_grades[-1]+'kz')
    else:
        final_grade = round((int(formative_grades[-2])+int(summative_grades[-2]))/2)
        print(f'{final_grade}%')

    print('\nFormatives:')
    for grade, max_grade, percent in zip(formative_grades[::2], formative_max_grades, formative_grades[1::2]):
        print(f'{grade} / {max_grade} - {percent}%')
    print(f'{formative_grades[-2]}% - {formative_grades[-1]} ib')

    print('\nSummatives:') 
    for grade, max_grade, percent in zip(summative_grades[::2], summative_max_grades, summative_grades[1::2]):
        print(f'{grade} / {max_grade} - {percent}%')
    print(f'{summative_grades[-2]}% - {summative_grades[-1]} ib')
    input('(press enter to continue)')
    clear()

print('good luck,', name)


