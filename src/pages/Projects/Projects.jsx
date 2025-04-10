import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import '../../styles/Projects/project.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useRolePermissions from '../../hooks/useRolePermissions';
import { url } from '../../lib/api';
import Loader from '../../components/Loader'
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const localData = JSON.parse(localStorage.getItem('user'));
  const userRole = localData?.user?.userRole;
  const roleId = localData?.user?.roleId;
  const [sortOrder, setSortOrder] = useState("default");

  const { rolePermissions } = useRolePermissions(roleId);
  const canCreate = rolePermissions?.ProjectManagement?.create;
  const canEdit = rolePermissions?.ProjectManagement?.edit;
  const canDelete = rolePermissions?.ProjectManagement?.delete;
  const canView = rolePermissions?.ProjectManagement?.view;
  const getStatusClass = (status) => {
    switch (status) {
      case "In Progress": return "badge in-progress";
      case "Delivered to Warehouse": return "badge warehouse";
      case "Installed": return "badge installed";
      case "Completed": return "badge completed";
      case "Proposal": return "badge proposal";
      default: return "badge default";
    }
  };
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${url}/auth/getAllUsers`);
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
    if(allUsers){
      allUsers?.forEach(user => {
        userMap[user.id] = `${user.firstName} ${user.lastName}`;
      });
    }
   

    return assignedTeamRoles
      .flatMap(roleEntry =>
        Array.isArray(roleEntry.users)
          ? roleEntry.users.map(userId => userMap[userId] || `User ID: ${userId}`)
          : []
      )
      .join(", ");
  };
console.log(getAssignedUserNames())

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${url}/projects`);
        const allProjects = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const localData = JSON.parse(localStorage.getItem('user'));
        const userData = localData?.user;
    
        if (!userData) {
          console.log("No user data found in localStorage");
          setProjects([]);
          setFilteredProjects([]);
          setLoading(false);
          return;
        }
    
        const userId = userData.id;
        const userRole = userData.userRole;
    
        let visibleProjects = [];
    
        if (userRole === "Super Admin" || userRole === "Admin") {
          visibleProjects = allProjects;
        } else {
          visibleProjects = allProjects.filter(project => {
            return project.assignedTeamRoles?.some(role =>
              Array.isArray(role.users) && role.users.includes(userId)
            );
          });
        }
    
        visibleProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
setProjects(visibleProjects);
setFilteredProjects(visibleProjects);

        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching projects", error);
        setLoading(false);
      }
    };
    

    fetchProjects();
  }, []);

  const sortAndSetProjects = (list, order) => {
    let sorted = [...list];
  
    if (order === "atoz") {
      sorted.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    } else if (order === "ztoa") {
      sorted.sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()));
    } else {
      // default: sort by createdAt descending (latest first)
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  
    setFilteredProjects(sorted);
  };
  
  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
  
    let filtered = [...projects];
  
    if (query) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.clientName.toLowerCase().includes(query.toLowerCase())
      );
    }
  
    sortAndSetProjects(filtered, sortOrder);
  };
  useEffect(() => {
    sortAndSetProjects(filteredProjects, sortOrder);
  }, [sortOrder]);
  

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
        const response = await axios.patch(`${url}/projects/${projectId}/archive`);
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
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const response = await axios.put(`${url}/projects/${projectId}`, { status: newStatus });
      if (response.status === 200) {
        setProjects(prev =>
          prev.map(p => (p.id === projectId ? { ...p, status: newStatus } : p))
        );
        setFilteredProjects(prev =>
          prev.map(p => (p.id === projectId ? { ...p, status: newStatus } : p))
        );
        Swal.fire("Status updated!");
      }
    } catch (error) {
      console.error("Error updating status", error);
      Swal.fire("Failed to update status");
    }
  };
  
  return (
    <Layout>
      <div className="roles-container">
        <div className='project-first-header'>
        <h2 >Projects</h2>
       
        {canCreate && (
          <button className="add-user-btn" onClick={handleArchivedProjectClick}>
            Archived Projects
          </button>
        )}
        </div>
      
      
       
      
      <div className="user-roles-header">
        {canCreate && (
          <button className="add-user-btn" onClick={handleNewProjectClick}>
           Add Project
          </button>
        )}
        <div className="user-roles-headerb">
<select
  className="user-sort-input"
  value={sortOrder}
  onChange={(e) => setSortOrder(e.target.value)}
>
  <option value="default">Sort: Latest First</option>
  <option value="atoz">Sort A - Z</option>
  <option value="ztoa">Sort Z - A</option>
</select>

        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={handleSearch}
          className="user-search-input"
        />
      </div>
</div>
      <div className="roles-table">
        {loading ? (
            <Loader/>
        ) : (
          <table className="projects-table">
            <thead>
              <tr>
              <th>Sr No</th>
                <th>Project Name</th>
                <th>Client Name</th>
                <th>Status</th>
                <th>Assigned Team</th>
                <th>Type</th>
                <th>Estimated Completion</th>
                {(canEdit || canDelete || canView) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length ? <>
                { filteredProjects.map((project , index) => (
                <tr key={project.id}>
                  <td>{index+1}</td>
                  <td>{project.name}</td>
                  <td>{project.clientName}</td>
                  <td>
  <select
    className={getStatusClass(project.status)}
    value={project.status}
    onChange={(e) => handleStatusChange(project.id, e.target.value)}
  >
    <option value="In progress">In progress</option>
    <option value="Aproved">Aproved</option>
    <option value="Waiting on Advance">Waiting on Advance</option>
    <option value="Advance Paid">Advance Paid</option>
    <option value="Order Processed">Order Processed</option>
    <option value="Arrived">Arrived</option>
    <option value="Delivered">Delivered</option>
    <option value="Installed">Installed</option>
    <option value="Punch">Punch</option>
    <option value="Completed">Balance Owed</option>
  </select>
</td>

                  <td>{getAssignedUserNames(project.assignedTeamRoles)}</td>
                  <td>{project.type}</td>
                  <td>{new Date(project.estimatedCompletion).toLocaleDateString()}</td>
                  <td className="actions">
                    {canEdit && (
                    
                      <FaEdit  
                      style={{
                        color: "#004680" , 
                        fontSize : "22px" , 
                         cursor: "pointer"
                      }}
                        title="Edit"
                        onClick={() => handleEditProject(project.id)}
                      />
                    )}

                    {canView && (
                     
                      <FaEye
                      style={{
                        color: "#004680" , 
                        fontSize : "22px" , 
                         cursor: "pointer"
                      }}
                        title="View"
                        onClick={() => handleViewProject(project.id)}
                      />
                    )}

                    {canDelete && (
                    <FaTrash 
                    style={{
                      color: "#004680" , 
                      fontSize : "20px",
                      cursor: "pointer"
                    }}
                      title="Delete"
                      onClick={() => handleArchiveProject(project.id)}
                    />
                    
                    )}
                  </td>

                </tr>
              ))}
              </> :  <td colSpan="7" style={{ textAlign: "center" }}>No Project found</td> }
              
            </tbody>
          </table>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default Projects;
