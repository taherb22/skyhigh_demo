import React from "react";
import FileUpload from "./components/FileUpload";
import MessageForm from "./components/MessageForm";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">🚀 Skyhigh Demo UI</h1>
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <FileUpload />
        <div className="border-t my-6"></div>
        <MessageForm />
      </div>
    </div>
  );
}
