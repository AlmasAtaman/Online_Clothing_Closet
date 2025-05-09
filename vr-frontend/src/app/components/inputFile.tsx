"use client"
import useMutation from '../hooks/useMutation';
import React, { useRef, useState, ReactNode } from 'react'

type ErrorTextProps = {
    children: ReactNode;
} & React.HTMLAttributes<HTMLParagraphElement>;

const ErrorText = ({ children, ...props }: ErrorTextProps) => (
  <p className="text-red-500" {...props}>{children}</p>
);

export default function InputFile() {
  const inputRef = useRef<HTMLInputElement>(null);
  const URL = "http://localhost:8000/images";
  const {mutate: uploadImage, isLoading: uploading, error: uploadError} = useMutation({url: URL });
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
    <div className="flex flex-col items-start gap-2">
        <input
            ref={inputRef}
            id="imageInput"
            type="file"
            hidden
            onChange={handleUpload}
        />
        <label
            htmlFor="imageInput"
            className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
            {uploading ? "Uploading..." : "Upload Image"}
        </label>       
        {error && <ErrorText>{error}</ErrorText>}
        {uploadError && <ErrorText>{uploadError}</ErrorText>}
        {uploading && (
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin" />
        )}
    </div>
  );
}