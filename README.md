# hubot-messenger-bot

A Hubot adapter for [Facebook Messenger Platform](https://developers.facebook.com/docs/messenger-platform/product-overview) (Bots) with zero external dependencies.

The most simple, and elegant Facebook Messenger Platform adapter for Hubot.

**This is built for the latest [Facebook Messenger Platform (Beta)](http://newsroom.fb.com/news/2016/04/messenger-platform-at-f8/) with bots announced at [F8 2016 (Code to Connect)](https://www.fbf8.com/). It leverages on the platform's Send / Receive API. It is tested, and ready-to-use. This repository is NOT affiliated with Facebook.**

This adapter currently supports:

- [x] Token validation
- [x] Basic sending / receiving
- [x] Resolving user IDs to their full names
- [x] Tracking user ID, message ID, recipient ID (page)
- [x] Auto-truncating long messages

### 320 characters limit

At the time of writing, the [Send API](https://developers.facebook.com/docs/messenger-platform/send-api-reference) only allows up to 320 characters. We strongly recommend using a plugin like [`hubot-longtext`](https://github.com/ClaudeBot/hubot-longtext) to gracefully handle long messages.


See [`src/messenger.coffee`](src/messenger.coffee) for full documentation.


## Getting Started

Refer to [**Getting Started - Messenger Platform**](https://developers.facebook.com/docs/messenger-platform/quickstart), and [**Complete Guide - Messenger Platform**](https://developers.facebook.com/docs/messenger-platform/implementation) for more information.

The callback URL is `http://your-bot-address:8080/webhook/`.

You can test your bot locally using [ngrok](https://ngrok.com). Run `./ngrok http 8080`, and it should return a HTTPS forwarding URL (be sure to append `/webhook/` to it).

The adapter requires your _verification token_, and _access token_ to function. You can set them via environment variables. Refer to [**Configuration**](#configuration) for more information.


## Installation via NPM

```
npm install --save hubot-messenger-bot
```

Now, run Hubot with the `messenger-bot` adapter:

```
DEBUG=hubot-messenger-bot ./bin/hubot -a messenger-bot
```


## Configuration

Variable | Default | Description
--- | --- | ---
`MESSENGER_VERIFY_TOKEN` | N/A | Your bot's verification token. You can obtain one when you [create a web hook](https://developers.facebook.com/docs/messenger-platform/quickstart) to receive events for a specific page.
`MESSENGER_ACCESS_TOKEN` | N/A | Your page access token (it is based on an app, page, and user). You can find it in the _"Token Generation"_ section of your [app dashboard](https://developers.facebook.com/apps/).
