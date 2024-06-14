import React, { useRef, useCallback, useEffect, useState } from "react";
import Webcam from "react-webcam";
import "./WebcamCapture.css"; // Импорт CSS файла

const phrases = {
  en: {
    ask: [
      "Don't forget to drink some water!",
      "Stay hydrated, have a glass of water.",
      "Remember to sip some water throughout the day.",
      "How about a refreshing glass of water?",
      "Your body needs water, take a drink!",
      "Quench your thirst with some water.",
      "A glass of water will do you good.",
      "Time to hydrate, drink some water.",
      "Keep yourself hydrated, have some water.",
      "A quick water break could be just what you need.",
    ],
    thanks: [
      "Thank you for taking care of yourself and drinking water!",
      "I appreciate you staying hydrated!",
      "Thanks for making hydration a priority!",
      "Thank you for drinking water and staying healthy.",
      "I'm glad you had some water, thank you!",
      "Thanks for keeping yourself hydrated!",
      "Your health is important, thank you for drinking water!",
      "Thanks for sipping on some water!",
      "I appreciate you for drinking water and staying refreshed!",
      "Thank you for making the healthy choice to drink water!",
    ],
  },
  ru: {
    ask: [
      "Не хочешь выпить стакан воды?",
      "Тебе не нужна вода? Могу налить.",
      "Может, выпьешь немного воды?",
      "Хочешь стакан воды?",
      "Не хочешь освежиться водой?",
      "Как насчёт воды? Я могу принести.",
      "Тебе нужно что-нибудь попить? Воды, например?",
      "Ты не хочешь воды? Здесь есть свежая.",
      "Выпей немного воды, если хочешь.",
      "Тебе не нужна вода? Могу налить холодной.",
    ],
    thanks: [
      "Спасибо, что выпили воды!",
      "Благодарю, что согласились выпить воду.",
      "Спасибо, что утолили жажду.",
      "Мы рады, что вы выпили воды.",
      "Спасибо, что позаботились о себе и выпили воду.",
      "Благодарим за то, что выпили воды.",
      "Спасибо, что приняли наше предложение и выпили воду.",
      "Мы очень благодарны, что вы выпили воды.",
      "Спасибо, что поддержали наш совет и выпили воду.",
      "Благодарим, что утолили жажду с помощью воды.",
    ],
  },
};

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [answer, setAnswer] = useState("no");
  const [language, setLanguage] = useState("en");
  const [audioSrc, setAudioSrc] = useState(null);
  const [hydrationReminderCounter, setHydrationReminderCounter] = useState(0);

  const getRandomPhrase = (type) => {
    const phrasesArray = phrases[language][type];
    const randomIndex = Math.floor(Math.random() * phrasesArray.length);
    return phrasesArray[randomIndex];
  };

  const fetchAudio = async (text) => {
    const payload = {
      input: { text },
      voice: {
        languageCode: language === "en" ? "en-GB" : "ru-RU",
        name: language === "en" ? "en-GB-Wavenet-D" : "ru-RU-Wavenet-D",
        ssmlGender: "FEMALE",
      },
      audioConfig: { audioEncoding: "MP3" },
    };

    const response = await fetch(
      "https://texttospeech.googleapis.com/v1/text:synthesize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer YOUR_ACCESS_TOKEN`, // Замените на ваш реальный токен доступа
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) throw new Error("Сетевой ответ был неудачным");

    const answer = await response.json();
    const audioContent = answer.audioContent;
    const audioBlob = new Blob(
      [Uint8Array.from(atob(audioContent), (c) => c.charCodeAt(0))],
      { type: "audio/mp3" },
    );
    return URL.createObjectURL(audioBlob);
  };

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const response = await fetch(
        "https://us-central1-aiplatform.googleapis.com/v1/projects/streamingai-33a74/locations/us-central1/publishers/google/models/imagetext:predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer YOUR_ACCESS_TOKEN`, // Замените на ваш реальный токен доступа
          },
          body: JSON.stringify({
            instances: [
              {
                prompt:
                  "Does a person on the photo drink water? Answer with only yes or no",
                image: { bytesBase64Encoded: imageSrc.split(",")[1] },
              },
            ],
            parameters: { sampleCount: 1, language },
          }),
        },
      );

      if (!response.ok) throw new Error("Сетевой ответ был неудачным");

      const result = await response.json();
      const prediction = result.predictions[0];

      if (prediction === "no") {
        setHydrationReminderCounter((prev) => prev + 1);
      } else {
        setHydrationReminderCounter(0);
        const thanksText = getRandomPhrase("thanks");
        const audioUrl = await fetchAudio(thanksText);
        setAudioSrc(audioUrl);
      }

      if (hydrationReminderCounter >= 1) {
        const reminderText = getRandomPhrase("ask");
        const audioUrl = await fetchAudio(reminderText);
        setAudioSrc(audioUrl);
      }

      setAnswer(prediction);
    } catch (error) {
      console.error("Проблема с операцией fetch:", error);
    }
  }, [webcamRef, setAnswer, language, hydrationReminderCounter]);

  useEffect(() => {
    const interval = setInterval(capture, 5000);
    return () => clearInterval(interval);
  }, [capture]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ru" : "en"));
  };

  return (
    <div className="webcam-container">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="webcam"
      />
      <div className="controls">
        <button className="language-toggle" onClick={toggleLanguage}>
          {language === "en" ? "Переключить на русский" : "Switch to English"}
        </button>
        <div className="status">
          {answer === "yes" ? "Гидратирован" : "Нужна вода"}
        </div>
        {audioSrc && <audio autoPlay src={audioSrc} />}
      </div>
    </div>
  );
};

export default WebcamCapture;
