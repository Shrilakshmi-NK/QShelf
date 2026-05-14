"""
Helper / Utility Functions
- Timestamp conversion (seconds <-> hh:mm:ss)
- YouTube video ID extraction
- YouTube oEmbed title fetching
"""

import re
import urllib.parse
import urllib.request
import json


def seconds_to_hms(seconds):
    """
    Convert integer seconds to hh:mm:ss string.
    Example: 3723 -> "1:02:03"
    """
    seconds = int(seconds)
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def hms_to_seconds(hms_string):
    """
    Convert hh:mm:ss or mm:ss string to integer seconds.
    Example: "1:02:03" -> 3723
    """
    parts = hms_string.strip().split(":")
    parts = [int(p) for p in parts]
    if len(parts) == 3:
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    elif len(parts) == 2:
        return parts[0] * 60 + parts[1]
    return int(parts[0])


def extract_video_id(url):
    """
    Extract the YouTube video ID from various URL formats.
    Handles:
      - https://www.youtube.com/watch?v=VIDEO_ID
      - https://youtu.be/VIDEO_ID
      - https://youtube.com/shorts/VIDEO_ID
    Returns the video ID string, or None if not found.
    """
    patterns = [
        r"(?:v=|\/)([0-9A-Za-z_-]{11}).*",  # standard & shortened
        r"shorts\/([0-9A-Za-z_-]{11})",       # shorts
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def fetch_video_title(url):
    """
    Fetch the video title using YouTube's free oEmbed API.
    Returns the title string, or None on failure.
    No API key required.
    """
    try:
        encoded_url = urllib.parse.quote_plus(url)
        oembed_url = f"https://www.youtube.com/oembed?url={encoded_url}&format=json"
        with urllib.request.urlopen(oembed_url, timeout=5) as response:
            data = json.loads(response.read())
            return data.get("title")
    except Exception:
        # oEmbed call failed (network error, invalid URL, etc.)
        return None


def build_youtube_url_with_timestamp(video_id, timestamp_seconds):
    """
    Build a YouTube URL that starts at a specific timestamp.
    Example: https://www.youtube.com/watch?v=abc123&t=120
    """
    return f"https://www.youtube.com/watch?v={video_id}&t={timestamp_seconds}"
