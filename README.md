<<<<<<< HEAD
# uwu-recognition
Repo for uwu recognition 
=======
# Meta Vision 
### Meta Glasses GPT4 Vision API Implementation

This is a hacky way to integrate GPT4 Vision into the Meta Rayban Smart Glasses using voice commands.

[Example Demonstration](https://www.youtube.com/watch?v=PiEDrcLCmew)

Requirements:

a) [Meta Rayban Smart Glasses](https://about.fb.com/news/2023/09/new-ray-ban-meta-smart-glasses/)

b) [OpenAi Api Key](https://platform.openai.com/)

c) Alternative Facebook/Messenger account

d) [bun](https://bun.sh/)

### Setup

#### Get the server up and running:

1) Add a .env file with your OpenAi API key (example via ``env.example``)

2) Run ``bun install``

3) Run ``bun run dev``

4) Server should be up and running on PORT 3103

#### Add the Messenger Chat Observer:

**WARNING**: bookmarklets are a slightly obscure and very hacky way to execute arbitrary javascript in your browser, before running **MAKE SURE** to check the code you're executing. 
The bookmarklet code is documented below in the section titled: **Bookmarklet Code Breakdown**

1) Login to [messenger.com](https://www.messenger.com) with an alternative messenger/facebook account (make sure you are friends with your main account that's logged into your meta view app)

2) Copy and paste the code from ``bookmarklet.js`` and create a new bookmark in your browser with the URL as the code (alternatively import it as a bookmark)

3) Click the newly created bookmark

4) Upon success a dialog should appear with **Added Messenger Chat Observer**

#### Test the integration:

1) Make sure within the Meta View app that the messenger connection is connected to the appropriate main account

2) Say ``You: Hey Meta, send a photo to *name of alternative account*``

3) `Meta: Send a photo to *name of alternative account*`

4) ``You: Yes``

5) Upon receiving the new photo and sending it to GPT4 Vision the server should display the following logs:

```
GPT4 Vision Request
Sending request to GPT4 Vision
Request Successful
Saving data
Reading stored data
Creating new data file.
Writing new data
```
6) Open up ``./public/data.json`` to check the successful added data

ENJOY!

#### Bookmarklet Code Breakdown:

```javascript
javascript:(function (s) {
  const elements = document.getElementsByClassName("x78zum5 xdt5ytf x1iyjqo2 xs83m0k x1xzczws x6ikm8r x1rife3k x1n2onr6 xh8yej3");
  if (elements.length > 1) {
    const messages = elements[1].childNodes[2];
    if (messages) {
      messages.removeEventListener("DOMNodeInserted", null);
      messages.addEventListener("DOMNodeInserted", async (event) => {
        const imgSrc = event?.target?.getElementsByTagName("img")[1]?.src;
        if (imgSrc) {
          const res = await fetch("http://localhost:3103/api/gpt-4-vision", {
            method: "POST",
            body: JSON.stringify({ imageUrl: imgSrc }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          console.log(data);
        }
      });
      alert("Added Messenger Chat Observer");
    } else {
      console.log("Messages element not found");
    }
  } else {
    console.log("Element not found or index out of range");
  }
})();
```