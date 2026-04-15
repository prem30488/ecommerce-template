class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      this.actionProvider.handleHello();
    } else {
      this.actionProvider.handleDefault();
    }
  }
}

export default MessageParser;
