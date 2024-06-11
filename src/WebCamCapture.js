// src/WebcamCapture.js
import React, { useRef, useCallback, useEffect, useState } from "react";
import Webcam from "react-webcam";

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [answer, setAnswer] = useState("no");
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
              Authorization: `Bearer ya29.a0AXooCgvcQLbz9kMrnSBEvxPn2slbYNxabsAry5brjyT2HK4lo0xSK-hE4gkIRYP7hG-B5T4DnrQleXJg4iiF-QRTi9c2NlnKXVXXhj9xt7ruHlCCMQvtCSyzNTMyE8SvP22xxDH8oS856qyAnVxXPIPzw0kjDw7f9vEMsF_Amk4aCgYKAXoSARMSFQHGX2Miw7hp_P4QGBdRMppz46wMaw0178`,
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
    </div>
  );
};

export default WebcamCapture;
