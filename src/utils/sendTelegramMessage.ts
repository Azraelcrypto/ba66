import axios from 'axios';

const sendTelegramMessage = async (message: string) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
    });
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
};

export default sendTelegramMessage;
