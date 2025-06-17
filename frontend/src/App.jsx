import { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !language) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResponse(res.data);
      console.log("API Response:", res.data); // 👈 This should show translated text

    } catch (err) {
      alert('Error uploading file');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-6 text-orange-600">Audio Translator</h1>
        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="text"
            placeholder="Translate to (e.g., Hindi)"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full"
          />
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            {loading ? 'Translating...' : 'Upload & Translate'}
          </button>
        </form>

        {response && (
          <div className="mt-6 bg-gray-100 p-4 rounded text-sm">
            <p><strong>Transcript:</strong> {response.transcript}</p>
            <p className="mt-2"><strong>Translation:</strong> {response.translation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
