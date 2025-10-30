import scraper
import client
import social

# Find some content
pageURL = scraper.findArticle()
print(pageURL)

# Fetch that content
title, description, content = scraper.fetchPage(pageURL)
print(title)
print(description)
print(content)

# Construct a prompt
prompt = f"The content of an article is {content}"
prompt += """Write some commentary about about a key point of the article's contents and encourage the reader to check it out in a professinal tone for a LinkedIn post.  
The entire post should be two sentences.  Use a couple emojis too.  
Respond with only the post, no additional commentary, no notes, no link"""
print(prompt)

# Feed that prompt to the LLM to get a response
postContent = str(client.chat("mixtral", prompt))
print(postContent)

# Post to our networks
social.postLinkedIn(postContent, pageURL, title, description)
social.postTwitter(postContent, pageURL)