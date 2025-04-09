import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url, url2 } from '../../lib/api';
import Layout from '../../components/Layout';
import { FaArrowLeft } from 'react-icons/fa';
import '../../styles/Projects/FileCommentsPage.css'; 
import Offcanvas from '../../components/OffCanvas/OffCanvas';
import { FaTelegramPlane } from 'react-icons/fa';
const FileCommentsPage = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { filePath, category } = location.state;
 

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const storedUser = localStorage.getItem('user'); 
const userId = storedUser ? JSON.parse(storedUser).user.id : null;
  const fetchComments = async () => {
    try {
      const res = await axios.get(`${url}/projects/${projectId}/file-comments`, {
        params: { filePath }
      });
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleSubmit = async () => {
    if (!comment || !userId) return alert("Comment or User ID missing");

    try {
      await axios.post(`${url}/projects/${projectId}/file-comments`, {
        filePath,
        category,
        comment,
        userId
      });
      setComment('');
      fetchComments();
    } catch (err) {
      console.error("Failed to submit comment:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(true);

  const openOffcanvas = () => {
    setIsOffcanvasOpen(true);
  };

  const closeOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };
  const groupedComments = {}; // To group comments by date

comments.forEach((comment) => {
  const commentDate = new Date(comment.createdAt).toLocaleDateString();
  if (!groupedComments[commentDate]) {
    groupedComments[commentDate] = [];
  }
  groupedComments[commentDate].push(comment);
});

  return (
    <Layout>
    <div className="file-comments-split-container">
      <div className={isOffcanvasOpen ? "left-panel" : "left-panel2"}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> 
        </button>
        <h2 className="title">File Preview</h2>
  
        <div className="file-preview">
          {filePath.endsWith('.pdf') ? (
            <iframe src={`${url2}/${filePath}`} title="File Preview" className="preview-frame" />
          ) : (
            <img src={`${url2}/${filePath}`} alt="File Preview" className="preview-img" />
          )}
        </div>
      </div>
      <button className='view-doc' onClick={openOffcanvas}>View Comments</button>
      <Offcanvas isOpen={isOffcanvasOpen} closeOffcanvas={closeOffcanvas} getLatestComment={fetchComments} > 
      <div className="right-panel">
  <div className="comments-list">
    {Object.keys(groupedComments).map((date) => (
      <div key={date}>
        <p className="whatsapp-comment-date">{date}</p> {/* Date appears only once */}
        
        {groupedComments[date].map((c) => (
          <div key={c.id} className="whatsapp-comment-box">
            <div className="whatsapp-comment-user-info">
              <img
                src={c.user?.profileImage ? `${url2}/${c.user.profileImage}` : `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`}
                alt="User"
                className="whatsapp-comment-user-avatar"
              />
              <div>
                <p className="whatsapp-comment-author">{c.user?.firstName}   {c.customer?.full_name} <span className='comment-user-role'>({c.user?.userRole  ? c.user?.userRole : "Customer" })</span></p>
              </div>
            </div>

            <p className="whatsapp-comment-text">{c.comment}</p>

            <p className="whatsapp-comment-meta">{new Date(c.createdAt).toLocaleTimeString()}</p> {/* Time is displayed below comment */}
          </div>
        ))}
      </div>
    ))}
  </div>

  
</div>
<div className="whatsapp-comment-form">
    <textarea
      placeholder="Write your comment..."
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      className="whatsapp-comment-input"
    />
    <button onClick={handleSubmit} className="whatsapp-submit-btn">
      <FaTelegramPlane />
    </button>
  </div>
      </Offcanvas>

    </div>
  </Layout>
  
  );
};

export default FileCommentsPage;
