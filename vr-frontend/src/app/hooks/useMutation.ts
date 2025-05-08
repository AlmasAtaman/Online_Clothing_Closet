import axios from 'axios';
import { useState } from "react";

type UseMutationArgs = {
  url: string;
  method?: "POST";
};

type MutationState = {
  isLoading: boolean;
  error: string;
};

const useMutation = ({ url, method = "POST" }: UseMutationArgs) => {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: "",
  });

  const fn = async (data: any) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
    }));

    try {
      await axios({ 
        url, 
        method, 
        data,
        headers: {
          "x-user-id": "123", // replace with real user ID later
          "Content-Type": "multipart/form-data",
        } 
      });
      setState({ isLoading: false, error: "" });
    } catch (error: any) {
      setState({
        isLoading: false,
        error: error.message,
      });
    }
  };

  return { mutate: fn, ...state };
};

export default useMutation;
