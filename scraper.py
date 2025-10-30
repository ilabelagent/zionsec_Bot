from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.wait import WebDriverWait
from bs4 import BeautifulSoup
import xmltodict
import time
import requests

# finds a top AI-related article from HackerNews
def findArticle():
    # fetch the RSS feed
    rssResponse = requests.get('https://news.ycombinator.com/rss')
    xml = xmltodict.parse(rssResponse.content)

    # some keywords that are AI related
    keywords = {'ai', 'genai', 'lightning', 'pytorch', 'llm', 'llms', 'ml', 'rag', 'nlp', 'openai', 'gemma', 'anthropic'}

    for item in xml['rss']['channel']['item']:
        link = item['link']
        title = item['title']

        # This is a text post, not a link to content, skip
        if link.startswith('https://news.ycombinator.com') or title.startswith('Show HN') or "is hiring" in title:
            continue

        for word in title.lower().split(' '):
            if word in keywords:
                return link


# fetches a webpage and gets its title, description and content
def fetchPage(url: str):
    options = Options()
    options.add_argument("--headless=new")
    driver = webdriver.Chrome(options=options)
    driver.get(url)

    # wait a few seconds for ajax content to load
    time.sleep(5)

    # grabs all the visible content of the page
    content = driver.find_element(by=By.CSS_SELECTOR, value='body').text

    # metadata
    headHtml = driver.execute_script("return document.head.innerHTML;")
    headSoup = BeautifulSoup(headHtml, 'html.parser')

    driver.quit()

    # grab seo metadata for title and description
    title = headSoup.title.text

    descTag = headSoup.find('meta', attrs={'name': 'description'})
    description = ''
    if descTag is None:
        # Fall back to open graph tags
        descTag = headSoup.find('meta', attrs={'name': 'og:description'})

    if descTag is not None:
        description = descTag['content']

    # add a reasonable max length
    if len(content) > 7000:
        content = content[:7000]

    return title, description, content
