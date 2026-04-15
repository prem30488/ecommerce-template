import ChatBot from "react-chatbotify";
import LlmConnector, { WebLlmProvider } from "@rcb-plugins/llm-connector";
import './settings.json'
import './styles.json'
import './styles.css'
const ChatWidget = () => {
  const flow = {
    start: {
      message: "What would you like to find out today?",
      transition: 0,
      path: "llm_example_block",
    },
    llm_example_block: {
      llmConnector: {
        provider: new WebLlmProvider({
          model: 'Qwen2-0.5B-Instruct-q4f16_1-MLC',
        }),
        outputType: 'character',
      }
    },

  }

  // necessary to embed the chatbot for it to show on the page
  const settings = {
    general: {
      embedded: false
    },
    chatHistory: {
      storageKey: "example_multiple_themes"
    },
  }

  return (
    <ChatBot plugins={[LlmConnector()]} flow={flow} settings={settings} />
  );
};
export default ChatWidget;
