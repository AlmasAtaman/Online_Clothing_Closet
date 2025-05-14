import { useEffect, useState } from "react";
import axios from "axios";


type QueryState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string;
};

const useQuery = <T =  any>(url:string) => {
    const [state, setState] = useState({
        data: null,
        isLoading: true,
        error: '',
    });

    useEffect(() => {
        const fetch = async () => {
        try {
            const { data } = await axios.get(url, { withCredentials: true });

            setState({ data, isLoading: false, error: "" });
        } catch (error: any) {
            setState({ data: null, isLoading: false, error: error.message });
        }
    };

    fetch();
  }, [url]);

  return state;
};

export default useQuery;
