import { FiHome, FiUsers, FiSettings, FiUser } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components.css';
import { CiLogout } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AiFillProject } from 'react-icons/ai';
import { FaUserCircle } from "react-icons/fa";
import { useSidebarPermissions } from '../context/RolePermissionsContext';
import { IoGitPullRequestSharp } from 'react-icons/io5';
import { deleteFcmToken } from '../utils/deleteFcmToken';
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { rolePermissions, loading, resetPermissions } = useSidebarPermissions();
  const user = JSON.parse(localStorage.getItem('user'));
  const handleLogout = async() => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Logout!",
    }).then(async(result) => {
      if (result.isConfirmed) {

        localStorage.removeItem('user');
        localStorage.removeItem("addProjectStep");
        localStorage.removeItem("addProjectFormData");
        localStorage.removeItem("addProjectLeadMatrix");

       await deleteFcmToken(user?.user?.id)
        setTimeout(() => {
          localStorage.removeItem('user');
        }, 2000);


        navigate('/');
      }
    });
  };
  // Check only 'view' permissions for visibility
  const canViewUsers = rolePermissions?.UserManagement?.view;
  const canViewRoles = rolePermissions?.Roles?.view;

  const canViewCustomers = rolePermissions?.Customer?.view;
  const canViewProjects = rolePermissions?.ProjectManagement.view
  return (
    <div className="sidebar">
      {rolePermissions ? <>    <div className="logo">Hi, {user?.user?.firstName || 'User'}</div>
        <ul>
          <li className={location.pathname === '/dashboard' ? 'active' : ''}>
            <Link to="/dashboard"><FiHome /> Dashboard</Link>
          </li>

          {loading || canViewUsers ? (
            <li className={location.pathname === '/users' ? 'active' : ''}>
              <Link to="/users"><FiUsers /> Users</Link>
            </li>
          ) : null}

          {/* <li className={location.pathname === '/profile' ? 'active' : ''}>
          <Link to="/profile"><FiUser /> Profile</Link>
        </li> */}

          {loading || canViewRoles ? (
            <li className={location.pathname === '/roles' ? 'active' : ''}>
              <Link to="/roles"><FiUser /> Roles</Link>
            </li>
          ) : null}

          {loading || canViewProjects ? (
            <li className={location.pathname === '/projects' ? 'active' : ''}>
              <Link to="/projects"><AiFillProject /> Projects</Link>
            </li>
          ) : null}

          {loading || canViewCustomers ? (
            <li className={location.pathname === '/customers' ? 'active' : ''}>
              <Link to="/customers"><FaUserCircle /> Customers</Link>
            </li>
          ) : null}

          <li className={location.pathname === '/requested_customer' ? 'active' : ''}>
            <Link to="/requested_customer"><IoGitPullRequestSharp />Requested Customers</Link>
          </li>

{/* 
          <li className={location.pathname === '/settings' ? 'active' : ''}>
            <Link to="/settings"><FiSettings /> Settings</Link>
          </li> */}

          <li onClick={handleLogout}>
            <Link><CiLogout /> Logout</Link>
          </li>
        </ul></> : null}

    </div>
  );
};

export default Sidebar;
