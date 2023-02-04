import logo from './logo.svg';
import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
//import initSqlJs from "sql.js";
import './App.css';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { doc, setDoc } from "firebase/firestore"; 

var saved = [];
var files;

const firebaseConfig = {
  // Add your firebase config files here!
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

// Not used
function toSQL(name, value) {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (name TEXT, value TEXT);
    INSERT INTO users (name, value)
    VALUES (`${name}, ${value}`);
  `;
  db.run(sql);

  const data = db.export();
  localStorage.setItem('database', new Uint8Array(data));
}

async function toFirebase(files) {
  await Promise.all(files.map(async file => {
    return new Promise(resolve => {
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onloadend = function() {
        let bytes = new Uint8Array(fileReader.result);
        console.log(bytes);
        let decoder = new TextDecoder();
        let str = decoder.decode(bytes);
        setDoc(doc(db, "files", file.path), {
          name: file.path,
          value: str
        });
        resolve();
      };
    });
  }));
}

function App() {
  const onDrop = useCallback(acceptedFiles => {
    let formData = new FormData();
    formData.append(`uploadedFiles`, acceptedFiles);
    const filenames = acceptedFiles.map(file => (file.path));
    saved.push(...filenames);
    console.log(saved);
    files = saved.map(file => (
      <li key={file}>
        {file}
      </li>
    ));
    console.log(files);
    toFirebase(acceptedFiles);
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  return (
    <div className="bg-[url('contours.svg')]">
      <div className="flex text-5xl justify-center m-[20px]">
        File Upload Form
      </div>
      <div {...getRootProps()} className="flex border-2 border-dashed .border-white m-[30px] mx-w-[700px] min-h-[250px] w-full justify-center items-center">
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p className="justify-center">Drop the files here... </p> :
            <p>Drag and drop files here, or click to select some files from your computer!</p>
        }
      </div>
      <div className="flex justify-center text-base font-mono">
        <ul> {files} </ul>
      </div>
    </div>
  );
}

export default App;
