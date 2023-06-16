import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';

const App: React.FC = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [annoyance, setAnnoyance] = useState<boolean | null>(null);

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

  const handlePostRequestCV = async () => {
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

  const handlePostRequestML = async () => {
    if (text.length > 0) {
      const data = {
        "Inputs": {
          "input1": [
            {
              "text": text
            }
          ]
        },
        "GlobalParameters": {},
        "configuration": {
          "ingress": {
            "external": true,
            "targetPort": 80,
            "transport": "auto",
            "corsPolicy": {
              "allowedOrigins": ["*"]
            }
          }
        }
      };

      const body = JSON.stringify(data);

      const url = 'http://d74a7591-5954-4aaf-8624-13e38c7f0304.westeurope.azurecontainer.io/score';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 1ccaKPtU1D9Bk2wKWQLqoVvjQs8fyEjQ'
      };

      axios.post(url, body, { headers })
        .then((response) => {
          const prediction = response.data
          let result: number = prediction["Results"]["WebServiceOutput0"][0]
          if (result === 1) {
            setAnnoyance(true)
          }
          else {
            setAnnoyance(false)
          }
        })
        .catch((error) => {
          // Handle the error here
          console.error(error);
        });
      setText("");
    }
  };

  return (
    <div className='App'>
      <div className='Upload'>
        <div className='Input'>
          <input type="file" accept="image/*" onChange={handleImageUpload} multiple style={{ display: 'none' }} id="select-image" />
          <label htmlFor="select-image">
            <Fab
              color="secondary"
              size="small"
              component="span"
              aria-label="add"
              variant="extended"
            >
              <AddIcon /> Upload photo
            </Fab>
          </label>
          <TextField placeholder='Input text' id="standard-basic" label="Text Heard" variant="standard" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className='Images'>
          {imageUrls.map((url, index) => (
            // eslint-disable-next-line
            <img key={index} src={url} alt={`Image ${index}`} className='Image' />
          ))}
        </div>
      </div>
      <div className='Buttons'>
        <div className='Column'>
          <div className='Button'>
            <Button variant="contained" onClick={handlePostRequestCV} disabled={imageUrls.length === 0}>
              Send request to Custom Vision
            </Button>
          </div>
          <div className='Prediction'>
            <div>
              {currentImageUrl !== '' && <img src={currentImageUrl} alt="Current" className='Image' />}
            </div>
            <div>
              {prediction}
            </div>
          </div>
        </div>
        <div className='Column'>
          <div className='Button'>
            <Button variant="contained" onClick={handlePostRequestML} disabled={text.length === 0}>
              Send request to Azure Machine Learning
            </Button>
          </div>
          <div className='Prediction'>
            <div>
              {annoyance != null && (annoyance ? <p>Annoyed</p> : <p>Not annoyed</p>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;