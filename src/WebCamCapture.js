// src/WebcamCapture.js
import React, { useRef, useCallback, useEffect, useState } from "react";
import Webcam from "react-webcam";
const wateraskarray = [
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
];
const waterthanksarray2 = [
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
];
const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [answer, setAnswer] = useState("no");
  const [audioSrc, setAudioSrc] = useState(null);
  let counterNo = 0;
  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      try {
        const response = await fetch(
          "https://us-central1-aiplatform.googleapis.com/v1/projects/streamingai-33a74/locations/us-central1/publishers/google/models/imagetext:predict",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ya29.a0AXooCgv3T-2OHrC_rih2QQufVhmbEBgToj5LujgcZ444wQDrGxn0WIIqKXUNAb4KIoBsoUnEe0ntaUb-b2_xLsRP2ImuMQlEf-7YewDSbIHvF03k84Gty9pZBEjRBSIY42PfqA1gb-i_bjWLSUG3ZPvYn_SqxjW0XXEFstN7C1MaCgYKAVQSARMSFQHGX2MiHmzJbPQSH8bUmSxoNBBBnQ0178`,
            },

            body: JSON.stringify({
              instances: [
                {
                  prompt:
                    "Does a person on the photo drink water? Answer with only yes or no",
                  image: {
                    bytesBase64Encoded: imageSrc.split(",")[1],
                  },
                },
              ],
              parameters: {
                sampleCount: 1,
                language: "en",
              },
            }),
          }
        );

        if (!response.ok) {
          console.log(response);
          throw new Error("Network response was not ok");
        }
        const answer = await response.json();
        if (answer.predictions[0] === "no") {
          console.log("no encountered ", counterNo + 1);
          counterNo = counterNo + 1;
        }
        if (counterNo >= 1) {
          const randomIndex = Math.floor(Math.random() * wateraskarray.length);

          const payload = {
            input: {
              text: wateraskarray[randomIndex],
            },
            voice: {
              languageCode: "en-gb",
              name: "en-GB-Standard-A",
              ssmlGender: "FEMALE",
            },
            audioConfig: {
              audioEncoding: "MP3",
            },
          };

          const result2 = await fetch(
            "https://texttospeech.googleapis.com/v1/text:synthesize",
            {
              method: "POST",
              headers: {
                Authorization:
                  "Bearer ya29.a0AXooCgv3T-2OHrC_rih2QQufVhmbEBgToj5LujgcZ444wQDrGxn0WIIqKXUNAb4KIoBsoUnEe0ntaUb-b2_xLsRP2ImuMQlEf-7YewDSbIHvF03k84Gty9pZBEjRBSIY42PfqA1gb-i_bjWLSUG3ZPvYn_SqxjW0XXEFstN7C1MaCgYKAVQSARMSFQHGX2MiHmzJbPQSH8bUmSxoNBBBnQ0178",
                "x-goog-user-project": "streamingai-33a74",
                "Content-Type": "application/json; charset=utf-8",
              },
              body: JSON.stringify(payload),
            }
          );

          if (!result2.ok) {
            console.log(result2);
            throw new Error("Network response was not ok");
          }
          const answer2 = await result2.json();
          const audioContent = answer2.audioContent;

          // Convert base64 audio content to a blob URL
          const audioBlob = new Blob(
            [Uint8Array.from(atob(audioContent), (c) => c.charCodeAt(0))],
            { type: "audio/mp3" }
          );
          const audioUrl = URL.createObjectURL(audioBlob);
          counterNo = 0;
          setAudioSrc(audioUrl);
          console.log(answer2);
        } else {
          setAnswer(answer.predictions);
        }
        if (answer.predictions[0] === "yes") {
          const randomIndex = Math.floor(Math.random() * wateraskarray.length);
          const payload1 = {
            input: {
              text: waterthanksarray2[randomIndex],
            },
            voice: {
              languageCode: "en-gb",
              name: "en-GB-Standard-A",
              ssmlGender: "FEMALE",
            },
            audioConfig: {
              audioEncoding: "MP3",
            },
          };
          const result2 = await fetch(
            "https://texttospeech.googleapis.com/v1/text:synthesize",
            {
              method: "POST",
              headers: {
                Authorization:
                  "Bearer ya29.a0AXooCgv3T-2OHrC_rih2QQufVhmbEBgToj5LujgcZ444wQDrGxn0WIIqKXUNAb4KIoBsoUnEe0ntaUb-b2_xLsRP2ImuMQlEf-7YewDSbIHvF03k84Gty9pZBEjRBSIY42PfqA1gb-i_bjWLSUG3ZPvYn_SqxjW0XXEFstN7C1MaCgYKAVQSARMSFQHGX2MiHmzJbPQSH8bUmSxoNBBBnQ0178",
                "x-goog-user-project": "streamingai-33a74",
                "Content-Type": "application/json; charset=utf-8",
              },
              body: JSON.stringify(payload1),
            }
          );

          if (!result2.ok) {
            console.log(result2);
            throw new Error("Network response was not ok");
          }
          const answer2 = await result2.json();
          const audioContent = answer2.audioContent;

          // Convert base64 audio content to a blob URL
          const audioBlob = new Blob(
            [Uint8Array.from(atob(audioContent), (c) => c.charCodeAt(0))],
            { type: "audio/mp3" }
          );
          const audioUrl = URL.createObjectURL(audioBlob);
          counterNo = 0;
          setAudioSrc(audioUrl);
        }
        setAnswer(answer.predictions);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    }
  }, [webcamRef, setAnswer]);

  useEffect(() => {
    const interval = setInterval(capture, 5000);
    return () => clearInterval(interval);
  }, [capture]);

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="100%"
        height="auto"
      />
      <text>{answer}</text>
      {audioSrc && <audio autoPlay src={audioSrc}></audio>}
    </div>
  );
};

export default WebcamCapture;
