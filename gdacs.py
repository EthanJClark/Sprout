import feedparser


def fetch_gdacs_rss(number: int = 10) -> list:
    rss_url = "https://www.gdacs.org/xml/rss.xml"
    # get the feed from GDACS
    feed = feedparser.parse(rss_url)
    # list of disasters
    disasters = feed.entries[:number]

    return disasters


if __name__ == "__main__":
    disasters = fetch_gdacs_rss()
    print(disasters[0])
