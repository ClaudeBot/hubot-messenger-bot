const Message = require('hubot').Message;

class StickerMessage extends Message {
  /* eslint-disable no-unused-vars */
  constructor(user, attachment) {
    super(user);
    this.type = 'sticker';
    // TODO: check attachment structure
    // this.stickerUrl = attachment.xxx;
    // this.stickerId = attachment.yyy;
  }
  /* eslint-enable no-unused-vars */

  toString() {
    return this.stickerUrl;
  }
}

module.exports = {
  StickerMessage,
};
