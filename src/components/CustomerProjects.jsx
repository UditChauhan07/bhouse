import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAllUsers } from '../lib/api';


function CustomerProjects({ customerName }) {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectRes = await axios.get('http://localhost:5000/api/projects');
                const userRes = await getAllUsers();
                
                const filteredProjects = projectRes.data.filter(
                    project => project.clientName.toLowerCase() === customerName.toLowerCase()
                );

                setUsers(userRes);
                setProjects(filteredProjects);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();
    }, [customerName]);

    // Function to get user's full name from ID
    const getUserFullName = (userId) => {
        const user = users.find(user => user.id === userId);
        return user ? `${user.firstName} ${user.lastName}` : null;
    };

    return (
        <div className="customer-projects-container">
            <h2>Projects for {customerName}</h2>

            {projects.length > 0 ? (
                projects.map(project => (
                    <div key={project.id} className="project-card">
                        <h3 className="project-title">{project.name}</h3>
                        <p className="project-info"><strong>Type:</strong> {project.type}</p>
                        <p className="project-info"><strong>Description:</strong> {project.description}</p>
                        <p className="project-info"><strong>Start Date:</strong> {new Date(project.startDate).toDateString()}</p>
                        <p className="project-info"><strong>Estimated Completion:</strong> {new Date(project.estimatedCompletion).toDateString()}</p>
                        <p className="project-info"><strong>Total Value:</strong> ₹{project.totalValue}</p>
                        <p className="project-info"><strong>Delivery Address:</strong> {project.deliveryAddress}</p>

                        {/* Status Badge */}
                        <p className={`project-status status-${project.status.toLowerCase().replace(/\s/g, '')}`}>
                            Status: {project.status}
                        </p>

                        {/* Assigned Roles */}
                        <div className="assigned-roles">
                            <strong>Assigned Roles:</strong>
                            {project.assignedTeamRoles.map((role, index) => {
                                const validUsers = role.users.map(userId => getUserFullName(userId)).filter(Boolean);

                                // Hide roles that have no valid users
                                if (validUsers.length === 0) return null;

                                return (
                                    <div key={index} className="role-container">
                                        <span className="role-title">{role.role}:</span>
                                        {validUsers.map((userName, idx) => (
                                            <span key={idx} className="user-name">{userName}</span>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            ) : (
                <p>No projects found for this customer.</p>
            )}
        </div>
    );
}

export default CustomerProjects;
