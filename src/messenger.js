/* eslint-disable import/no-unresolved, consistent-return */
const Adapter = require('hubot').Adapter;
const TextMessage = require('hubot').TextMessage;
const get = require('lodash/get');

class Messenger extends Adapter {
  constructor(robot) {
    super();
    this.robot = robot;
    this.verifyToken = process.env.MESSENGER_VERIFY_TOKEN;
    this.accessToken = process.env.MESSENGER_ACCESS_TOKEN;
    this.apiURL = 'https://graph.facebook.com/v2.6';
    this.robot.logger.info('hubot-messenger-bot: Adapter loaded.');
  }

  subscribe() {
    const subscribeURL = `${this.apiURL}/me/subscribed_apps?access_token=${this.accessToken}`;
    return this.robot.http(subscribeURL).post()((err, httpRes, body) => {
      if (err || httpRes.statusCode !== 200) {
        this.robot.logger.error(`hubot-messenger-bot: error subscribing app to page - ${body} ${httpRes.statusCode} (${err})`);
      }
      this.robot.logger.info('hubot-messenger-bot: Subscribed app to page.', body);
    });
  }

  createUser(userId, roomId, cb) {
    const profileURL = `${this.apiURL}/${userId}?fields=first_name,last_name&access_token=${this.accessToken}`;
    return this.robot.http(profileURL).get()((err, httpRes, body) => {
      if (err || httpRes.statusCode !== 200) {
        this.robot.logger.error(`hubot-messenger-bot: error getting profile - ${body} ${httpRes.statusCode} (${err})`);
      }
      const _user = JSON.parse(body);
      const _userName = `${_user.first_name} ${_user.last_name}`;
      return cb(this.robot.brain.userForId(userId, {
        name: _userName,
        room: roomId,
      }));
    });
  }

  processTextMsg(msg, text) {
    const _sender = msg.sender.id;
    const _recipient = msg.recipient.id;
    const _mid = msg.message.mid;
    const _text = text;

    this.createUser(_sender, _recipient, user => {
      const message = new TextMessage(user, _text.trim(), _mid);
      return this.receive(message);
    });
  }

  processAttachmentMsg(msg, attachmentType) {
    const _sender = msg.sender.id;
    const _recipient = msg.recipient.id;
    const _mid = msg.message.mid;
    const _text = `${attachmentType}`;

    this.createUser(_sender, _recipient, user => {
      const message = new TextMessage(user, _text.trim(), _mid);
      return this.receive(message);
    });
  }

  processPayload(msg, payload) {
    const _sender = msg.sender.id;
    const _recipient = msg.recipient.id;
    const _text = payload;

    this.createUser(_sender, _recipient, user => {
      const message = new TextMessage(user, _text.trim());
      return this.receive(message);
    });
  }

  processDelivery(msg, text) {
    const _sender = msg.sender.id;
    const _recipient = msg.recipient.id;
    const _mids = msg.delivery.mids;
    const _text = text;

    this.createUser(_sender, _recipient, user => {
      const message = new TextMessage(user, _text.trim(), _mids);
      return this.receive(message);
    });
  }

  processMsg(msg) {
    const text = get(msg, 'message.text');
    const attachmentType = get(msg, 'message.attachments[0].type'); // image, audio, video, file or location
    const payload = get(msg, 'postback.payload'); // USER_DEFINED_PAYLOAD
    const delivery = get(msg, 'delivery');

    if (text) {
      return this.processTextMsg(msg, text);
    } else if (attachmentType) {
      return this.processAttachmentMsg(msg, attachmentType);
    } else if (payload) {
      return this.processPayload(msg, payload);
    } else if (delivery) {
      return this.processDelivery(msg, 'Message Delivered Callback');
    }
    return;
  }

  sendButtonMsg(context, text, buttons) {
    const data = JSON.stringify({
      recipient: {
        id: context.user.id,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: text.substring(0, 320),
            buttons,
          },
        },
      },
    });

    this.robot.http(`${this.apiURL}/me/messages?access_token=${this.accessToken}`)
      .header('Content-Type', 'application/json').post(data)((err, httpRes, body) => {
        if (err || httpRes.statusCode !== 200) {
          return this.robot.logger.error(`hubot-messenger-bot: error sending message - ${body} ${httpRes.statusCode} (${err})`);
        }
        return this.robot.logger.info('hubot-messenger-bot: post successed!');
      });
  }

  sendTextMsg(context, text) {
    const data = JSON.stringify({
      recipient: {
        id: context.user.id,
      },
      message: {
        text: text.substring(0, 320),
      },
    });

    this.robot.http(`${this.apiURL}/me/messages?access_token=${this.accessToken}`)
      .header('Content-Type', 'application/json').post(data)((err, httpRes, body) => {
        if (err || httpRes.statusCode !== 200) {
          return this.robot.logger.error(`hubot-messenger-bot: error sending message - ${body} ${httpRes.statusCode} (${err})`);
        }
        return this.robot.logger.info('hubot-messenger-bot: post successed!');
      });
  }

  sendQuickReplyMsg(context, text, quickReplies) {
    const data = JSON.stringify({
      recipient: {
        id: context.user.id,
      },
      message: {
        text: text.substring(0, 320),
        quick_replies: quickReplies,
      },
    });

    this.robot.http(`${this.apiURL}/me/messages?access_token=${this.accessToken}`)
      .header('Content-Type', 'application/json').post(data)((err, httpRes, body) => {
        if (err || httpRes.statusCode !== 200) {
          return this.robot.logger.error(`hubot-messenger-bot: error sending message - ${body} ${httpRes.statusCode} (${err})`);
        }
        return this.robot.logger.info('hubot-messenger-bot: post successed!');
      });
  }

  send(envelope, para) {
    const type = para.type;
    const text = para.text;

    switch (type) {
      case 'button':
        return this.sendButtonMsg(envelope, text, para.buttons);
      case 'text':
        return this.sendTextMsg(envelope, text);
      case 'quick_replies':
        return this.sendQuickReplyMsg(envelope, text, para.quick_replies);
      default:
        return;
    }
  }

  reply(envelope, ...strings) {
    return this.sendMsg(envelope, `${envelope.user.name}; ${strings.join('\n')}`);
  }

  run() {
    if (!this.verifyToken) {
      this.emit('error', new Error('You must configure the MESSENGER_VERIFY_TOKEN environment variable.'));
    }
    if (!this.accessToken) {
      this.emit('error', new Error('You must configure the MESSENGER_ACCESS_TOKEN environment variable.'));
    }

    this.robot.router.get('/webhook/', (req, res) => {
      if (req.query['hub.verify_token'] === this.verifyToken) {
        res.send(req.query['hub.challenge']);
      }
      this.robot.logger.warning('hubot-messenger-bot: Wrong validation token.');
      res.send('Error, wrong validation token');
    });

    this.robot.router.post('/webhook/', (req, res) => {
      const msgEvents = req.body.entry[0].messaging;
      let msgEvent;
      for (let i = 0, len = msgEvents.length; i < len; i++) {
        msgEvent = msgEvents[i];
        this.processMsg(msgEvent);
      }
      return res.send(200);
    });
    this.robot.logger.info('hubot-messenger-bot: Adapter running.');
    return this.emit('connected');
  }
}

module.exports.use = robot => new Messenger(robot);
