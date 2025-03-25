import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import '../../styles/Projects/project.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';  

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/getAllUsers');
      setAllUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };
  fetchUsers();
}, []);
const getAssignedUserNames = (assignedTeamRoles) => {
  if (!Array.isArray(assignedTeamRoles)) return "";

  const userMap = {};
  allUsers.forEach(user => {
    userMap[user.id] = `${user.firstName} ${user.lastName}`;
  });

  return assignedTeamRoles
    .flatMap(roleEntry =>
      Array.isArray(roleEntry.users)
        ? roleEntry.users.map(userId => userMap[userId] || `User ID: ${userId}`)
        : []
    )
    .join(", ");
};

    useEffect(() => {
      // Fetch data from API
      const fetchProjects = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/projects');
          setProjects(response.data);
          setFilteredProjects(response.data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching projects", error);
        }
      };
  
      fetchProjects();
    }, []);
  
    const handleSearch = (event) => {
      setSearchQuery(event.target.value);
      if (event.target.value === "") {
        setFilteredProjects(projects);
      } else {
        const filtered = projects.filter(project => 
          project.name.toLowerCase().includes(event.target.value.toLowerCase()) || 
          project.clientName.toLowerCase().includes(event.target.value.toLowerCase())
        );
        setFilteredProjects(filtered);
      }
    };
  
    const navigate = useNavigate();
    const handleViewProject = (projectId) => {
      navigate(`/project-details/${projectId}`);
    };
    const handleNewProjectClick = () => {
      navigate('/add-projects');
    };
    const handleArchivedProjectClick = () => {
        navigate('/archived-projects');
      };
      const handleEditProject = (projectId) => {
        navigate(`/edit-project/${projectId}`);
      };
    // Function to handle archiving a project
    const handleArchiveProject = async (projectId) => {
      // Show SweetAlert2 confirmation dialog
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You want to archive this project.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, archive it!'
      });

      if (result.isConfirmed) {
        try {
          // Call the API to archive the project
          const response = await axios.patch(`http://localhost:5000/api/projects/${projectId}/archive`);
          if (response.status === 200) {
            Swal.fire(
              'Archived!',
              'The project has been archived.',
              'success'
            );
            // Update the state to reflect the archived status
            setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
            setFilteredProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
          }
        } catch (error) {
          Swal.fire(
            'Error!',
            'There was an issue archiving the project.',
            'error'
          );
        }
      }
    };

    return (
      <Layout>
        <div className="projects-header">
          <h1>Projects</h1>
          <button className="archived-project-btn" onClick={handleArchivedProjectClick}>Archived Projects</button>
        </div>
        <div className="header-actions">
          <button className="new-project-btn" onClick={handleNewProjectClick}>
            New Project
          </button>
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={handleSearch} 
            className="search-bar"
          />
        </div>
  
        <div className="projects-table-container">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Client Name</th>
                  <th>Status</th>
                  <th>Assigned Team</th>
                  <th>Start Date</th>
                  <th>Estimated Completion</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td>{project.clientName}</td>
                    <td>{project.status}</td>
                    <td>{getAssignedUserNames(project.assignedTeamRoles)}</td>
                    <td>{new Date(project.startDate).toLocaleDateString()}</td>
                    <td>{new Date(project.estimatedCompletion).toLocaleDateString()}</td>
                    <td className="actions">
                      <button className="action-btn edit"onClick={() => handleEditProject(project.id)}>
                        <i className="fas fa-edit"></i> 
                      </button>
                      <button className="action-btn view" onClick={() => handleViewProject(project.id)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleArchiveProject(project.id)} 
                      >
                        <i className="fas fa-archive"></i>  
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Layout>
    );
  };
  
export default Projects;
