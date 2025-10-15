#!/bin/bash

# Create directory for new HTML dumps
mkdir -p html_dumps3

# Array of URLs to download
urls=(
    "https://www.economy.gov.mk/mk-MK/javni-objavi"
    "https://www.economy.gov.mk/mk-MK/dokumenti/sektorski-programi"
    "https://kb.mk/eib-vii-msp-kapitalizirani-pretprijatija-i-zelena-tranzicija.nspx"
    "https://www.sparkasse.mk/mk/business-clients/finansiranje/posebni-programi-za-finansiranje"
    "https://www.sparkasse.mk/mk/business-clients/finansiranje/investiciski-krediti-proekti"
    "https://www.mzsv.gov.mk/Events.aspx?IdLanguage=1&IdRoot=1&News=3977"
    "https://www.ipardpa.gov.mk/mk/Home/Index"
    "https://www.mbdp.com.mk/mk/Products/KreditnaLinijaProizvod/16"
)

# Function to create slug from URL
create_slug() {
    local url=$1
    # Remove protocol and www
    local slug=$(echo "$url" | sed 's|https://||' | sed 's|http://||' | sed 's|www\.||')
    # Replace special characters with underscores
    slug=$(echo "$slug" | sed 's|[^a-zA-Z0-9._-]|_|g')
    # Remove multiple consecutive underscores
    slug=$(echo "$slug" | sed 's|__*|_|g')
    # Remove leading/trailing underscores
    slug=$(echo "$slug" | sed 's|^_\|_$||g')
    echo "$slug"
}

# Download each URL
for url in "${urls[@]}"; do
    slug=$(create_slug "$url")
    filename="html_dumps3/${slug}.html"

    echo "Downloading: $url"
    echo "Saving to: $filename"

    # Use curl to download with user agent to avoid blocking
    curl -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" \
         -o "$filename" \
         "$url"

    if [ $? -eq 0 ] && [ -s "$filename" ]; then
        echo "✅ Successfully downloaded: $filename"
    else
        echo "❌ Failed to download: $url"
    fi

    # Small delay to be respectful
    sleep 2
done

echo "Download complete!"