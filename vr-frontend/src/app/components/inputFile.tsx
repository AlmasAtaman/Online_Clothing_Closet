"use client"
import useQuery from '../hooks/useQuery';
import useMutation from '../hooks/useMutation';
import React, { useRef, useState, ReactNode } from 'react'


type ErrorTextProps = {
    children: ReactNode;
};

const ErrorText = ({ children }: ErrorTextProps) => (
    <p className="text-red-500" {...props}>{children}</p>
  );


export default function InputFile() {
  const inputRef = useRef<HTMLInputElement>(null);
  const URL = "http://localhost:8000/images";
  const  {mutate: uploadImage, isLoading: uploading, error: uploadError} = useMutation({url: URL });
  const {data: imageUrls=[], isLoading: imageLoading, error:fetchError} = useQuery(URL);
  const [error, setError] = useState('');

  const validFileTypes = ['image/jpg', 'image/jpeg', 'image/png']



  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(file);

    if (file && !validFileTypes.includes(file.type)) {
        setError("File must be JPG or PNG format");
        return;
      } else {
        setError('');
      }

    if (!file) return;
    const form = new FormData();
    form.append('image', file);

    await uploadImage(form);
  };



    return (
        <>
            <input
            ref={inputRef}
            id="imageInput"
            type="file"
            hidden
            onChange={handleUpload}
            />
            <label
            htmlFor="imageInput"
            className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded"
            >
            {uploading ? "Uploading..." : "Upload Image"}
            </label>       
            {error && <ErrorText>{error}</ErrorText>}
            {uploadError && <ErrorText>{uploadError}</ErrorText>}
            {fetchError && (<ErrorText textAlign="left">Failed to Load Objects</ErrorText>)}

        </>
    );

}