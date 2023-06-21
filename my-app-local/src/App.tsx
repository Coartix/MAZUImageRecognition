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

      const url = 'http://127.0.0.1/image';
      const headers = {
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

  const makeExternalRequest = async () => {
    if (text.length !== 0) {
      const url = 'http://127.0.0.1/make-external-request'; // Update the URL with your Python server's address
      const headers = {
        'Content-Type': 'application/json'
      };

      const data = {
        // Request data to be sent to the Python server
        "Inputs": {
          "input1": [
            {
              "text": text
            }
          ]
        },
        "GlobalParameters": {}
      };

      axios.post(url, data, { headers }).then((response) => {
        console.log(response.data);
        const prediction = response.data
        let result: number = prediction["Results"]["WebServiceOutput0"][0]
        if (result === 1) {
          setAnnoyance(true)
        }
        else {
          setAnnoyance(false)
        }
      }).catch((error) => {
        // Handle error
        console.log(error);
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
            <Button variant="contained" onClick={makeExternalRequest} disabled={text.length === 0}>
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