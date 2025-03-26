import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { registerUser, editUser, getRoles, getAllUsers } from "../lib/api";
import Swal from "sweetalert2";
import "../styles/users.css";
import { IoArrowBack } from "react-icons/io5";

const roleLevels = {
  "Super Admin": 1,
  "Account Manager": 2,
  "Sr. Designer": 3,
  "Designer": 4,
  "Intern": 5,
};

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const createdBYId = JSON.parse(localStorage.getItem("user"));
  const defaultUserState = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobileNumber: "",
    userRole: "",
    status: "active",
    createdBy: createdBYId?.user.id,
    roleId: null
  };
  const [newUser, setNewUser] = useState(defaultUserState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchUsersAndSetForm();
    }
    fetchRoles();
  }, [id]);

  const fetchUsersAndSetForm = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      const user = data.find((u) => u.id === parseInt(id));
      if (user) {
        setNewUser({ ...user, password: "" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    const response = await getRoles();
    const allRoles = response.data;
    const userRole = createdBYId.user.userRole;
    const userLevel = roleLevels[userRole];

    const filteredRoles = allRoles.filter(
      (role) =>
        role.createdBy === createdBYId.user.id ||
        (role.defaultPermissionLevel > userLevel &&
          role.defaultPermissionLevel == 6) ||
        (userRole === "Super Admin" && role.title === "Super Admin")
    );

    setAvailableRoles(filteredRoles);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;
    const passwordRegex = /^[A-Za-z0-9]{6}$/;

    switch (name) {
      case "firstName":
        newErrors.firstName = !value
          ? "First Name is required"
          : !nameRegex.test(value)
            ? "First Name must contain only letters"
            : "";
        break;
      case "lastName":
        newErrors.lastName = !value
          ? "Last Name is required"
          : !nameRegex.test(value)
            ? "Last Name must contain only letters"
            : "";
        break;
      case "email":
        newErrors.email = !value
          ? "Email is required"
          : !emailRegex.test(value)
            ? "Enter a valid email address"
            : "";
        break;
      case "mobileNumber":
        newErrors.mobileNumber = !value
          ? "Mobile Number is required"
          : !mobileRegex.test(value)
            ? "Enter a valid 10-digit number"
            : "";
        break;
      case "password":
        if (!isEditMode) {
          newErrors.password = !value
            ? "Password is required"
            : !passwordRegex.test(value)
              ? "Password must be 6 alphanumeric characters"
              : "";
        }
        break;
      case "userRole":
        newErrors.userRole = !value ? "Role is required" : "";
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "userRole") {
      const selectedRole = availableRoles.find((role) => role.title === value);
      setNewUser((prev) => ({
        ...prev,
        userRole: value,
        roleId: selectedRole ? selectedRole.id : null,
      }));
    } else {
      setNewUser((prev) => ({ ...prev, [name]: value }));
    }

    validateField(name, value);
  };

  const validateForm = (user) => {
    const fields = ["firstName", "lastName", "email", "mobileNumber", "userRole"];
    if (!isEditMode) fields.push("password");
    fields.forEach((field) => validateField(field, user[field]));

    return Object.values(errors).some((error) => error !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = validateForm(newUser);
    if (hasErrors) return;

    try {
      setLoading(true);
      if (isEditMode) {
        await editUser(id, newUser);
        Swal.fire("Success", "User updated successfully!", "success");
      } else {
        await registerUser(newUser);
        Swal.fire("Success", "User added successfully!", "success");
      }
      navigate("/users");
    } catch (err) {
      console.log(err.message, '111111111111')
      Swal.fire("Error", err.message || "Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="user-form-wrapper">
        {loading && (
          <div className="loader-overlay">
            <div className="loader"></div>
          </div>
        )}
        <div className="form-header">
          <button className="back-btn" onClick={() => navigate(-1)}><IoArrowBack /></button>
          <h2 className="form-title">{isEditMode ? "Edit User" : "Add User"}</h2>
        </div>

        <form className="form-container user-form" onSubmit={handleSubmit}>
          <div className="form-roww">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={newUser.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <p className="error">{errors.firstName}</p>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={newUser.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <p className="error">{errors.lastName}</p>}
            </div>
          </div>

          <div className="form-roww">
            <div className="form-group full-width">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newUser.email}
                onChange={handleChange}
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>
          </div>

          {!isEditMode && (
            <div className="form-roww">
              <div className="form-group full-width">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={handleChange}
                  maxLength={6}
                />
                {errors.password && <p className="error">{errors.password}</p>}
              </div>
            </div>
          )}

          <div className="form-roww">
            <div className="form-group full-width">
              <label>Mobile Number</label>
              <input
                type="text"
                name="mobileNumber"
                placeholder="Mobile Number"
                value={newUser.mobileNumber}
                onChange={handleChange}
                maxLength={10}
              />
              {errors.mobileNumber && <p className="error">{errors.mobileNumber}</p>}
            </div>
          </div>

          <div className="form-roww">
            <div className="form-group">
              <label>Select a Role</label>
              <select
                name="userRole"
                value={newUser.userRole}
                onChange={handleChange}
              >
                <option value="">Select a Role</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.title}>
                    {role.title}
                  </option>
                ))}
              </select>
              {errors.userRole && <p className="error">{errors.userRole}</p>}
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={newUser.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {isEditMode ? "Update User" : "Add User"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default UserForm;
