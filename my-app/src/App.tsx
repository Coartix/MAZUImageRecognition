import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App: React.FC = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files as FileList;

    if (files.length !== 0) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.readAsDataURL(files[i]);

        reader.onloadend = () => {
          const imageUrl = reader.result as string;
          setImageUrls((prevUrls) => [...prevUrls, imageUrl]);
        };
      }
    }
  };

  const handlePostRequest = async () => {
    if (imageUrls.length > 0) {
      const imageUrl = imageUrls[0];
      setCurrentImageUrl(imageUrl);
      // Remove the first image URL from the array
      setImageUrls((prevUrls) => prevUrls.slice(1));
      const body = await fetch(imageUrl).then((response) => response.blob());

      const url = 'https://20230607fermazu-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/bbbaa189-7fd9-42a6-a7f3-50d7b9081a38/classify/iterations/Iteration2/image';
      const headers = {
        'Prediction-Key': '4e82922e76964b33b8da5ad80b270a7f',
        'Content-Type': 'application/octet-stream',
      };

      axios.post(url, body, { headers })
        .then((response) => {
          const predictions = response.data.predictions
          let most_likely_class: string = ""
          let likelihood: number = 0

          predictions.forEach((predicted_class: { [x: string]: any; }) => {
            if (predicted_class["probability"] > likelihood) {
              likelihood = predicted_class["probability"]
              most_likely_class = predicted_class["tagName"]
            }
          })
          setPrediction(most_likely_class)
        })
        .catch((error) => {
          // Handle the error here
          console.error(error);
        });
    }
  };

  return (
    <div className='App'>
      <div className="Images">
        <div>
          <input type="file" accept="image/*" onChange={handleImageUpload} multiple />
        </div>
        <div>
          {imageUrls.map((url, index) => (
            // eslint-disable-next-line
            <img key={index} src={url} alt={`Image ${index}`} />
          ))}
        </div>
      </div>
      <div className='Button'>
        <button onClick={handlePostRequest} disabled={imageUrls.length === 0}>
          Send POST Request
        </button>
      </div>
      <div className='Prediction'>
        <div>
          {currentImageUrl !== '' && <img src={currentImageUrl} alt="Current" />}
        </div>
        <div>
          {prediction}
        </div>
      </div>
    </div>
  );
};

export default App;