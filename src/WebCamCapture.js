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
              Authorization: `Bearer ya29.a0AXooCgsKE0x6s3pWgBErbBU7ZTalRgl4DoQUaH38FIa1Qva4PNpoUhfb7HWF8v4dnSURfx1FOrSwmxyFo1-zi0HBdoIB9hIXDRCZYejNM0kJIX5xYkoUcNmylspdMuDuzZ5pvTxTHuRr9hkBZqAnoRwR3W1_RgTWYDzFu0ouM1oaCgYKAfcSARMSFQHGX2MiwhsC8kPSf47WmaSBTiIWXA0178`,
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
