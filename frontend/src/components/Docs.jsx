import React from 'react';
import './Docs.css';

const Docs = () => {
    return (
        <>
            <div className="docs-header">
                <h2>Document Viewer</h2>
            </div>
            <iframe 
                className="large-iframe"
                src="https://docs.google.com/document/d/1inG2Q_kf-yLEY7_CLJN7EZXBjsjHYJljm-dNx2leeC8/edit?usp=sharing" 
                title="Document Viewer"
            ></iframe>
            <div className="docs-footer">
                <p>Use the navigation above to explore more documents.</p>
            </div>
        </>
    );
};

export default Docs;