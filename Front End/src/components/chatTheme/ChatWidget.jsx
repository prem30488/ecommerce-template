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

  // themes available for browsing at: https://react-chatbotify.com
  const themes = [
    // { id: "tropical_green", version: "0.1.0" }
    { id: "solid_purple_haze", version: "0.1.0" },
    { id: "simple_blue", version: "0.1.0" }
  ]

  return (
    <ChatBot plugins={[LlmConnector()]} flow={flow} themes={themes} settings={settings} />
  );
};
export default ChatWidget;
