import './App.css'
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {

  const navigate = useNavigate();

  // this is the url which we are going to send to the backend to be shortened ,   
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [shortUrl,setShortUrl] = useState<string|null>(null);

  const handleSubmit = async (e: React.FormEvent, url: string) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_ENV_BASE_URL}/postUrl`, { url });
      console.log(response);
      setShortUrl(response?.data?.msg?.shortenedURL?.newUrl)

    } catch (err) {
      setError("Server error..");
    }

    setLoading(false);

  }

  function copyShortUrl(shortUrl: string) {
    navigator.clipboard.writeText(shortUrl)
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6'>
      <h1 className='text-4xl font-bold mb-6 text-gray-800'>URL-Shortener</h1>

      {/* Card */}
      <div className='bg-white shadow-xl rounded-xl p-6 w-full max-w-2xl'>
        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, url)} className='flex flex-col gap-4'>
          <input type='text'
            placeholder="Paste your long url here...."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className='w-full p-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-400 outline-none'
          />
          <button type="submit" className='bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg font-medium transition-all shadow-md'>{loading ? "Processing..." : "Shorten URL"}</button>
        </form>

        {/* Error */}
        {error && (
          <p className='text-red-500 mt-3 text-center'>{error}</p>
        )}
      </div>

      {/* Output */}
      {shortUrl && (
        <div className='mt-6 p-4 bg-gray-50 border rounded-xl shadow-inner'>

          <p className='text-gray-700 mb-2'>
            <span className='font-semibold'>Short URL:</span>
          </p>
         
          {/* <div>shortened URL : <p onClick={() => {navigate(url);console.log("clicked")}} className='bg-blue-400' >{shortUrl}</p></div> */}
          <div className='flex items-center justify-between bg-white px-4 py-3 rounded-xl border shadow-sm'>
            <div className='text-blue-600 font-semibold cursor-pointer' onClick={() => navigate(`${shortUrl}`)} >{shortUrl}</div>
            <button onClick={() => copyShortUrl(shortUrl!)} className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-all shadow'>Copy</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App;