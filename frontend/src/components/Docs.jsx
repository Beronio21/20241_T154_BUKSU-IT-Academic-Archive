import React, { useState } from 'react';
import useDrivePicker from 'react-google-drive-picker';


const Docs = () => {
    const [docSrc, setDocSrc] = useState("https://drive.google.com/start/apps");
    const [openPicker] = useDrivePicker();

    const handleOpenPicker = () => {
        openPicker({
            clientId: "736065879191-hhi3tmfi3ftr54m6r37ilftckkbcojsb.apps.googleusercontent.com",
            developerKey: "AIzaSyBefZhoxSibx9ORWrmhrH3I8L_Cz1OB33E",
            viewId: "DOCS",
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: false,
            callbackFunction: (data) => {
                if (data.action === 'picked') {
                    const docUrl = data.docs[0].url;
                    setDocSrc(docUrl);
                }
            },
        });
    };

    return (
        <>
            <div className="docs-header">
                <h2>Document Viewer</h2>
                <button 
                    type="button" 
                    onClick={handleOpenPicker}
                    className="btn btn-primary mt-2"
                >
                    Select from Google Drive
                </button>
            </div>
            <iframe 
                className="large-iframe"
                style={{ width: '2000px', height: '900px' }}
                src={docSrc} 
                title="Document Viewer"
            ></iframe>
            <div className="docs-footer">
                <p>Use the navigation above to explore more documents.</p>
            </div>
        </>
    );
};

export default Docs;