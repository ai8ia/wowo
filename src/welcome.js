window.onload = () => {
  const message = new SpeechSynthesisUtterance();
  message.text = "三、二、一，致富引擎啟動。探索者，歡迎登艦。";
  message.lang = "zh-TW";
  message.rate = 1;
  message.pitch = 1.1;
  speechSynthesis.speak(message);
};

