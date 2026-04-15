import { createChatBotMessage } from 'react-chatbot-kit';

const botName = 'TikTokBot';

const config = {
  initialMessages: [createChatBotMessage(`Hi! I'm ${botName}. How can I help you today?`)],
  botName: botName,
  customStyles: {
    botMessageBox: {
      backgroundColor: '#376B7E',
    },
    chatButton: {
      backgroundColor: '#5ccc9d',
    },
  },
};

export default config;
