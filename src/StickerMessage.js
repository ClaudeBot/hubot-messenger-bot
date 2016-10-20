const Message = require('hubot').Message;

class StickerMessage extends Message {
  constructor(user, attachment) {
    super(user);
    this.type = 'sticker';
    // TODO: check attachment structure
    // this.stickerUrl = attachment.xxx;
    // this.stickerId = attachment.yyy;
  }

  toString() {
    return this.stickerUrl;
  }
}

module.exports = {
  StickerMessage
};
