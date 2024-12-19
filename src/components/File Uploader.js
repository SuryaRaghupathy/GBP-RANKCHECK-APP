import axios from "axios";
import React, { useRef, useState, useEffect } from "react";
import "./styles.css";

const FileUploader = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDownloadReady, setIsDownloadReady] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("File selected:", file.name);
    }
  };

  const handleStartTracking = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setProgress(0); // Start from 0%

    // Simulate gradual progress from 0 to 99%
    const simulateProgress = setInterval(() => {
      setProgress((prev) => {
        if (prev < 99) {
          return prev + 1; // Increment by 1
        } else {
          clearInterval(simulateProgress); // Stop simulation at 99%
          return prev;
        }
      });
    }, 1000); // Slower increment speed for smoother progress

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        "https://gbp-rankcheck-app-backend-1.onrender.com/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            const realProgress = Math.round((event.loaded * 100) / event.total);
            if (realProgress > progress && realProgress < 100) {
              setProgress(realProgress); // Sync real progress but cap it at 99
            }
          },
        }
      );

      clearInterval(simulateProgress); // Stop simulation when upload completes
      setProgress(100); // Explicitly set to 100% only after completion
      console.log("Response from backend:", response.data);
      alert("Tracking Completed!");
      setIsDownloadReady(true);
      setResultUrl(response.data.result_url); // Store the download URL
    } catch (error) {
      clearInterval(simulateProgress); // Stop simulation on error
      console.error("Error uploading file:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to start tracking. Please check the server logs.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      window.open(resultUrl, "_blank");
    }
  };

  useEffect(() => {
    // Cleanup interval if the component unmounts
    return () => {
      setProgress(0);
    };
  }, []);

  return (
    <div className="file-uploader-container">
      {/* Logo */}
      <img
        src="/eyJwYXRoIjoiZnJvbnRpZnlcL2ZpbGVcL1NOeUh1bjkxOG5tNkwyYjg2V3k0LnN2ZyJ9_frontify_xI2deFPoD_XatyNYZwiiKWA7wwXjz_LFdsaAM3_G8FQ.png"
        alt="Logo"
        className="logo"
      />

      {/* Heading */}
      <h1 className="heading">GBP Rank Checker</h1>

      {/* Text Container */}
      <div className="text-container">
        <p className="subtext">
          Download Supported Format:{" "}
          <a
            href="/keyword_and_branch_lists.csv"
            download
            style={{ textDecoration: "none", color: "#667eea", fontWeight: "bold" }}
          >
            CSV File
          </a>
        </p>
        <p className="subtext">
          Maximum Keyword Limit - <strong>50 Keywords</strong>
        </p>
      </div>

      {/* File Uploader */}
      <div className="file-uploader">
        <div className="upload-area" onClick={handleClick}>
          {selectedFile ? (
            <p>
              <strong>Selected File:</strong> {selectedFile.name}
            </p>
          ) : (
            <>
              <p>
                <strong>Click here</strong> to upload your file
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>

      {/* Buttons */}
      <div className="button-container">
        <button
          className="start-tracking-btn"
          disabled={!selectedFile}
          onClick={handleStartTracking}
        >
          Start Tracking
        </button>
        <button
          className="download-result-btn"
          disabled={!isDownloadReady}
          onClick={handleDownload}
        >
          Download Result CSV
        </button>
      </div>

      {/* Loading Spinner & Progress Bar */}
      {isLoading && (
  <div className="loading-container">
    <p className="processing-text">Processing... Please wait</p>
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
    <p className="processing-text">{progress}% completed</p>
  </div>
)}

    </div>
  );
};

export default FileUploader;
