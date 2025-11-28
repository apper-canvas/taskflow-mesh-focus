import React, { useEffect, useRef, useState, useMemo } from 'react';

const ApperFileFieldComponent = ({ elementId, config }) => {
  // State for UI-driven values
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for tracking lifecycle and preventing memory leaks
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);
  
  // Update elementId ref when it changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);
  
  // Memoize existingFiles to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    if (!config?.existingFiles) return [];
    
    // Check if files have actually changed
    const currentFiles = config.existingFiles;
    const previousFiles = existingFilesRef.current;
    
    // If array lengths differ or first file ID differs, it's a different set
    if (currentFiles.length !== previousFiles.length || 
        (currentFiles.length > 0 && previousFiles.length > 0 && 
         (currentFiles[0].Id !== previousFiles[0].Id && currentFiles[0].id !== previousFiles[0].id))) {
      return currentFiles;
    }
    
    return previousFiles;
  }, [config?.existingFiles]);
  
  // Initial Mount Effect
  useEffect(() => {
    let mounted = true;
    
    const initializeSDK = async () => {
      try {
        // Wait for ApperSDK to be available (50 attempts × 100ms = 5 seconds max)
        for (let i = 0; i < 50; i++) {
          if (window.ApperSDK && window.ApperSDK.ApperFileUploader) break;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!window.ApperSDK || !window.ApperSDK.ApperFileUploader) {
          throw new Error('ApperSDK not available. Please ensure the SDK script is included before this component.');
        }
        
        if (!mounted) return;
        
        const { ApperFileUploader } = window.ApperSDK;
        
        // Set element ID for the uploader
        elementIdRef.current = `file-uploader-${elementId}`;
        
        // Mount the file field with full config
        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: memoizedExistingFiles
        });
        
        mountedRef.current = true;
        
        if (mounted) {
          setIsReady(true);
          setError(null);
        }
        
      } catch (err) {
        console.error('ApperFileFieldComponent mount error:', err);
        if (mounted) {
          setError(err.message);
          setIsReady(false);
        }
      }
    };
    
    initializeSDK();
    
    // Cleanup on component unmount
    return () => {
      mounted = false;
      try {
        if (window.ApperSDK?.ApperFileUploader && mountedRef.current && elementIdRef.current) {
          window.ApperSDK.ApperFileUploader.FileField.unmount(elementIdRef.current);
        }
      } catch (err) {
        console.error('ApperFileFieldComponent unmount error:', err);
      } finally {
        mountedRef.current = false;
        existingFilesRef.current = [];
      }
    };
  }, [elementId]); // Only depend on elementId for initial mount
  
  // File Update Effect
  useEffect(() => {
    if (!isReady || !window.ApperSDK?.ApperFileUploader || !config?.fieldKey) return;
    
    // Deep equality check with JSON.stringify
    const currentFilesJson = JSON.stringify(memoizedExistingFiles);
    const previousFilesJson = JSON.stringify(existingFilesRef.current);
    
    if (currentFilesJson === previousFilesJson) return;
    
    try {
      const { ApperFileUploader } = window.ApperSDK;
      
      // Format detection: check for .Id vs .id property
      let filesToUpdate = memoizedExistingFiles;
      if (filesToUpdate.length > 0 && filesToUpdate[0].hasOwnProperty('Id')) {
        // Convert from API format to UI format
        filesToUpdate = ApperFileUploader.toUIFormat(filesToUpdate);
      }
      
      // Update files or clear field
      if (filesToUpdate.length > 0) {
        ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate);
      } else {
        ApperFileUploader.FileField.clearField(config.fieldKey);
      }
      
      // Update reference
      existingFilesRef.current = memoizedExistingFiles;
      
    } catch (err) {
      console.error('ApperFileFieldComponent update error:', err);
      setError(err.message);
    }
  }, [memoizedExistingFiles, isReady, config?.fieldKey]);
  
  // Error UI
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">File Upload Error</span>
        </div>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="file-uploader-container">
      {/* Loading state */}
      {!isReady && (
        <div className="flex items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading file uploader...</span>
          </div>
        </div>
      )}
      
      {/* Main container - SDK takes over when mounted */}
      <div id={elementIdRef.current} className="min-h-[120px]">
        {/* This div will be controlled by ApperSDK */}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;