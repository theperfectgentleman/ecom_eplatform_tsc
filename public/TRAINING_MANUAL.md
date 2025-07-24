# Encompass E-Platform Training Manual

## Introduction

Welcome to the Encompass E-Platform! This platform is designed to streamline patient referrals, appointment scheduling, ### 6.1. Viewing Appointments
All upcoming and past appointments are listed in a table. You can use the search bar to quickly find a specific appointment by patient name, practitioner, or title.

### 6.2. Creating a New Appointment
1.  Click the **New Appointment** button.
2.  The **Appointment Form** will appear.
3.  Fill in the required details:
    -   **Title**: A brief, descriptive title for the appointment.
    -   **Patient & Practitioner**: Select the patient and practitioner from the dropdown lists.
    -   **Start and End Time**: Choose the date and time for the appointment.
    -   **Region & District**: Specify the location for the appointment.
4.  Click **Submit** to save the appointment.

### 6.3. Editing or Deleting an Appointmentnagement for healthcare professionals. Its goal is to provide a simple, efficient, and user-friendly experience for midwives, doctors, nurses, and administrators.

This manual will guide you through the essential features of the platform, from logging in for the first time to managing complex workflows.

**Who is this manual for?**
This guide is intended for all users of the platform, including:
-   **Healthcare Staff** (Midwives, Doctors, Nurses, CHVs) who will handle patient referrals and appointments.
-   **System Administrators** who will manage user accounts and system settings.

---

## 1. Getting Started

### 1.1. Accessing the Platform
To access the Encompass E-Platform, open your web browser (like Chrome, Firefox, or Edge) and navigate to the URL provided by your administrator.

### 1.2. Logging In
When you first visit the platform, you will see the login page.

![Login Page](/img/login.png)
*Image: The login screen.*

1.  Enter your **Username** and **Password** in the respective fields.
2.  Click the **Login** button.

If you have forgotten your password, please contact your system administrator to have it reset.

### 1.3. The Main Dashboard
After logging in, you will land on the main **Dashboard**. This is your central hub for at-a-glance information about recent activity on the platform.

---

## 2. User Types and Permissions System

The Encompass E-Platform uses a comprehensive role-based access control system to ensure users only see and access features appropriate to their role and responsibilities.

### 2.1. User Types Overview

The platform supports five distinct user types, each with specific permissions and access rights:

#### **Volunteer**
- **Primary Access**: Profile management (password changes) and User Guide only
- **Dashboard Access**: Limited - can view basic dashboard but automatically redirected to User Guide upon login
- **Purpose**: New users or community volunteers who need basic platform orientation
- **Note**: Users with unrecognized or invalid user types are also automatically treated as volunteers and redirected to this guide

#### **Clinician**
- **Full Access**: Dashboard, Referrals, Appointments, Address Book, Reports, Feedback, User Guide
- **Capabilities**: Can create, edit, and manage patients, cases, appointments, and referrals
- **Purpose**: Healthcare practitioners (doctors, nurses, midwives, CHVs) providing direct patient care

#### **Telemedicine**
- **Full Read/Write Access**: All pages except Admin
- **Special Permissions**: Complete access to Address Book, Appointments, and Referrals with create, edit, and delete capabilities
- **Purpose**: Remote healthcare specialists providing telemedicine services

#### **Management**
- **Broad Access**: All clinical features with enhanced viewing and editing permissions
- **Limitations**: Cannot delete records or access admin functions
- **Purpose**: Healthcare supervisors and team leaders overseeing clinical operations

#### **Admin**
- **Complete System Access**: All features including exclusive access to user management
- **Unique Access**: Only Admins can access the Admin page for user account management
- **Purpose**: System administrators managing the platform and user accounts

### 2.2. Feature Access Matrix

| Feature | Volunteer | Clinician | Telemedicine | Management | Admin |
|---------|-----------|-----------|--------------|------------|--------|
| Dashboard | View Only* | Full Access | Full Access | Full Access | Full Access |
| Referrals | ❌ | Create/Edit | **Full Access*** | Create/Edit | Full Access |
| Appointments | ❌ | Create/Edit | **Full Access*** | Create/Edit | Full Access |
| Address Book | ❌ | View Only | **Full Access*** | Edit Only | Full Access |
| Reports | ❌ | View Only | View Only | View Only | Full Access |
| Admin Panel | ❌ | ❌ | ❌ | ❌ | ✅ Exclusive |
| User Guide | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile/Password | ✅ | ✅ | ✅ | ✅ | ✅ |

*Volunteers are automatically redirected to User Guide upon login  
**Telemedicine users have the most comprehensive access with full create, read, update, and delete permissions

### 2.3. Navigation and UI Behavior

- **Dynamic Menus**: Navigation menus automatically show only the features you have permission to access
- **Auto-Routing**: The system automatically routes you to appropriate pages based on your user type
- **Permission Gates**: Buttons and actions are hidden if you don't have permission to use them

---

## 3. Access Levels and Data Filtering

The platform uses geographic access levels to control what data users can see, ensuring proper data privacy and relevant information display.

### 3.1. Access Level Hierarchy

The system supports five hierarchical access levels:

1. **Community** (Level 0) - Lowest level, specific community/village
2. **Subdistrict** (Level 1) - Collection of communities  
3. **District** (Level 2) - Administrative district
4. **Region** (Level 3) - Regional authority
5. **National** (Level 4) - Highest level, entire country

### 3.2. Data Filtering Rules

**How Data Filtering Works:**
- Users can only see data from their assigned geographic area and below
- A Regional user (Level 3) can see data from their region and all districts, subdistricts, and communities within it
- A District user (Level 2) can only see data from their district and communities within it
- Community users (Level 0) see only data from their specific community

**Examples:**
- **Regional Manager**: Can view referrals, appointments, and contacts from all districts in their region
- **District Coordinator**: Can view data from all health facilities and communities in their district only
- **Community Health Worker**: Can only see patients and appointments from their specific community

### 3.3. User Type vs. Access Level

**Important Distinction:**
- **User Type** determines **what features** you can access (which pages, what actions)
- **Access Level** determines **what data** you can see within those features

**Example Scenarios:**
- A **Clinician** with **District** access can use all clinical features but only see patients from their district
- A **Telemedicine** specialist with **National** access can use all features and see data from the entire country
- An **Admin** with **Regional** access can manage user accounts but only for users in their region

---

## 4. The Dashboard

The Dashboard provides a high-level overview of key metrics and trends.

![Dashboard View](/img/dashboard.png)
*Image: The main dashboard.*

-   **Statistics Cards**: At the top, you will find cards showing total referrals, appointments, patients, and active users.
-   **Referral Trends**: A chart displays the number of referrals over time, helping you visualize trends.
-   **Region & District Filtering**: You can filter the dashboard analytics by a specific **Region** or **District** using the dropdown menus. This will update the charts and statistics to reflect data only from the selected area.

---

## 5. Managing Referrals

The **Referral** page is where you can view, create, and manage all patient referrals.

![Referral Page](/img/referral.png)
*Image: The referral management page.*

### 5.1. Viewing Existing Referrals
All referrals are listed in the **Case Table**. You can search for a specific referral using the search bar at the top of the table.

### 5.2. Creating a New Referral
1.  Click the **Create Referral** button on the top right of the Referral page.
2.  This will open the **Referral Form**.

### 5.3. Filling out the Referral Form
The form is divided into several sections. Please fill out each field with the required information.

-   **Patient Information**: Details about the patient being referred.
-   **Referral Details**: Information about the reason for the referral, priority, and referring practitioner.
-   **Service & Location**: Specify the required service and the patient's location. The **District** field will automatically populate based on the selected **Region**.

Once you have completed the form, click the **Submit Referral** button.

---

## 6. Managing Appointments

The **Appointments** page allows you to schedule and manage all patient and practitioner meetings.

![Appointments Page](/img/appointment.png)
*Image: The appointments page.*

### 4.1. Viewing Appointments
All upcoming and past appointments are listed in a table. You can use the search bar to quickly find a specific appointment by patient name, practitioner, or title.

### 4.2. Creating a New Appointment
1.  Click the **New Appointment** button.
2.  The **Appointment Form** will appear.
3.  Fill in the required details:
    -   **Title**: A brief, descriptive title for the appointment.
    -   **Patient & Practitioner**: Select the patient and practitioner from the dropdown lists.
    -   **Start and End Time**: Choose the date and time for the appointment.
    -   **Region & District**: Specify the location for the appointment.
4.  Click **Submit** to save the appointment.

### 4.3. Editing or Deleting an Appointment
-   To **edit** an appointment, click the **Edit** button (with the pencil icon) in the corresponding row.
-   To **delete** an appointment, click the **Delete** button (with the trash icon).

---

## 7. Using the Address Book

The **Address Book** is a central directory of all your contacts, including practitioners, specialists, and other staff.

![Address Book Page](/img/address.png)
*Image: The address book.*

### 7.1. Viewing and Searching Contacts
-   All contacts are listed in the main table.
-   Use the **Search contacts...** bar to find a contact by name, position, email, or other details.

### 7.2. Adding or Editing a Contact
1.  To add a new contact, click the **Create Contact** button.
2.  To edit an existing one, click the **Edit** button in the contact's row.
3.  A form will appear. Fill in the contact's details.
4.  Click **Submit** to save the changes.

---

## 8. System Administration (For Administrators Only)

This section is for users with **Admin** privileges. The **Admin** page is where you manage all user accounts in the system.

![Admin Page](/img/admin.png)
*Image: The user administration page.*

### 8.1. Understanding User Types in Administration

When creating or editing user accounts, you'll assign both a **User Type** and **Access Level**:

**Available User Types:**
- **Volunteer**: New users, basic access to guide and profile only
- **Clinician**: Healthcare practitioners with full clinical feature access
- **Telemedicine**: Remote specialists with comprehensive read/write access
- **Management**: Supervisors with broad access but limited deletion rights
- **Admin**: System administrators with complete platform control

**Best Practices:**
- Start new users as **Volunteers** until they complete training
- Assign **Clinician** type to direct care providers
- Use **Telemedicine** for remote specialists who need comprehensive access
- Limit **Admin** accounts to essential personnel only

### 8.2. Managing User Accounts
The table on the Admin page lists all users. You can filter users by **Role** or **Access Level** using the dropdowns, or search for a user by name or email.

### 8.3. Creating a New User
1.  Click the **Create User** button.
2.  Fill out the **User Form** with the new user's details:
    -   **User Type**: Choose from Volunteer, Clinician, Telemedicine, Management, or Admin
    -   **Access Level**: Set geographic scope (Community, Subdistrict, District, Region, National)
    -   **Contact Information**: Username, name, email, phone
    -   **Location**: Assign appropriate region, district, subdistrict, and community
3.  Set a temporary password for the user.
4.  Click **Submit**. The new user will now be able to log in.

### 8.4. Editing a User
Click the **Edit** button (pencil icon) next to any user to open the form and modify their details, including changing their user type or access level.

### 8.5. Resetting a User's Password
If a user forgets their password, you can reset it for them:
1.  Find the user in the list.
2.  Click the **Reset Password** button (key icon).
3.  A modal will appear where you can enter and confirm a new password for the user.
4.  Click **Reset Password** to confirm.

### 8.6. Deleting a User
To permanently remove a user from the system, click the **Delete** button (trash icon) in their row.

---

## 9. Troubleshooting & Support

### 9.1. Permission and Access Issues

**Issue: I can't see certain menu items or pages.**
-   **Solution**: This is normal behavior. Your user type determines which features you can access. Contact your administrator if you need access to additional features.

**Issue: I'm automatically redirected to the User Guide when I log in.**
-   **Solution**: You have a Volunteer user type or an unrecognized user type. Volunteers are automatically directed to the User Guide for training. Contact your administrator to update your user type once training is complete.

**Issue: I can't see data from other regions/districts.**
-   **Solution**: Your access level limits what geographic data you can view. This is by design for data privacy and relevance. If you need broader access, contact your administrator.

**Issue: I can access a page but can't edit or delete items.**
-   **Solution**: Your user type may have view-only permissions for that feature. Check the permissions matrix in Section 2.2 or contact your administrator.

### 9.2. General Technical Issues

**Issue: I can't log in.**
-   Solution: Double-check that your username and password are correct. If you continue to have issues, contact your system administrator to reset your password.

**Issue: Changes I made aren't showing up.**
-   Solution: Try refreshing the page. If the issue persists, you may not have permission to make that type of change, or there may be a system issue.

**For further assistance, please contact the Encompass IT support team at:**
-   **Email**: support@encompas.org
-   **Phone**: 0244847831


### Downloading the Preg App

To download the mobile application, please visit the download page.

[Download Preg App](/download)

