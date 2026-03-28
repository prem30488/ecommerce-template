// FileUploader.js
import React, { useCallback, useState , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { API_BASE_URL } from '../../../../constants';
import Alert from 'react-s-alert';
const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16
  };
  
  const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box'
  };
  
  const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
  };
  
  const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
  };

const FileUploader = ({maxNoFiles,onSave, onCancel}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  let fileURL = '';
  const onDropFn = useCallback((acceptedFiles) => {
    
    
    setUploadedFiles(acceptedFiles.map(file => Object.assign(file, {
    preview: URL.createObjectURL(file)
  })));


// Filter out files if the total exceeds 5,maxNoFiles
const newFiles = acceptedFiles.slice(0, maxNoFiles - uploadedFiles.length);
//setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);

// Upload files to the server
newFiles.forEach((file) => {
  const formData = new FormData();
    
  formData.append('file', file);
    
  const token = localStorage.getItem('accessToken');
  
  axios.post( API_BASE_URL + '/api/testimonial/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer ' + token,
    },
    onUploadProgress: (progressEvent) => {
      const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      setUploadProgress(progress);
    },
  })
    .then((response) => {
      console.log('File uploaded successfully:', response.data);
      
      fileURL=response.data;
      onSave(fileURL);
    })
    .catch((error) => {
      console.error('Error uploading file:', error);
      // Handle upload error
    });
    
});
}, [uploadedFiles]);

  const {getRootProps, getInputProps} = useDropzone({
    accept: 'image/png', maxFiles: maxNoFiles,
    onDrop: onDropFn
  });
  
  const thumbs = uploadedFiles.map(file => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img
          src={file.preview}
          style={img}
          // Revoke data uri after image is loaded
          onLoad={() => { URL.revokeObjectURL(file.preview) }}
        />
      </div>
    </div>
  ));
  const removeFile = file => () => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(newFiles.indexOf(file), 1);
    setUploadedFiles(newFiles);
  }

  const removeAll = () => {
    setUploadedFiles([]);
    onSave('removeAll');
  }

  const files = uploadedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes{" "}
      <button onClick={removeFile(file)}>Remove File</button>
    </li>
  ))

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
  }, []);


 // const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/png', maxFiles: 5 });

  return (
    <div>
      <div {...getRootProps()} style={dropzoneStyles}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop PNG files here, or click to select files (max {maxNoFiles}).</p>
      </div>
      {uploadedFiles.length > 0 && (
        <div>
          <h2>Uploaded Files:</h2>
          <ul>
            {uploadedFiles.map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
          {uploadProgress > 0 && (
            <div>
              <h2>Upload Progress: {uploadProgress}%</h2>
              <progress value={uploadProgress} max="100" />
            </div>
          )}
        </div>
      )}
      <section className="container">
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside style={thumbsContainer}>
        {thumbs}
      </aside>
      {files}
      {files.length > 0 && <button onClick={removeAll}>Remove All</button>}
    </section>
    </div>
  );
};

const dropzoneStyles = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
};

export default FileUploader;
