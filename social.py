from linkedin_api.clients.restli.client import RestliClient
from requests_oauthlib import OAuth1Session
import os
import json

def postLinkedIn(comment: str, url: str, title: str, description: str):
    restli_client = RestliClient()

    linkedInToken = os.getenv("LINKEDIN_TOKEN")

    # Need to call this to get the current user's linked-in user id
    me_response = restli_client.get(resource_path="/me", access_token=linkedInToken)
    userURI = f"urn:li:person:{me_response.entity['id']}"

    create_response = restli_client.create(
        resource_path="/posts",
        entity={
            "author": userURI,
            "visibility": "PUBLIC",
            "lifecycleState": "PUBLISHED",
            "commentary": comment,
            "content": {
                "article": {
                    "source": url,
                    "title": title,
                    "description": description,
                }
            },
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": []
            },
        },
        access_token=linkedInToken,
        version_string="202402",
    )

def postTwitter(comment: str, url: str):

    oauth = OAuth1Session(
        # "Consumer Keys" under "Keys and Tokens" in the developer console
        os.environ.get("TWITTER_CONSUMER_KEY"),
        client_secret=os.environ.get("TWITTER_CONSUMER_SECRET"),
        # "Access Token and Secret" under "Keys and Tokens" in the developer console
        resource_owner_key=os.environ.get("TWITTER_TOKEN"),
        resource_owner_secret=os.environ.get("TWITTER_SECRET"),
    )

    response = oauth.post(
        "https://api.twitter.com/2/tweets",
        json={"text": f"{comment} {url}"},
    )

    if response.status_code != 201:
        raise Exception(
            "Request returned an error: {} {}".format(response.status_code, response.text)
        )
